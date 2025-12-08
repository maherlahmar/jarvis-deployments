import { useState, useEffect } from 'react'
import { 
  Lightbulb, 
  Globe, 
  AlertTriangle, 
  Leaf, 
  Clock, 
  TrendingDown,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react'
import api from '../services/api'

const PRIORITY_COLORS = {
  Critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  High: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  Medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  Low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' }
}

const CATEGORY_ICONS = {
  'Geographic Diversification': Globe,
  'Single Source Risk': AlertTriangle,
  'ESG Compliance': Leaf,
  'Natural Disaster Risk': AlertTriangle
}

function RecommendationCard({ recommendation, isExpanded, onToggle }) {
  const colors = PRIORITY_COLORS[recommendation.priority] || PRIORITY_COLORS.Medium
  const Icon = CATEGORY_ICONS[recommendation.category] || Lightbulb

  return (
    <div className={'card border ' + colors.border + ' ' + colors.bg}>
      <div 
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          <div className={'p-2 rounded-lg ' + colors.bg}>
            <Icon className={'w-5 h-5 ' + colors.text} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <span className={'risk-badge mb-2 inline-block ' + colors.bg + ' ' + colors.text + ' border ' + colors.border}>
                  {recommendation.priority}
                </span>
                <h3 className="font-semibold text-white">{recommendation.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{recommendation.category}</p>
              </div>
              <button className="text-gray-400 hover:text-white">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            
            <p className="text-gray-300 mt-3">{recommendation.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              {recommendation.impactedSuppliers} suppliers impacted
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              {recommendation.estimatedTimeframe}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">
              -{(recommendation.riskReduction * 100).toFixed(0)}% risk
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Implementation Steps</h4>
            <ol className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary-400">1.</span>
                Identify and qualify alternative suppliers in target regions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400">2.</span>
                Conduct risk assessment and compliance audit of potential suppliers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400">3.</span>
                Negotiate contracts and establish supply agreements
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400">4.</span>
                Implement gradual volume transition with quality monitoring
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400">5.</span>
                Monitor and optimize new supply relationships
              </li>
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Expected Benefits</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Reduced geographic concentration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Improved supply chain resilience
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Lower overall risk exposure
                </li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Key Considerations</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Transition costs and timeline
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Quality assurance requirements
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Contract negotiations complexity
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [filterPriority, setFilterPriority] = useState('')

  useEffect(function() {
    async function loadRecommendations() {
      try {
        const res = await api.getDiversificationRecommendations()
        if (res.success) {
          setRecommendations(res.data)
        }
      } catch (err) {
        console.error('Error loading recommendations:', err)
      }
      setLoading(false)
    }
    loadRecommendations()
  }, [])

  const filteredRecs = filterPriority 
    ? recommendations.filter(function(r) { return r.priority === filterPriority })
    : recommendations

  const priorityCounts = {
    Critical: recommendations.filter(function(r) { return r.priority === 'Critical' }).length,
    High: recommendations.filter(function(r) { return r.priority === 'High' }).length,
    Medium: recommendations.filter(function(r) { return r.priority === 'Medium' }).length,
    Low: recommendations.filter(function(r) { return r.priority === 'Low' }).length
  }

  const totalRiskReduction = recommendations.reduce(function(sum, r) {
    return sum + r.riskReduction
  }, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Diversification Recommendations</h1>
          <p className="text-gray-400">Strategic initiatives to reduce supply chain risk</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div 
          className={'card p-4 cursor-pointer transition-all ' + (filterPriority === '' ? 'ring-2 ring-primary-500' : '')}
          onClick={function() { setFilterPriority('') }}
        >
          <p className="text-sm text-gray-400">All</p>
          <p className="text-2xl font-bold text-white">{recommendations.length}</p>
        </div>
        {Object.entries(priorityCounts).map(function([priority, count]) {
          const colors = PRIORITY_COLORS[priority]
          return (
            <div 
              key={priority}
              className={'card p-4 cursor-pointer transition-all border ' + colors.border + ' ' + colors.bg + ' ' + (filterPriority === priority ? 'ring-2 ring-primary-500' : '')}
              onClick={function() { setFilterPriority(priority) }}
            >
              <p className="text-sm text-gray-400">{priority}</p>
              <p className={'text-2xl font-bold ' + colors.text}>{count}</p>
            </div>
          )
        })}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Potential Risk Reduction</h3>
            <p className="text-sm text-gray-400">If all recommendations are implemented</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-400">-{(totalRiskReduction * 100).toFixed(0)}%</p>
            <p className="text-sm text-gray-400">Overall risk reduction</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRecs.map(function(rec) {
          return (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              isExpanded={expandedId === rec.id}
              onToggle={function() { setExpandedId(expandedId === rec.id ? null : rec.id) }}
            />
          )
        })}
      </div>

      {filteredRecs.length === 0 && (
        <div className="card p-8 text-center">
          <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No recommendations found for the selected filter.</p>
        </div>
      )}
    </div>
  )
}
