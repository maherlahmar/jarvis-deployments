import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { Filter, Search, X, Building2, MapPin, AlertTriangle } from 'lucide-react'
import useStore from '../store/useStore'

const TIER_COLORS = {
  1: '#3b82f6',
  2: '#8b5cf6', 
  3: '#14b8a6'
}

const RISK_COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444'
}

function getRiskLevel(score) {
  if (score >= 0.9) return 'critical'
  if (score >= 0.7) return 'high'
  if (score >= 0.5) return 'medium'
  return 'low'
}

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(function() {
    if (center) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])
  return null
}

function FilterPanel({ filters, setFilters, countries, onClose }) {
  return (
    <div className="card p-4 w-72">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Filters</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Tier Level</label>
          <div className="flex gap-2">
            {[1, 2, 3].map(function(tier) {
              const isSelected = filters.tier === tier
              return (
                <button
                  key={tier}
                  onClick={function() { setFilters({ ...filters, tier: isSelected ? null : tier }) }}
                  className={'flex-1 py-2 rounded-lg text-sm font-medium transition-colors ' + 
                    (isSelected 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
                >
                  Tier {tier}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Country</label>
          <select
            value={filters.country || ''}
            onChange={function(e) { setFilters({ ...filters, country: e.target.value || null }) }}
            className="w-full input-field"
          >
            <option value="">All Countries</option>
            {countries.map(function(country) {
              return <option key={country} value={country}>{country}</option>
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Risk Level</label>
          <select
            value={filters.risk || ''}
            onChange={function(e) { setFilters({ ...filters, risk: e.target.value || null }) }}
            className="w-full input-field"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>
        </div>

        <button
          onClick={function() { setFilters({ tier: null, country: null, risk: null }) }}
          className="w-full btn-secondary"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}

function SupplierPopup({ supplier, risk }) {
  const riskLevel = risk ? getRiskLevel(risk.overall_risk_score) : 'low'
  const riskClass = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  }[riskLevel]

  return (
    <div className="min-w-64">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-white">{supplier.supplier_name}</h4>
          <p className="text-xs text-gray-400">{supplier.supplier_id}</p>
        </div>
        <span className={'tier-badge tier-' + supplier.tier_level}>
          Tier {supplier.tier_level}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{supplier.site_location_city}, {supplier.site_location_country}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{supplier.site_function}</span>
        </div>
        {risk && (
          <div className="flex items-center gap-2">
            <AlertTriangle className={'w-4 h-4 ' + riskClass} />
            <span className={riskClass}>
              Risk Score: {(risk.overall_risk_score * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {risk && (
        <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Geopolitical:</span>
            <span className="text-gray-300 ml-1">{(risk.geopolitical_risk_index * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-gray-400">Natural Disaster:</span>
            <span className="text-gray-300 ml-1">{(risk.natural_disaster_risk_index * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-gray-400">Water Scarcity:</span>
            <span className="text-gray-300 ml-1">{(risk.water_scarcity_index * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-gray-400">ESG Score:</span>
            <span className="text-gray-300 ml-1">{risk.esg_audit_score}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SupplyChainMap() {
  const suppliers = useStore(function(state) { return state.suppliers })
  const riskData = useStore(function(state) { return state.riskData })
  
  const [filters, setFilters] = useState({ tier: null, country: null, risk: null })
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [mapCenter, setMapCenter] = useState([25, 105])
  const [mapZoom, setMapZoom] = useState(4)

  const countries = useMemo(function() {
    return [...new Set(suppliers.map(function(s) { return s.site_location_country }))].sort()
  }, [suppliers])

  const riskMap = useMemo(function() {
    const map = {}
    riskData.forEach(function(r) {
      map[r.supplier_id] = r
    })
    return map
  }, [riskData])

  const filteredSuppliers = useMemo(function() {
    return suppliers.filter(function(supplier) {
      if (filters.tier && supplier.tier_level !== filters.tier) return false
      if (filters.country && supplier.site_location_country !== filters.country) return false
      
      if (filters.risk) {
        const risk = riskMap[supplier.supplier_id]
        if (!risk) return false
        const level = getRiskLevel(risk.overall_risk_score)
        if (level !== filters.risk) return false
      }

      if (search) {
        const q = search.toLowerCase()
        return supplier.supplier_name.toLowerCase().includes(q) ||
               supplier.supplier_id.toLowerCase().includes(q) ||
               supplier.site_location_country.toLowerCase().includes(q)
      }

      return true
    })
  }, [suppliers, filters, riskMap, search])

  const tierCounts = useMemo(function() {
    return {
      1: filteredSuppliers.filter(function(s) { return s.tier_level === 1 }).length,
      2: filteredSuppliers.filter(function(s) { return s.tier_level === 2 }).length,
      3: filteredSuppliers.filter(function(s) { return s.tier_level === 3 }).length
    }
  }, [filteredSuppliers])

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Supply Chain Map</h1>
          <p className="text-gray-400">Geographic visualization of {filteredSuppliers.length} suppliers</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={function(e) { setSearch(e.target.value) }}
              className="input-field pl-10 w-64"
            />
          </div>
          <button
            onClick={function() { setShowFilters(!showFilters) }}
            className={'btn-secondary flex items-center gap-2 ' + (showFilters ? 'bg-primary-600' : '')}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        {[1, 2, 3].map(function(tier) {
          return (
            <div key={tier} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: TIER_COLORS[tier] }}
              />
              <span className="text-sm text-gray-300">
                Tier {tier}: {tierCounts[tier]} suppliers
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-700">
        {showFilters && (
          <div className="absolute top-4 left-4 z-[1000]">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              countries={countries}
              onClose={function() { setShowFilters(false) }}
            />
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
          style={{ background: '#1f2937' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {filteredSuppliers.map(function(supplier) {
            if (!supplier.latitude || !supplier.longitude) return null
            
            const risk = riskMap[supplier.supplier_id]
            const riskLevel = risk ? getRiskLevel(risk.overall_risk_score) : 'low'
            const tierColor = TIER_COLORS[supplier.tier_level]
            const riskColor = RISK_COLORS[riskLevel]
            
            return (
              <CircleMarker
                key={supplier.supplier_id}
                center={[supplier.latitude, supplier.longitude]}
                radius={supplier.tier_level === 1 ? 10 : supplier.tier_level === 2 ? 7 : 5}
                pathOptions={{
                  fillColor: tierColor,
                  color: riskColor,
                  weight: 2,
                  fillOpacity: 0.8
                }}
              >
                <Popup className="custom-popup">
                  <SupplierPopup supplier={supplier} risk={risk} />
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
