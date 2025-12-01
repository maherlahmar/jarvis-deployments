import { useMemo } from 'react';
import { motion } from 'framer-motion';

function ZoneHeatmap({ zoneAnalysis, title = 'Zone Temperature Heatmap' }) {
  const getTemperatureColor = (temp) => {
    if (temp < 100) return 'bg-blue-500/60';
    if (temp < 150) return 'bg-green-500/60';
    if (temp < 200) return 'bg-yellow-500/60';
    if (temp < 230) return 'bg-orange-500/60';
    return 'bg-red-500/60';
  };

  const getStatusIndicator = (zone) => {
    if (zone.tempVariance > 15) return 'critical';
    if (zone.tempVariance > 10) return 'warning';
    return 'optimal';
  };

  if (!zoneAnalysis || zoneAnalysis.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="card-body h-64 flex items-center justify-center text-gray-400">
          No zone data available
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card"
    >
      <div className="card-header">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">Real-time zone temperatures across the reflow oven</p>
      </div>
      <div className="card-body">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 text-sm">
          <span className="text-gray-400">Temperature Scale:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500/60" />
            <span className="text-gray-400">&lt;100°C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/60" />
            <span className="text-gray-400">100-150°C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500/60" />
            <span className="text-gray-400">150-200°C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500/60" />
            <span className="text-gray-400">200-230°C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/60" />
            <span className="text-gray-400">&gt;230°C</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-10 gap-2">
          {zoneAnalysis.map((zone, index) => {
            const status = getStatusIndicator(zone);
            return (
              <motion.div
                key={zone.zone}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <div
                  className={`aspect-square rounded-lg ${getTemperatureColor(zone.avgUpperTemp)}
                    flex flex-col items-center justify-center p-2 cursor-pointer
                    hover:ring-2 hover:ring-white/30 transition-all`}
                >
                  <span className="text-xs text-white/80 font-medium">Zone {zone.zone}</span>
                  <span className="text-lg font-bold text-white">
                    {zone.avgUpperTemp.toFixed(0)}°
                  </span>
                  <div className={`zone-indicator ${status} absolute -top-1 -right-1`} />
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="tooltip min-w-[180px]">
                    <p className="font-semibold mb-2">Zone {zone.zone}</p>
                    <div className="space-y-1 text-gray-300">
                      <p>Upper: {zone.avgUpperTemp.toFixed(1)}°C</p>
                      <p>Lower: {zone.avgLowerTemp.toFixed(1)}°C</p>
                      <p>Max: {zone.maxUpperTemp.toFixed(1)}°C</p>
                      <p>Min: {zone.minUpperTemp.toFixed(1)}°C</p>
                      <p>Variance: {zone.tempVariance.toFixed(1)}°C</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Zone Flow Indicator */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span>Entry</span>
            <div className="w-4 h-4 border border-gray-500 rounded flex items-center justify-center">
              <span className="text-xs">→</span>
            </div>
          </div>
          <div className="flex-1 mx-4 h-px bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 opacity-50" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-500 rounded flex items-center justify-center">
              <span className="text-xs">→</span>
            </div>
            <span>Exit</span>
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="zone-indicator optimal" />
            <span className="text-gray-400">Stable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="zone-indicator warning" />
            <span className="text-gray-400">Variable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="zone-indicator critical" />
            <span className="text-gray-400">Unstable</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ZoneHeatmap;
