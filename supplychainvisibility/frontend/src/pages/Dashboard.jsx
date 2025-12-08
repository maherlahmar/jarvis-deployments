import { useState, useEffect } from 'react'
import { 
  Building2, 
  Globe, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  Layers
} from 'lucide-react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import useStore from '../store/useStore'
import api from '../services/api'

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

function StatCard({ icon: Icon, label, value, subValue, color = 'primary' }) {
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-600/20 border-primary-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30'
  }

  return (
    <div className={'card p-6 bg-gradient-to-br border ' + colorClasses[color]}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subValue && <p className="text-sm text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className="p-3 rounded-lg bg-gray-700/50">
          <Icon className="w-6 h-6 text-gray-300" />
        </div>
      </div>
    </div>
  )
}

function ConcentrationChart({ data }) {
  const chartData = data.slice(0, 8).map(function(item) {
    return {
      name: item.country,
      suppliers: parseInt(item.supplierCount || item.supplier_count || 0),
      risk: parseFloat(item.avgRiskScore || item.avg_risk_score || 0) * 100
    }
  })

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Geographic Concentration</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" stroke="#9ca3af" />
          <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
            labelStyle={{ color: '#fff' }}
          />
          <Bar dataKey="suppliers" fill="#3b82f6" name="Suppliers" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TierDistribution({ tierStats }) {
  const data = [
    { name: 'Tier 1', value: tierStats[1] || 0, color: TIER_COLORS[1] },
    { name: 'Tier 2', value: tierStats[2] || 0, color: TIER_COLORS[2] },
    { name: 'Tier 3', value: tierStats[3] || 0, color: TIER_COLORS[3] }
  ]

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Tier Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map(function(entry, index) {
              return <Cell key={index} fill={entry.color} />
            })}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function RiskDistributionChart({ riskDist }) {
  const data = [
    { name: 'Low', value: riskDist.low, color: RISK_COLORS.low },
    { name: 'Medium', value: riskDist.medium, color: RISK_COLORS.medium },
    { name: 'High', value: riskDist.high, color: RISK_COLORS.high },
    { name: 'Critical', value: riskDist.critical, color: RISK_COLORS.critical }
  ]

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map(function(entry, index) {
              return <Cell key={index} fill={entry.color} />
            })}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function TopRisksTable({ risks }) {
  const topRisks = risks
    .filter(function(r) { return r.overall_risk_score >= 0.7 })
    .sort(function(a, b) { return b.overall_risk_score - a.overall_risk_score })
    .slice(0, 5)

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">High Risk Suppliers</h3>
      <div className="space-y-3">
        {topRisks.map(function(risk) {
          const riskClass = risk.overall_risk_score >= 0.9 ? 'text-red-400' : 'text-orange-400'
          return (
            <div key={risk.supplier_id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-white">{risk.supplier_id}</p>
                <p className="text-sm text-gray-400">{risk.site_location_country}</p>
              </div>
              <div className="text-right">
                <p className={'font-bold ' + riskClass}>
                  {(risk.overall_risk_score * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-400">Risk Score</p>
              </div>
            </div>
          )
        })}
        {topRisks.length === 0 && (
          <p className="text-gray-400 text-center py-4">No high risk suppliers</p>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const suppliers = useStore(function(state) { return state.suppliers })
  const riskData = useStore(function(state) { return state.riskData })
  const getTierStats = useStore(function(state) { return state.getTierStats })
  const getRiskDistribution = useStore(function(state) { return state.getRiskDistribution })
  
  const [concentration, setConcentration] = useState([])

  const tierStats = getTierStats()
  const riskDist = getRiskDistribution()
  const uniqueCountries = [...new Set(suppliers.map(function(s) { return s.site_location_country }))].length

  useEffect(function() {
    async function loadConcentration() {
      try {
        const res = await api.getConcentrationAnalysis()
        if (res.success) {
          setConcentration(res.data)
        }
      } catch (err) {
        console.error('Error loading concentration:', err)
      }
    }
    loadConcentration()
  }, [])

  const avgRisk = riskData.length > 0 
    ? riskData.reduce(function(sum, r) { return sum + (r.overall_risk_score || 0) }, 0) / riskData.length 
    : 0

  const criticalSuppliers = riskData.filter(function(r) { return r.overall_risk_score >= 0.9 }).length
  const noAlternatives = riskData.filter(function(r) { return r.alternative_source_count === 0 }).length

  const taiwanChinaCount = concentration
    .filter(function(c) { return c.country === 'Taiwan' || c.country === 'China' })
    .reduce(function(sum, c) { return sum + parseInt(c.supplierCount || c.supplier_count || 0) }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Supply Chain Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of multi-tier supplier network and risk exposure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Total Suppliers"
          value={suppliers.length}
          subValue={'Across ' + uniqueCountries + ' countries'}
          color="primary"
        />
        <StatCard
          icon={Layers}
          label="Tier 1 Suppliers"
          value={tierStats[1] || 0}
          subValue="Direct suppliers"
          color="primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Risk"
          value={criticalSuppliers}
          subValue="Score > 90%"
          color="red"
        />
        <StatCard
          icon={Shield}
          label="No Alternatives"
          value={noAlternatives}
          subValue="Single source risk"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConcentrationChart data={concentration} />
        <TierDistribution tierStats={tierStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart riskDist={riskDist} />
        <TopRisksTable risks={riskData} />
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="font-medium text-red-400">Geographic Risk</span>
            </div>
            <p className="text-sm text-gray-300">
              Taiwan and China concentration poses significant geopolitical risk with combined {taiwanChinaCount} suppliers.
            </p>
          </div>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-yellow-400" />
              <span className="font-medium text-yellow-400">Diversification Needed</span>
            </div>
            <p className="text-sm text-gray-300">
              {noAlternatives} suppliers have no alternative sources, creating single-point-of-failure risks.
            </p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-blue-400">Average Risk</span>
            </div>
            <p className="text-sm text-gray-300">
              Overall supply chain risk score is {(avgRisk * 100).toFixed(1)}%. 
              Focus on {riskDist.high + riskDist.critical} high/critical risk suppliers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
