import { format } from 'date-fns';
import { Bell, Calendar, Upload, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

function Header() {
  const { lastUpdated, alerts, dismissedAlerts, clearData, fileName, dateRange } = useStore();
  const activeAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));
  const highPriorityCount = activeAlerts.filter(a => a.priority === 'high').length;

  const handleNewFile = () => {
    clearData();
  };

  return (
    <header className="h-16 bg-background-card border-b border-gray-700/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Energy Dashboard</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            {dateRange.start && dateRange.end ? (
              <span>
                {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
              </span>
            ) : (
              <span>All time</span>
            )}
            {fileName && (
              <span className="text-gray-500 ml-2">({fileName})</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Last updated */}
        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Updated {format(lastUpdated, 'HH:mm:ss')}</span>
          </div>
        )}

        {/* Upload new file button */}
        <button
          onClick={handleNewFile}
          className="btn btn-ghost p-2 flex items-center gap-2"
          title="Upload new CSV file"
        >
          <Upload className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">New File</span>
        </button>

        {/* Alerts indicator */}
        <div className="relative">
          <button className="btn btn-ghost p-2 relative">
            <Bell className="w-5 h-5" />
            {activeAlerts.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full text-xs font-medium ${
                  highPriorityCount > 0 ? 'bg-red-500' : 'bg-yellow-500'
                } text-white`}
              >
                {activeAlerts.length}
              </motion.span>
            )}
          </button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-400 font-medium">System Online</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
