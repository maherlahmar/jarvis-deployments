import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';

function LoadingScreen({ message = 'Loading data...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center">
            <Zap className="w-10 h-10 text-primary-500" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-500/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">
          Reflow Oven Energy Dashboard
        </h2>

        <div className="flex items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          <span>{message}</span>
        </div>

        <div className="mt-8 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-green-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default LoadingScreen;
