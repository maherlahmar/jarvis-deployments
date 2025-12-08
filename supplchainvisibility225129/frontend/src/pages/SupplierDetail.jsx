import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Building2,
  AlertTriangle,
  Shield,
  Droplets,
  Globe,
  Layers,
  Package,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { getRiskColor, getRiskLabel, getTierColor, getESGColor } from '../utils/helpers';

function RiskGauge({ label, value, maxValue = 1 }) {
  const percentage = (value / maxValue) * 100;
  const color = getRiskColor(value);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-medium" style={{ color }}>{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function SupplierDetail() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSupplier() {
      setLoading(true);
      try {
        const data = await api.getSupplier(id);
        setSupplier(data);
      } catch (err) {
        setError('Failed to load supplier details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSupplier();
  }, [id]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <AlertTriangle className="w-12 h-12 mb-4 text-red-400" />
        <p>{error || 'Supplier not found'}</p>
        <Link to="/suppliers" className="mt-4 btn btn-primary">
          Back to Suppliers
        </Link>
      </div>
    );
  }

  const riskLevel = getRiskLabel(supplier.overall_risk_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/suppliers" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{supplier.name}</h1>
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${getTierColor(supplier.tier_level)}20`,
                color: getTierColor(supplier.tier_level)
              }}
            >
              Tier {supplier.tier_level}
            </span>
          </div>
          <p className="text-gray-400 mt-1">{supplier.id}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info & Risk */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="card-header">
              <h2 className="text-lg font-semibold text-white">Supplier Information</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="text-white font-medium">{supplier.city}, {supplier.country}</p>
                    <p className="text-sm text-gray-500">
                      {supplier.latitude?.toFixed(4)}, {supplier.longitude?.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Site Function</p>
                    <p className="text-white font-medium">{supplier.site_function}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Layers className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Alternative Sources</p>
                    <p className={`font-medium ${
                      supplier.alternative_source_count === 0 ? 'text-red-400' :
                      supplier.alternative_source_count < 2 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {supplier.alternative_source_count ?? 0} alternatives identified
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ESG Audit Score</p>
                    <p className="font-medium" style={{ color: getESGColor(supplier.esg_audit_score) }}>
                      {supplier.esg_audit_score ?? 'N/A'} / 100
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Risk Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Risk Analysis</h2>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${getRiskColor(supplier.overall_risk_score)}20`,
                  color: getRiskColor(supplier.overall_risk_score)
                }}
              >
                {riskLevel} Risk - {supplier.overall_risk_score?.toFixed(2) ?? 'N/A'}
              </span>
            </div>
            <div className="card-body space-y-4">
              <RiskGauge
                label="Geopolitical Risk"
                value={supplier.geopolitical_risk ?? 0}
              />
              <RiskGauge
                label="Natural Disaster Risk"
                value={supplier.natural_disaster_risk ?? 0}
              />
              <RiskGauge
                label="Water Scarcity Risk"
                value={supplier.water_scarcity_index ?? 0}
              />
            </div>
          </motion.div>

          {/* Components Supplied */}
          {supplier.components && supplier.components.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="text-lg font-semibold text-white">Components Supplied</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {supplier.components.map((comp, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{comp.component_name}</p>
                        <p className="text-sm text-gray-400">SKU: {comp.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{comp.annual_volume?.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">units/year</p>
                    </div>
                    <span className={`badge ${
                      comp.criticality === 'High' ? 'badge-critical' : 'badge-medium'
                    }`}>
                      {comp.criticality}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Supply Chain */}
        <div className="space-y-6">
          {/* Supply Chain Relationships */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="card-header">
              <h2 className="text-lg font-semibold text-white">Supply Chain Position</h2>
            </div>
            <div className="card-body space-y-6">
              {/* Upstream */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Supplies To (Downstream)</h3>
                {supplier.supplyChain?.suppliesTo?.length > 0 ? (
                  <div className="space-y-2">
                    {supplier.supplyChain.suppliesTo.map((s) => (
                      <Link
                        key={s.id}
                        to={`/suppliers/${s.id}`}
                        className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: getTierColor(s.tier_level) }}
                        >
                          T{s.tier_level}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{s.name}</p>
                          <p className="text-sm text-gray-400 truncate">{s.country}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">This is a Tier 1 supplier (direct to Diodes Corp)</p>
                )}
              </div>

              {/* Downstream */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Supplied By (Upstream)</h3>
                {supplier.supplyChain?.suppliedBy ? (
                  <Link
                    to={`/suppliers/${supplier.supplyChain.suppliedBy.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: getTierColor(supplier.supplyChain.suppliedBy.tier_level) }}
                    >
                      T{supplier.supplyChain.suppliedBy.tier_level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{supplier.supplyChain.suppliedBy.name}</p>
                      <p className="text-sm text-gray-400 truncate">{supplier.supplyChain.suppliedBy.country}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </Link>
                ) : (
                  <p className="text-gray-500 text-sm">No upstream supplier in database</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="card-header">
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="card-body space-y-3">
              <Link
                to={`/map?supplier=${supplier.id}`}
                className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Globe className="w-5 h-5 text-blue-400" />
                <span className="text-white">View on Map</span>
              </Link>
              <Link
                to={`/products?supplier=${supplier.id}`}
                className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Package className="w-5 h-5 text-purple-400" />
                <span className="text-white">View Products</span>
              </Link>
              <Link
                to="/recommendations"
                className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-white">Diversification Options</span>
              </Link>
            </div>
          </motion.div>

          {/* Risk Summary Card */}
          {supplier.overall_risk_score >= 0.7 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card border-red-500/30"
            >
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">High Risk Alert</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      This supplier has elevated risk levels. Consider identifying alternative sources
                      and implementing contingency plans.
                    </p>
                    <Link
                      to="/recommendations"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-red-400 hover:text-red-300"
                    >
                      View Recommendations <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
