import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Filter,
  Search,
  Clock,
  DollarSign,
  Zap,
  Thermometer,
  Gauge,
  X,
  ChevronDown,
  Lightbulb
} from 'lucide-react';
import useStore from '../store/useStore';
import AlertCard from '../components/Cards/AlertCard';

export default function WasteAlerts() {
  const {
    wasteAlerts,
    isLoading,
    initializeData,
    dismissAlert,
    alertFilter,
    setAlertFilter,
    severityFilter,
    setSeverityFilter,
    getFilteredAlerts,
    getTotalWastedEnergy
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredAlerts = getFilteredAlerts().filter(alert =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalWaste = getTotalWastedEnergy();
  const criticalCount = wasteAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = wasteAlerts.filter(a => a.severity === 'warning').length;
  const infoCount = wasteAlerts.filter(a => a.severity === 'info').length;

  const alertTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'idle_power', label: 'Idle Power', icon: Clock },
    { value: 'power_factor', label: 'Power Factor', icon: Gauge },
    { value: 'temp_overshoot', label: 'Temperature', icon: Thermometer },
    { value: 'standby_duration', label: 'Standby', icon: Zap }
  ];

  const severityLevels = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: 'Critical', color: 'text-red-400' },
    { value: 'warning', label: 'Warning', color: 'text-yellow-400' },
    { value: 'info', label: 'Info', color: 'text-blue-400' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Waste Alerts</h1>
          <p className="text-slate-400 mt-1">Monitor and resolve energy waste issues</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <span className="text-sm text-red-400 font-medium">{criticalCount} Critical</span>
          </div>
          <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <span className="text-sm text-yellow-400 font-medium">{warningCount} Warning</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{wasteAlerts.length}</p>
            <p className="text-sm text-slate-400">Active Alerts</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-500/10">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalWaste.toFixed(1)} kWh</p>
            <p className="text-sm text-slate-400">Potential Waste</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">${(totalWaste * 0.12).toFixed(2)}</p>
            <p className="text-sm text-slate-400">Recoverable Savings</p>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Filter toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {(alertFilter !== 'all' || severityFilter !== 'all') && (
              <button
                onClick={() => {
                  setAlertFilter('all');
                  setSeverityFilter('all');
                }}
                className="btn btn-secondary"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Alert Type</label>
              <div className="flex flex-wrap gap-2">
                {alertTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setAlertFilter(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      alertFilter === type.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type.icon && <type.icon size={14} className="inline mr-1" />}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Severity</label>
              <div className="flex flex-wrap gap-2">
                {severityLevels.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setSeverityFilter(level.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      severityFilter === level.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alerts list */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="card p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No alerts found</h3>
            <p className="text-sm text-slate-500">
              {searchTerm || alertFilter !== 'all' || severityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Great! No energy waste detected'}
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
          ))
        )}
      </div>

      {/* Recommendations section */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Recommendations</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="font-medium text-white mb-2">Reduce Idle Power Consumption</h4>
            <p className="text-sm text-slate-400 mb-3">
              Configure automatic standby mode after 10 minutes of inactivity. This can reduce idle power from 18kW to 8kW.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Implementation: Equipment settings</span>
              <span className="text-sm text-green-400 font-medium">Save ~$45/day</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="font-medium text-white mb-2">Install Power Factor Correction</h4>
            <p className="text-sm text-slate-400 mb-3">
              A capacitor bank can improve power factor from 0.88 to 0.95+, reducing reactive power charges and improving efficiency.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Implementation: Electrical upgrade</span>
              <span className="text-sm text-green-400 font-medium">Save ~$25/day</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="font-medium text-white mb-2">Optimize Zone Temperatures</h4>
            <p className="text-sm text-slate-400 mb-3">
              Calibrate heaters to reduce upper/lower temperature variance. A 10°C reduction in overshoot saves approximately 2% energy.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Implementation: Maintenance task</span>
              <span className="text-sm text-green-400 font-medium">Save ~$15/day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
