import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, ChevronDown, ChevronUp, AlertTriangle, MapPin, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { getRiskColor, getRiskLabel, getTierColor, debounce } from '../utils/helpers';

function ProductCard({ product, isExpanded, onToggle }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded && !details) {
      setLoading(true);
      api.getProduct(product.sku)
        .then(data => setDetails(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isExpanded, product.sku, details]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div
        onClick={onToggle}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{product.sku}</h3>
            <p className="text-sm text-gray-400">{product.components?.length || 0} components</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`badge ${product.criticality === 'High' ? 'badge-critical' : 'badge-medium'}`}>
            {product.criticality}
          </span>
          {product.maxRisk > 0.7 && (
            <div className="flex items-center gap-1 text-orange-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Risk: {product.maxRisk.toFixed(2)}</span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-700 overflow-hidden"
          >
            {loading ? (
              <div className="p-6 flex justify-center">
                <div className="spinner"></div>
              </div>
            ) : details ? (
              <div className="p-4">
                {/* Risk Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">Max Risk Score</p>
                    <p className="text-xl font-bold" style={{ color: getRiskColor(details.riskSummary.maxRisk) }}>
                      {details.riskSummary.maxRisk.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">Avg Risk Score</p>
                    <p className="text-xl font-bold" style={{ color: getRiskColor(details.riskSummary.avgRisk) }}>
                      {details.riskSummary.avgRisk.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">Total Annual Volume</p>
                    <p className="text-xl font-bold text-white">
                      {details.riskSummary.totalVolume?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">Source Countries</p>
                    <p className="text-xl font-bold text-white">{details.riskSummary.countryCount}</p>
                  </div>
                </div>

                {/* Components Table */}
                <div className="table-container">
                  <table className="table text-sm">
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Supplier</th>
                        <th>Tier</th>
                        <th>Location</th>
                        <th>Annual Volume</th>
                        <th>Risk Score</th>
                        <th>ESG</th>
                        <th>Alternatives</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.components.map((comp, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="font-medium text-white">{comp.component_name}</span>
                          </td>
                          <td>
                            <div>
                              <p className="text-white">{comp.supplier_name}</p>
                              <p className="text-xs text-gray-500">{comp.supplier_id}</p>
                            </div>
                          </td>
                          <td>
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                              style={{
                                backgroundColor: `${getTierColor(comp.tier_level)}20`,
                                color: getTierColor(comp.tier_level)
                              }}
                            >
                              T{comp.tier_level}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span>{comp.city}, {comp.country}</span>
                            </div>
                          </td>
                          <td>{comp.annual_volume?.toLocaleString()}</td>
                          <td>
                            <span style={{ color: getRiskColor(comp.overall_risk_score) }}>
                              {comp.overall_risk_score?.toFixed(2) || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className={
                              comp.esg_audit_score >= 80 ? 'text-green-400' :
                              comp.esg_audit_score >= 70 ? 'text-yellow-400' :
                              'text-red-400'
                            }>
                              {comp.esg_audit_score || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className={
                              comp.alternative_source_count === 0 ? 'text-red-400' :
                              comp.alternative_source_count < 2 ? 'text-yellow-400' :
                              'text-green-400'
                            }>
                              {comp.alternative_source_count ?? 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Country Distribution */}
                {details.riskSummary.uniqueCountries && (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-400">Countries:</span>
                    {details.riskSummary.uniqueCountries.map(country => (
                      <span key={country} className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300">
                        {country}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400">
                Failed to load product details
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState('');
  const [expandedProduct, setExpandedProduct] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (criticalityFilter) params.criticality = criticalityFilter;
        const data = await api.getProducts(params);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchTerm, criticalityFilter]);

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  const highRiskProducts = products.filter(p => p.maxRisk > 0.7);
  const criticalProducts = products.filter(p => p.criticality === 'High');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Traceability</h1>
          <p className="text-gray-400 mt-1">
            Track components and suppliers for each product SKU
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{products.length}</p>
              <p className="text-sm text-gray-400">Total Products</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{criticalProducts.length}</p>
              <p className="text-sm text-gray-400">High Criticality</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{highRiskProducts.length}</p>
              <p className="text-sm text-gray-400">High Risk Exposure</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {products.reduce((sum, p) => sum + (p.components?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-400">Total Components</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or components..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={criticalityFilter}
            onChange={(e) => setCriticalityFilter(e.target.value)}
            className="select w-40"
          >
            <option value="">All Criticality</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
          <Package className="w-12 h-12 mb-4" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard
              key={product.sku}
              product={product}
              isExpanded={expandedProduct === product.sku}
              onToggle={() => setExpandedProduct(
                expandedProduct === product.sku ? null : product.sku
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
