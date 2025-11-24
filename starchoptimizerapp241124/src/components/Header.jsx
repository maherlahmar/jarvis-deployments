import React from 'react';
import { Moon, Sun, Activity, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { formatDateTime } from '../utils/formatters';
import useProcessStore from '../store/useProcessStore';

const Header = () => {
  const { darkMode, toggleDarkMode, isConnected, lastUpdate } = useProcessStore();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Facilis</h1>
              <p className="text-xs text-muted-foreground">Starch Process Optimizer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Last Update:</span>
              <span className="font-medium text-foreground">
                {lastUpdate ? formatDateTime(lastUpdate) : 'N/A'}
              </span>
            </div>

            <motion.div
              animate={{ scale: isConnected ? 1 : [1, 1.1, 1] }}
              transition={{ repeat: isConnected ? 0 : Infinity, duration: 1.5 }}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
                isConnected
                  ? 'bg-success/10 text-success'
                  : 'bg-error/10 text-error'
              )}
            >
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>Disconnected</span>
                </>
              )}
            </motion.div>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
