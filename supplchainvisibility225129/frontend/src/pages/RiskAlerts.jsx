import { useState, useMemo } from 'react'
import { 
  AlertTriangle, 
  AlertCircle, 
  Shield, 
  TrendingUp, 
  Search,
  Filter,
  Download
} from 'lucide-react'
import useStore from '../store/useStore'

function getRiskLevel(score) {
  if (score >= 0.9) return { level: 'Critical', color: 'red', icon: AlertTriangle }
  if (score >= 0.7) return { level: 'High', color: 'orange', icon: AlertCircle }
  if (score >= 0.5) return { level: 'Medium', color: 'yellow', icon: Shield }
  return { level: 'Low', color: 'green', icon: Shield }
}

function RiskCard({ supplier, risk }) {
  const riskInfo = getRiskLevel(risk.overall_risk_score)
  const Icon = riskInfo.icon
  
  const colorClasses = {
    red: 'border-red-500/30 bg-red-500/10',
    orange: 'border-orange-500/30 bg-orange-500/10',
    yellow: 'border-yellow-500/30 bg-yellow-500/10',
    green: 'border-green-500/30 bg-green-500/10'
  }
  
  const textClasses = {
    red: 'text-red-400',
    orange: 'text-orange-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400'
  }

  return (
    <div className={'card p-4 border ' + colorClasses[riskInfo.color]}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={'p-2 rounded-lg ' + colorClasses[riskInfo.color]}>
            <Icon className={'w-5 h-5 ' + textClasses[riskInfo.color]} />
          </div>
          <div>
            <h4 className="font-semibold text-white">{supplier?.supplier_name || risk.supplier_id}</h4>
            <p className="text-sm text-gray-400">{risk.supplier_id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={'text-2xl font-bold ' + textClasses[riskInfo.color]}>
            {(risk.overall_risk_score * 100).toFixed(0)}%
          </p>
          <span className={'risk-badge risk-' + riskInfo.level.toLowerCase()}>
            {riskInfo.level}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-2 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400">Location</p>
          <p className="text-white">{risk.site_location_country}</p>
        </div>
        <div className="p-2 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400">Tier</p>
          <p className="text-white">Tier {supplier?.tier_level || 'N/A'}</p>
        </div>
        <div className="p-2 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400">Geopolitical Risk</p>
          <p className="text-white">{(risk.geopolitical_risk_index * 100).toFixed(0)}%</p>
        </div>
        <div className="p-2 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400">Natural Disaster</p>
          <p className="text-white">{(risk.natural_disaster_risk_index * 100).toFixed(0)}%</p>
        </div>
        <div className="p-2 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400">Water Scarcity</p>
          <p className="text-white">{(risk.water_scarcity_index * 100).toFixed(0)}%</p>
        </div>
        <div className="p-2 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400">Alternatives</p>
          <p className={'font-medium ' + (risk.alternative_source_count === 0 ? 'text-red-400' : 'text-white')}>
            {risk.alternative_source_count}
          </p>
        </div>
      </div>

      {risk.alternative_source_count === 0 && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Single source dependency - no alternatives available
          </p>
        </div>
      )}
    </div>
  )
}

export default function RiskAlerts() {
  const suppliers = useStore(function(state) { return state.suppliers })
  const riskData = useStore(function(state) { return state.riskData })
  
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [sortBy, setSortBy] = useState('risk')

  const supplierMap = useMemo(function() {
    const map = {}
    suppliers.forEach(function(s) {
      map[s.supplier_id] = s
    })
    return map
  }, [suppliers])

  const countries = useMemo(function() {
    return [...new Set(riskData.map(function(r) { return r.site_location_country }))].sort()
  }, [riskData])

  const filteredRisks = useMemo(function() {
    let filtered = riskData.filter(function(risk) {
      const supplier = supplierMap[risk.supplier_id]
      
      if (filterLevel) {
        const level = getRiskLevel(risk.overall_risk_score).level.toLowerCase()
        if (level !== filterLevel) return false
      }
      
      if (filterCountry && risk.site_location_country !== filterCountry) return false
      
      if (search) {
        const q = search.toLowerCase()
        const supplierName = supplier?.supplier_name?.toLowerCase() || ''
        return risk.supplier_id.toLowerCase().includes(q) ||
               supplierName.includes(q) ||
               risk.site_location_country.toLowerCase().includes(q)
      }
      
      return true
    })

    filtered.sort(function(a, b) {
      if (sortBy === 'risk') return b.overall_risk_score - a.overall_risk_score
      if (sortBy === 'geopolitical') return b.geopolitical_risk_index - a.geopolitical_risk_index
      if (sortBy === 'natural') return b.natural_disaster_risk_index - a.natural_disaster_risk_index
      if (sortBy === 'alternatives') return a.alternative_source_count - b.alternative_source_count
      return 0
    })

    return filtered
  }, [riskData, supplierMap, search, filterLevel, filterCountry, sortBy])

  const riskCounts = useMemo(function() {
    return {
      critical: riskData.filter(function(r) { return r.overall_risk_score >= 0.9 }).length,
      high: riskData.filter(function(r) { return r.overall_risk_score >= 0.7 && r.overall_risk_score < 0.9 }).length,
      medium: riskData.filter(function(r) { return r.overall_risk_score >= 0.5 && r.overall_risk_score < 0.7 }).length,
      low: riskData.filter(function(r) { return r.overall_risk_score < 0.5 }).length,
      noAlternatives: riskData.filter(function(r) { return r.alternative_source_count === 0 }).length
    }
  }, [riskData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Alerts</h1>
          <p className="text-gray-400">Monitor and manage supplier risk exposure</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-4 border border-red-500/30 bg-red-500/10">
          <p className="text-sm text-gray-400">Critical</p>
          <p className="text-2xl font-bold text-red-400">{riskCounts.critical}</p>
        </div>
        <div className="card p-4 border border-orange-500/30 bg-orange-500/10">
          <p className="text-sm text-gray-400">High</p>
          <p className="text-2xl font-bold text-orange-400">{riskCounts.high}</p>
        </div>
        <div className="card p-4 border border-yellow-500/30 bg-yellow-500/10">
          <p className="text-sm text-gray-400">Medium</p>
          <p className="text-2xl font-bold text-yellow-400">{riskCounts.medium}</p>
        </div>
        <div className="card p-4 border border-green-500/30 bg-green-500/10">
          <p className="text-sm text-gray-400">Low</p>
          <p className="text-2xl font-bold text-green-400">{riskCounts.low}</p>
        </div>
        <div className="card p-4 border border-purple-500/30 bg-purple-500/10">
          <p className="text-sm text-gray-400">No Alternatives</p>
          <p className="text-2xl font-bold text-purple-400">{riskCounts.noAlternatives}</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={function(e) { setSearch(e.target.value) }}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
          
          <select
            value={filterLevel}
            onChange={function(e) { setFilterLevel(e.target.value) }}
            className="input-field w-40"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterCountry}
            onChange={function(e) { setFilterCountry(e.target.value) }}
            className="input-field w-40"
          >
            <option value="">All Countries</option>
            {countries.map(function(country) {
              return <option key={country} value={country}>{country}</option>
            })}
          </select>

          <select
            value={sortBy}
            onChange={function(e) { setSortBy(e.target.value) }}
            className="input-field w-48"
          >
            <option value="risk">Sort by Overall Risk</option>
            <option value="geopolitical">Sort by Geopolitical</option>
            <option value="natural">Sort by Natural Disaster</option>
            <option value="alternatives">Sort by Alternatives</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        Showing {filteredRisks.length} of {riskData.length} suppliers
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRisks.slice(0, 20).map(function(risk) {
          const supplier = supplierMap[risk.supplier_id]
          return (
            <RiskCard key={risk.supplier_id} supplier={supplier} risk={risk} />
          )
        })}
      </div>

      {filteredRisks.length > 20 && (
        <div className="text-center text-gray-400">
          Showing 20 of {filteredRisks.length} results. Use filters to narrow down.
        </div>
      )}
    </div>
  )
}
