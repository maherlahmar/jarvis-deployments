import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  AlertTriangle,
  TrendingUp,
  Globe,
  Building2,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { getRiskColor, chartColors, getPriorityBadgeClass } from '../utils/helpers';

export default function Concentration() {
  const [concentration, setConcentration] = useState(null);
  const [riskHeatmap, setRiskHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [concentrationData, heatmapData] = await Promise.all([
          api.getConcentration(),
          api.getRiskHeatmap()
        ]);
        setConcentration(concentrationData);
        setRiskHeatmap(heatmapData);
      } catch (error) {
        console.error('Failed to fetch concentration data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const countries = concentration?.countries || [];
  const criticalCountries = countries.filter(c => c.risk_category === 'Critical');
  const highConcentration = countries.filter(c => c.concentration_percentage > 15);

  const concentrationChartData = countries.slice(0, 8).map(c => ({
    name: c.country,
    percentage: Math.round(c.concentration_percentage * 10) / 10,
    tier1: c.tier1_count,
    tier2: c.tier2_count,
    tier3: c.tier3_count
  }));

  const riskRadarData = riskHeatmap.slice(0, 6).map(r => ({
    country: r.country,
    Geopolitical: Math.round(r.avg_geopolitical * 100),
    'Natural Disaster': Math.round(r.avg_natural_disaster * 100),
    'Water Scarcity': Math.round(r.avg_water_scarcity * 100)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Geographic Concentration Analysis</h1>
        <p className="text-gray-400 mt-1">
          Identify concentration risks and plan diversification strategies
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{countries.length}</p>
              <p className="text-sm text-gray-400">Countries</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{criticalCountries.length}</p>
              <p className="text-sm text-gray-400">Critical Concentration</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/20">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{highConcentration.length}</p>
              <p className="text-sm text-gray-400">High Concentration (&gt;15%)</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Building2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {countries.reduce((sum, c) => sum + c.supplier_count, 0)}
              </p>
              <p className="text-sm text-gray-400">Total Suppliers</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concentration by Country */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Supplier Distribution by Country</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={concentrationChartData} layout="vertical">
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Bar dataKey="tier1" stackId="a" fill="#3b82f6" name="Tier 1" />
                <Bar dataKey="tier2" stackId="a" fill="#8b5cf6" name="Tier 2" />
                <Bar dataKey="tier3" stackId="a" fill="#10b981" name="Tier 3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Risk Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Risk Profile by Country</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={riskRadarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="country" stroke="#9ca3af" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                <Radar name="Geopolitical" dataKey="Geopolitical" stroke="#dc2626" fill="#dc2626" fillOpacity={0.3} />
                <Radar name="Natural Disaster" dataKey="Natural Disaster" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                <Radar name="Water Scarcity" dataKey="Water Scarcity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Country Risk Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Country Risk Summary</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Suppliers</th>
                <th>Concentration</th>
                <th>Tier Distribution</th>
                <th>Avg Risk Score</th>
                <th>Risk Category</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.country}>
                  <td>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-white">{country.country}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-white font-medium">{country.supplier_count}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(country.concentration_percentage * 4, 100)}%`,
                            backgroundColor: country.concentration_percentage > 20 ? '#dc2626' :
                              country.concentration_percentage > 10 ? '#f97316' : '#22c55e'
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-300">
                        {country.concentration_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-blue-400">T1: {country.tier1_count}</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-purple-400">T2: {country.tier2_count}</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-green-400">T3: {country.tier3_count}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="font-medium"
                      style={{ color: getRiskColor(country.avg_risk_score) }}
                    >
                      {country.avg_risk_score?.toFixed(2) || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityBadgeClass(country.risk_category)}`}>
                      {country.risk_category}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/suppliers?country=${encodeURIComponent(country.country)}`}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Risk Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Concentration Alert */}
        {criticalCountries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card border-red-500/30"
          >
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Critical Concentration Warning</h3>
                  <p className="text-gray-400 mt-1">
                    {criticalCountries.map(c => c.country).join(' and ')} represent{' '}
                    {criticalCountries.reduce((sum, c) => sum + c.concentration_percentage, 0).toFixed(1)}%
                    of your supply chain. Consider diversification to reduce geographic risk.
                  </p>
                  <Link
                    to="/recommendations"
                    className="inline-flex items-center gap-1 mt-3 text-red-400 hover:text-red-300 text-sm"
                  >
                    View Diversification Recommendations <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Risk Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="card-body">
            <h3 className="font-semibold text-white mb-4">Key Insights</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></span>
                <span>Top 3 countries account for {
                  countries.slice(0, 3).reduce((sum, c) => sum + c.concentration_percentage, 0).toFixed(1)
                }% of suppliers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2"></span>
                <span>Tier 2 suppliers most concentrated in {
                  countries.sort((a, b) => b.tier2_count - a.tier2_count)[0]?.country
                }</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2"></span>
                <span>Lowest risk region: {
                  riskHeatmap.sort((a, b) => a.avg_overall - b.avg_overall)[0]?.country
                } (avg risk {riskHeatmap.sort((a, b) => a.avg_overall - b.avg_overall)[0]?.avg_overall.toFixed(2)})</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2"></span>
                <span>Highest geopolitical risk: {
                  riskHeatmap.sort((a, b) => b.avg_geopolitical - a.avg_geopolitical)[0]?.country
                }</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
