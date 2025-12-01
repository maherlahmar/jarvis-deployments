import { motion } from 'framer-motion';
import clsx from 'clsx';
import useStore from '../store/useStore';

function ZoneSelector() {
  const { selectedZones, setSelectedZones } = useStore();

  const toggleZone = (zone) => {
    if (selectedZones.includes(zone)) {
      if (selectedZones.length > 1) {
        setSelectedZones(selectedZones.filter((z) => z !== zone));
      }
    } else {
      setSelectedZones([...selectedZones, zone].sort((a, b) => a - b));
    }
  };

  const selectAll = () => {
    setSelectedZones([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  };

  const selectNone = () => {
    setSelectedZones([1]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-dark-400">Temperature Zones</span>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            All
          </button>
          <span className="text-dark-600">|</span>
          <button
            onClick={selectNone}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((zone) => {
          const isSelected = selectedZones.includes(zone);
          return (
            <motion.button
              key={zone}
              onClick={() => toggleZone(zone)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                'w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200',
                isSelected
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-500'
              )}
            >
              {zone}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default ZoneSelector;
