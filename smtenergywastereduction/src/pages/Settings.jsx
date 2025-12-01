import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Zap, Thermometer, Clock, Save } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    powerFactorThreshold: 0.92,
    idlePowerMax: 15,
    tempOvershootMax: 10,
    idleDurationWarning: 15,
    idleDurationCritical: 30,
    emailNotifications: true,
    criticalAlerts: true,
    warningAlerts: true,
    infoAlerts: false,
    refreshInterval: 2,
    energyRate: 0.12
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">Configure thresholds and notification preferences</p>
        </div>
        <button onClick={handleSave} className="btn btn-primary">
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Thresholds */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Energy Thresholds</h3>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Power Factor Minimum (0.80 - 1.00)
              </label>
              <input
                type="number"
                min="0.80"
                max="1.00"
                step="0.01"
                value={settings.powerFactorThreshold}
                onChange={(e) => handleChange('powerFactorThreshold', parseFloat(e.target.value))}
                className="input"
              />
              <p className="text-xs text-slate-500 mt-1">Alert when power factor drops below this value</p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Maximum Idle Power (kW)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={settings.idlePowerMax}
                onChange={(e) => handleChange('idlePowerMax', parseInt(e.target.value))}
                className="input"
              />
              <p className="text-xs text-slate-500 mt-1">Alert when idle power consumption exceeds this value</p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Electricity Rate ($/kWh)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={settings.energyRate}
                onChange={(e) => handleChange('energyRate', parseFloat(e.target.value))}
                className="input"
              />
              <p className="text-xs text-slate-500 mt-1">Used for cost calculations</p>
            </div>
          </div>
        </div>

        {/* Temperature Thresholds */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Temperature Thresholds</h3>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Maximum Temperature Overshoot (°C)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={settings.tempOvershootMax}
                onChange={(e) => handleChange('tempOvershootMax', parseInt(e.target.value))}
                className="input"
              />
              <p className="text-xs text-slate-500 mt-1">Alert when zone temperature exceeds target by this amount</p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Zone Imbalance Threshold (°C)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={15}
                className="input"
              />
              <p className="text-xs text-slate-500 mt-1">Alert when upper/lower heater difference exceeds this value</p>
            </div>
          </div>
        </div>

        {/* Idle Detection */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Idle Detection</h3>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Warning Threshold (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={settings.idleDurationWarning}
                onChange={(e) => handleChange('idleDurationWarning', parseInt(e.target.value))}
                className="input"
              />
              <p className="text-xs text-slate-500 mt-1">Trigger warning alert after this idle duration</p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Critical Threshold (minutes)
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={settings.idleDurationCritical}
                onChange={(e) => handleChange('idleDurationCritical', parseInt(e.target.value))}
                className="input"
              />
              <p className="text-xs text-slate-500 mt-1">Trigger critical alert after this idle duration</p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Data Refresh Interval (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.refreshInterval}
                onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                className="input"
              />
              <p className="text-xs text-slate-500 mt-1">How often to update real-time data</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Email Notifications</p>
                <p className="text-xs text-slate-500">Receive alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Critical Alerts</p>
                <p className="text-xs text-slate-500">Show critical severity alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.criticalAlerts}
                  onChange={(e) => handleChange('criticalAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Warning Alerts</p>
                <p className="text-xs text-slate-500">Show warning severity alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.warningAlerts}
                  onChange={(e) => handleChange('warningAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Info Alerts</p>
                <p className="text-xs text-slate-500">Show informational alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.infoAlerts}
                  onChange={(e) => handleChange('infoAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-white">About</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Application</p>
              <p className="text-white font-medium">SMT Energy Monitor</p>
            </div>
            <div>
              <p className="text-slate-400">Version</p>
              <p className="text-white font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-slate-400">Equipment</p>
              <p className="text-white font-medium">Reflow Oven</p>
            </div>
            <div>
              <p className="text-slate-400">Data Source</p>
              <p className="text-white font-medium">Simulated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
