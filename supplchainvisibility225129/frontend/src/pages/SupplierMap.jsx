import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Filter, Layers, ExternalLink, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';
import { getTierColor, getRiskColor, getRiskLevel, getRiskLabel } from '../utils/helpers';

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function SupplierMap() {
  const { mapData, setMapData, setLoading, loading } = useStore();
  const [filters, setFilters] = useState({ tier: '', riskLevel: '' });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showConnections, setShowConnections] = useState(true);
  const [mapCenter, setMapCenter] = useState([25, 110]);
  const [mapZoom, setMapZoom] = useState(4);

  useEffect(() => {
    async function fetchData() {
      setLoading('map', true);
      try {
        const params = {};
        if (filters.tier) params.tier = filters.tier;
        if (filters.riskLevel) params.risk_level = filters.riskLevel;
        const data = await api.getMapSuppliers(params);
        setMapData(data);
      } catch (error) {
        console.error('Failed to fetch map data:', error);
      } finally {
        setLoading('map', false);
      }
    }
    fetchData();
  }, [filters, setMapData, setLoading]);

  const filteredSuppliers = useMemo(() => {
    return mapData.suppliers || [];
  }, [mapData.suppliers]);

  const connections = useMemo(() => {
    if (!showConnections) return [];
    return mapData.connections || [];
  }, [mapData.connections, showConnections]);

  const getMarkerSize = (tier) => {
    switch (tier) {
      case 1: return 12;
      case 2: return 9;
      case 3: return 6;
      default: return 8;
    }
  };

  const handleSupplierClick = (supplier) => {
    setSelectedSupplier(supplier);
    setMapCenter([supplier.latitude, supplier.longitude]);
    setMapZoom(6);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Supply Chain Map</h1>
          <p className="text-gray-400 mt-1">Multi-tier supplier geographic distribution</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.tier}
            onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
            className="select w-36"
          >
            <option value="">All Tiers</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>

          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
            className="select w-40"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
          </select>

          <button
            onClick={() => setShowConnections(!showConnections)}
            className={`btn ${showConnections ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Layers className="w-4 h-4 mr-2" />
            Connections
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 px-4 py-3 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 font-medium">Tier:</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getTierColor(1) }}></span>
            <span className="text-sm text-gray-300">Tier 1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getTierColor(2) }}></span>
            <span className="text-sm text-gray-300">Tier 2</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getTierColor(3) }}></span>
            <span className="text-sm text-gray-300">Tier 3</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 font-medium">Risk:</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor(0.95) }}></span>
            <span className="text-sm text-gray-300">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor(0.75) }}></span>
            <span className="text-sm text-gray-300">High</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor(0.55) }}></span>
            <span className="text-sm text-gray-300">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor(0.3) }}></span>
            <span className="text-sm text-gray-300">Low</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card overflow-hidden"
        style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}
      >
        {loading.map ? (
          <div className="h-full flex items-center justify-center bg-gray-800">
            <div className="spinner"></div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Connection lines */}
            {connections.map((conn, idx) => (
              <Polyline
                key={`conn-${idx}`}
                positions={[
                  [conn.from_lat, conn.from_lng],
                  [conn.to_lat, conn.to_lng]
                ]}
                pathOptions={{
                  color: '#6b7280',
                  weight: 1,
                  opacity: 0.4,
                  dashArray: '5, 5'
                }}
              />
            ))}

            {/* Supplier markers */}
            {filteredSuppliers.map((supplier) => (
              <CircleMarker
                key={supplier.id}
                center={[supplier.latitude, supplier.longitude]}
                radius={getMarkerSize(supplier.tier_level)}
                pathOptions={{
                  color: '#fff',
                  weight: 2,
                  fillColor: supplier.overall_risk_score >= 0.9
                    ? getRiskColor(supplier.overall_risk_score)
                    : getTierColor(supplier.tier_level),
                  fillOpacity: 0.8
                }}
                eventHandlers={{
                  click: () => handleSupplierClick(supplier)
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-gray-900">{supplier.name}</h3>
                    <p className="text-sm text-gray-600">{supplier.id}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Tier:</span> {supplier.tier_level}</p>
                      <p><span className="font-medium">Location:</span> {supplier.city}, {supplier.country}</p>
                      <p><span className="font-medium">Function:</span> {supplier.site_function}</p>
                      {supplier.overall_risk_score && (
                        <p>
                          <span className="font-medium">Risk Score:</span>{' '}
                          <span style={{ color: getRiskColor(supplier.overall_risk_score) }}>
                            {supplier.overall_risk_score.toFixed(2)} ({getRiskLabel(supplier.overall_risk_score)})
                          </span>
                        </p>
                      )}
                      {supplier.esg_audit_score && (
                        <p><span className="font-medium">ESG Score:</span> {supplier.esg_audit_score}</p>
                      )}
                    </div>
                    <Link
                      to={`/suppliers/${supplier.id}`}
                      className="mt-3 inline-flex items-center gap-1 text-blue-600 text-sm hover:underline"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-white">{filteredSuppliers.length}</p>
          <p className="text-sm text-gray-400">Suppliers Shown</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {filteredSuppliers.filter(s => s.tier_level === 1).length}
          </p>
          <p className="text-sm text-gray-400">Tier 1 Suppliers</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {filteredSuppliers.filter(s => s.overall_risk_score >= 0.9).length}
          </p>
          <p className="text-sm text-gray-400">Critical Risk</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {new Set(filteredSuppliers.map(s => s.country)).size}
          </p>
          <p className="text-sm text-gray-400">Countries</p>
        </div>
      </div>
    </div>
  );
}
