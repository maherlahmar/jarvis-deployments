import { useMemo } from 'react';

export default function ZoneHeatmap({ zones, onZoneClick }) {
  const getTemperatureColor = (temp) => {
    if (temp < 100) return 'bg-blue-900/50 border-blue-700';
    if (temp < 150) return 'bg-blue-700/50 border-blue-500';
    if (temp < 180) return 'bg-yellow-700/50 border-yellow-500';
    if (temp < 210) return 'bg-orange-700/50 border-orange-500';
    if (temp < 240) return 'bg-red-600/50 border-red-500';
    return 'bg-red-800/60 border-red-400';
  };

  const getEfficiencyIndicator = (zone) => {
    if (zone.delta > 10) return { color: 'bg-red-500', label: 'High variance' };
    if (zone.delta > 5) return { color: 'bg-yellow-500', label: 'Moderate' };
    return { color: 'bg-green-500', label: 'Optimal' };
  };

  const sortedZones = useMemo(() => {
    if (!zones) return [];
    return Object.entries(zones)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => {
        const numA = parseInt(a.id.replace('zone', ''));
        const numB = parseInt(b.id.replace('zone', ''));
        return numA - numB;
      });
  }, [zones]);

  if (!zones || sortedZones.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500">
        No zone data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Oven visualization */}
      <div className="relative bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
          {sortedZones.map((zone, index) => {
            const efficiency = getEfficiencyIndicator(zone);
            const zoneNum = index + 1;
            const isPreheat = zoneNum <= 3;
            const isSoak = zoneNum >= 4 && zoneNum <= 6;
            const isReflow = zoneNum >= 7 && zoneNum <= 8;
            const isCooling = zoneNum >= 9;

            return (
              <div
                key={zone.id}
                onClick={() => onZoneClick && onZoneClick(zone)}
                className={`flex-1 min-w-[80px] p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${getTemperatureColor(zone.avgTemp)}`}
              >
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
                    {isPreheat ? 'Preheat' : isSoak ? 'Soak' : isReflow ? 'Reflow' : 'Cool'}
                  </div>
                  <div className="text-xs font-medium text-slate-300 mb-2">Zone {zoneNum}</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {zone.avgTemp.toFixed(0)}°
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${efficiency.color}`} />
                    <span className="text-[10px] text-slate-400">{efficiency.label}</span>
                  </div>
                </div>
                {/* Upper/Lower indicators */}
                <div className="mt-2 pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-1 text-[10px]">
                  <div className="text-center">
                    <div className="text-slate-500">Upper</div>
                    <div className="text-slate-300">{zone.upper.toFixed(0)}°</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500">Lower</div>
                    <div className="text-slate-300">{zone.lower.toFixed(0)}°</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conveyor visualization */}
        <div className="mt-3 relative">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 animate-pulse"
              style={{ width: '100%' }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <span className="text-[10px] text-slate-400">Entry</span>
            <span className="text-[10px] text-slate-400">Exit</span>
          </div>
        </div>
      </div>

      {/* Temperature legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-700/50 border border-blue-500" />
          <span className="text-slate-400">&lt;150°C</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-700/50 border border-yellow-500" />
          <span className="text-slate-400">150-180°C</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-700/50 border border-orange-500" />
          <span className="text-slate-400">180-210°C</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-600/50 border border-red-500" />
          <span className="text-slate-400">&gt;210°C</span>
        </div>
      </div>
    </div>
  );
}
