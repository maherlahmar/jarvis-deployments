import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Shield,
  Sliders,
  Database,
  RefreshCw,
  Save,
  RotateCcw
} from 'lucide-react';
import useStore from '../store/useStore';
import { formatNumber } from '../utils/formatters';
import clsx from 'clsx';

function Settings() {
  const {
    darkMode,
    toggleDarkMode,
    notificationsEnabled,
    toggleNotifications,
    soundEnabled,
    toggleSound,
    parameters
  } = useStore();

  const [thresholds, setThresholds] = useState(() => {
    const initial = {};
    Object.keys(parameters).forEach(key => {
      const p = parameters[key];
      initial[key] = {
        ucl: p.ucl,
        lcl: p.lcl,
        usl: p.usl,
        lsl: p.lsl
      };
    });
    return initial;
  });

  const [driftSettings, setDriftSettings] = useState({
    cusumK: 0.5,
    cusumH: 5.0,
    ewmaLambda: 0.2,
    ewmaL: 3.0,
    trendWindow: 50,
    shiftThreshold: 1.5
  });

  const [alertSettings, setAlertSettings] = useState({
    cooldownMinutes: 5,
    autoAcknowledge: false,
    emailNotifications: false,
    criticalOnly: false
  });

  const [saved, setSaved] = useState(false);

  const handleThresholdChange = (paramKey, field, value) => {
    setThresholds(prev => ({
      ...prev,
      [paramKey]: {
        ...prev[paramKey],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleDriftSettingChange = (field, value) => {
    setDriftSettings(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleAlertSettingChange = (field, value) => {
    setAlertSettings(prev => ({
      ...prev,
      [field]: typeof value === 'boolean' ? value : parseFloat(value) || 0
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    Object.keys(parameters).forEach(key => {
      const p = parameters[key];
      setThresholds(prev => ({
        ...prev,
        [key]: {
          ucl: p.ucl,
          lcl: p.lcl,
          usl: p.usl,
          lsl: p.lsl
        }
      }));
    });
    setDriftSettings({
      cusumK: 0.5,
      cusumH: 5.0,
      ewmaLambda: 0.2,
      ewmaL: 3.0,
      trendWindow: 50,
      shiftThreshold: 1.5
    });
  };

  const parameterKeys = Object.keys(parameters);

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-primary-500" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">General Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-slate-400" /> : <Sun className="w-5 h-5 text-slate-400" />}
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-slate-500">Toggle dark/light theme</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={clsx(
                  'relative w-12 h-6 rounded-full transition-colors',
                  darkMode ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    darkMode ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Notifications</p>
                  <p className="text-sm text-slate-500">Enable alert notifications</p>
                </div>
              </div>
              <button
                onClick={toggleNotifications}
                className={clsx(
                  'relative w-12 h-6 rounded-full transition-colors',
                  notificationsEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-slate-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Sound Alerts</p>
                  <p className="text-sm text-slate-500">Play sound for critical alerts</p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={clsx(
                  'relative w-12 h-6 rounded-full transition-colors',
                  soundEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning-500/10 rounded-lg">
              <Sliders className="w-5 h-5 text-warning-500" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Drift Detection</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">CUSUM K (Slack)</label>
              <input
                type="number"
                step="0.1"
                value={driftSettings.cusumK}
                onChange={(e) => handleDriftSettingChange('cusumK', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">CUSUM H (Threshold)</label>
              <input
                type="number"
                step="0.5"
                value={driftSettings.cusumH}
                onChange={(e) => handleDriftSettingChange('cusumH', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">EWMA Lambda</label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                max="1"
                value={driftSettings.ewmaLambda}
                onChange={(e) => handleDriftSettingChange('ewmaLambda', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">EWMA L (Control Width)</label>
              <input
                type="number"
                step="0.5"
                value={driftSettings.ewmaL}
                onChange={(e) => handleDriftSettingChange('ewmaL', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Trend Window Size</label>
              <input
                type="number"
                step="10"
                value={driftSettings.trendWindow}
                onChange={(e) => handleDriftSettingChange('trendWindow', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Shift Threshold (sigmas)</label>
              <input
                type="number"
                step="0.5"
                value={driftSettings.shiftThreshold}
                onChange={(e) => handleDriftSettingChange('shiftThreshold', e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-danger-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-danger-500" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Alert Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Cooldown (minutes)</label>
              <input
                type="number"
                value={alertSettings.cooldownMinutes}
                onChange={(e) => handleAlertSettingChange('cooldownMinutes', e.target.value)}
                className="input"
              />
              <p className="text-xs text-slate-400 mt-1">Time between same-type alerts</p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Auto-acknowledge</p>
                <p className="text-xs text-slate-500">After 1 hour</p>
              </div>
              <button
                onClick={() => handleAlertSettingChange('autoAcknowledge', !alertSettings.autoAcknowledge)}
                className={clsx(
                  'relative w-10 h-5 rounded-full transition-colors',
                  alertSettings.autoAcknowledge ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                    alertSettings.autoAcknowledge ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Critical only</p>
                <p className="text-xs text-slate-500">Only show critical alerts</p>
              </div>
              <button
                onClick={() => handleAlertSettingChange('criticalOnly', !alertSettings.criticalOnly)}
                className={clsx(
                  'relative w-10 h-5 rounded-full transition-colors',
                  alertSettings.criticalOnly ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                    alertSettings.criticalOnly ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-success-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Control Limits Configuration</h3>
                <p className="text-sm text-slate-500">Configure UCL, LCL, USL, LSL for each parameter</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Target</th>
                <th>LCL</th>
                <th>UCL</th>
                <th>LSL</th>
                <th>USL</th>
              </tr>
            </thead>
            <tbody>
              {parameterKeys.map(key => {
                const p = parameters[key];
                const t = thresholds[key] || {};

                return (
                  <tr key={key}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.unit}</p>
                      </div>
                    </td>
                    <td className="text-success-500 font-medium">{formatNumber(p.target, 2)}</td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        value={t.lcl || ''}
                        onChange={(e) => handleThresholdChange(key, 'lcl', e.target.value)}
                        className="input w-24 text-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        value={t.ucl || ''}
                        onChange={(e) => handleThresholdChange(key, 'ucl', e.target.value)}
                        className="input w-24 text-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        value={t.lsl || ''}
                        onChange={(e) => handleThresholdChange(key, 'lsl', e.target.value)}
                        className="input w-24 text-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        value={t.usl || ''}
                        onChange={(e) => handleThresholdChange(key, 'usl', e.target.value)}
                        className="input w-24 text-sm"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-500/10 rounded-lg">
            <Database className="w-5 h-5 text-slate-500" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">System Information</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Version</p>
            <p className="font-medium text-slate-900 dark:text-white">1.0.0</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Parameters</p>
            <p className="font-medium text-slate-900 dark:text-white">{parameterKeys.length}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Update Rate</p>
            <p className="font-medium text-slate-900 dark:text-white">2 sec</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Data Retention</p>
            <p className="font-medium text-slate-900 dark:text-white">500 readings</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
