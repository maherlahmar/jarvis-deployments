import { useState, useMemo } from 'react'
import { Search, Filter, Package, AlertTriangle, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import useStore from '../store/useStore'

export default function ProductDependencies() {
  const productComponents = useStore(function(state) { return state.productComponents })
  const suppliers = useStore(function(state) { return state.suppliers })
  const riskData = useStore(function(state) { return state.riskData })
  
  const [search, setSearch] = useState('')
  const [filterCriticality, setFilterCriticality] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const supplierMap = useMemo(function() {
    const map = {}
    suppliers.forEach(function(s) {
      map[s.supplier_id] = s
    })
    return map
  }, [suppliers])

  const riskMap = useMemo(function() {
    const map = {}
    riskData.forEach(function(r) {
      map[r.supplier_id] = r
    })
    return map
  }, [riskData])

  const productData = useMemo(function() {
    const products = {}
    
    productComponents.forEach(function(pc) {
      if (!products[pc.diodes_sku]) {
        products[pc.diodes_sku] = {
          sku: pc.diodes_sku,
          components: [],
          totalVolume: 0,
          criticalCount: 0,
          avgRisk: 0,
          highRiskComponents: 0
        }
      }
      
      const supplier = supplierMap[pc.supplier_id]
      const risk = riskMap[pc.supplier_id]
      
      products[pc.diodes_sku].components.push({
        ...pc,
        supplier: supplier,
        risk: risk
      })
      
      products[pc.diodes_sku].totalVolume += pc.annual_volume_units
      if (pc.criticality_flag === 'High') {
        products[pc.diodes_sku].criticalCount++
      }
      
      if (risk && risk.overall_risk_score >= 0.7) {
        products[pc.diodes_sku].highRiskComponents++
      }
    })

    Object.values(products).forEach(function(product) {
      const riskyComponents = product.components.filter(function(c) { return c.risk })
      if (riskyComponents.length > 0) {
        product.avgRisk = riskyComponents.reduce(function(sum, c) {
          return sum + c.risk.overall_risk_score
        }, 0) / riskyComponents.length
      }
    })

    return Object.values(products)
  }, [productComponents, supplierMap, riskMap])

  const filteredProducts = useMemo(function() {
    return productData.filter(function(product) {
      if (filterCriticality === 'high' && product.criticalCount === 0) return false
      if (filterCriticality === 'risky' && product.highRiskComponents === 0) return false
      
      if (search) {
        return product.sku.toLowerCase().includes(search.toLowerCase())
      }
      return true
    })
  }, [productData, search, filterCriticality])

  const componentStats = useMemo(function() {
    const componentCounts = {}
    productComponents.forEach(function(pc) {
      if (!componentCounts[pc.component_name]) {
        componentCounts[pc.component_name] = { name: pc.component_name, count: 0, suppliers: new Set() }
      }
      componentCounts[pc.component_name].count++
      componentCounts[pc.component_name].suppliers.add(pc.supplier_id)
    })
    
    return Object.values(componentCounts)
      .map(function(c) {
        return { name: c.name, count: c.count, suppliers: c.suppliers.size }
      })
      .sort(function(a, b) { return b.count - a.count })
      .slice(0, 10)
  }, [productComponents])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Dependencies</h1>
          <p className="text-gray-400">Track component sourcing and supplier dependencies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Products</p>
              <p className="text-2xl font-bold text-white">{productData.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Components</p>
              <p className="text-2xl font-bold text-white">{productComponents.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">High Risk Components</p>
              <p className="text-2xl font-bold text-white">
                {productData.reduce(function(sum, p) { return sum + p.highRiskComponents }, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Components by Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={componentStats} layout="vertical">
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis type="category" dataKey="name" stroke="#9ca3af" width={180} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" fill="#3b82f6" name="Usage Count" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={function(e) { setSearch(e.target.value) }}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
          
          <select
            value={filterCriticality}
            onChange={function(e) { setFilterCriticality(e.target.value) }}
            className="input-field w-48"
          >
            <option value="">All Products</option>
            <option value="high">High Criticality Only</option>
            <option value="risky">High Risk Components</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProducts.slice(0, 12).map(function(product) {
          const isExpanded = selectedProduct === product.sku
          
          return (
            <div 
              key={product.sku} 
              className={'card p-4 cursor-pointer transition-all ' + (isExpanded ? 'ring-2 ring-primary-500' : '')}
              onClick={function() { setSelectedProduct(isExpanded ? null : product.sku) }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white">{product.sku}</h4>
                  <p className="text-sm text-gray-400">{product.components.length} components</p>
                </div>
                <div className="text-right">
                  {product.highRiskComponents > 0 && (
                    <span className="risk-badge risk-high">
                      {product.highRiskComponents} High Risk
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div className="p-2 bg-gray-700/50 rounded-lg text-center">
                  <p className="text-gray-400">Volume</p>
                  <p className="text-white font-medium">{product.totalVolume.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-gray-700/50 rounded-lg text-center">
                  <p className="text-gray-400">Critical</p>
                  <p className="text-white font-medium">{product.criticalCount}</p>
                </div>
                <div className="p-2 bg-gray-700/50 rounded-lg text-center">
                  <p className="text-gray-400">Avg Risk</p>
                  <p className={'font-medium ' + (product.avgRisk >= 0.7 ? 'text-orange-400' : 'text-green-400')}>
                    {(product.avgRisk * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-400">Components:</p>
                  {product.components.map(function(comp, idx) {
                    const riskScore = comp.risk ? comp.risk.overall_risk_score : 0
                    const riskClass = riskScore >= 0.7 ? 'text-orange-400' : riskScore >= 0.5 ? 'text-yellow-400' : 'text-green-400'
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg text-sm">
                        <div>
                          <p className="text-white">{comp.component_name}</p>
                          <p className="text-gray-400 text-xs">
                            {comp.supplier?.supplier_name || comp.supplier_id} ({comp.supplier?.site_location_country})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={'font-medium ' + riskClass}>
                            {comp.risk ? (riskScore * 100).toFixed(0) + '%' : 'N/A'}
                          </p>
                          <span className={'text-xs ' + (comp.criticality_flag === 'High' ? 'text-red-400' : 'text-gray-400')}>
                            {comp.criticality_flag}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
