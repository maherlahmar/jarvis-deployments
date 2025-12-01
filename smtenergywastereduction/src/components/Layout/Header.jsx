import { useState, useEffect } from 'react';
import { RefreshCw, Bell, Download, Clock } from 'lucide-react';
import useStore from '../../store/useStore';

export default function Header() {
  const {
    lastUpdated,
    refreshData,
    isLoading,
    selectedTimeRange,
    setTimeRange,
    wasteAlerts
  } = useStore();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeRanges = [
    { value: '1h', label: '1H' },
    { value: '6h', label: '6H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' }
  ];

  const criticalAlerts = wasteAlerts.filter(a => a.severity === 'critical').length;

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6">
      {/* Left section */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Reflow Oven Energy Analysis</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={12} />
            <span>{currentTime.toLocaleTimeString()}</span>
            <span className="text-slate-600">|</span>
            <span>{currentTime.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Center section - Time range selector */}
      <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedTimeRange === range.value
                ? 'bg-primary-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Last updated */}
        {lastUpdated && (
          <span className="text-xs text-slate-500">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}

        {/* Refresh button */}
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>

        {/* Export button */}
        <button
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Export data"
        >
          <Download size={18} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
          {criticalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
              {criticalAlerts}
            </span>
          )}
        </button>

        {/* Status indicator */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-slate-300">Live</span>
        </div>
      </div>
    </header>
  );
}
