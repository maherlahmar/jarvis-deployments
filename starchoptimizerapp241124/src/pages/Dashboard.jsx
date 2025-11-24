import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gauge,
  Droplets,
  Thermometer,
  Wind,
  TrendingUp,
  Zap,
  Target,
  Clock,
} from 'lucide-react';
import useProcessStore from '../store/useProcessStore';
import KPICard from '../components/KPICard';
import ProcessMetricCard from '../components/ProcessMetricCard';
import RecommendationCard from '../components/RecommendationCard';
import AlarmPanel from '../components/AlarmPanel';
import TrendChart from '../components/TrendChart';

const Dashboard = () => {
  const {
    processData,
    kpis,
    recommendations,
    setConnectionStatus,
    simulateLiveData,
  } = useProcessStore();

  useEffect(() => {
    setConnectionStatus(true);
    simulateLiveData();
  }, [setConnectionStatus, simulateLiveData]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Overview */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Key Performance Indicators</h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <KPICard
              title="Overall Equipment Effectiveness"
              value={kpis.oee}
              percentage
              status={kpis.oee >= 85 ? 'success' : kpis.oee >= 75 ? 'warning' : 'error'}
              icon={Target}
              trend={{
                direction: kpis.oee >= 87 ? 'up' : 'neutral',
                value: 2.3,
              }}
            />
            <KPICard
              title="Product Yield"
              value={kpis.yield}
              percentage
              status={kpis.yield >= 92 ? 'success' : 'warning'}
              icon={TrendingUp}
              trend={{
                direction: 'up',
                value: 1.5,
              }}
            />
            <KPICard
              title="Energy Efficiency"
              value={kpis.energyEfficiency}
              percentage
              status={kpis.energyEfficiency >= 90 ? 'success' : 'warning'}
              icon={Zap}
              trend={{
                direction: 'neutral',
                value: 0.2,
              }}
            />
            <KPICard
              title="Quality Index"
              value={kpis.qualityIndex}
              percentage
              status={kpis.qualityIndex >= 95 ? 'success' : 'warning'}
              icon={Gauge}
              trend={{
                direction: 'up',
                value: 0.8,
              }}
            />
          </motion.div>
        </section>

        {/* Process Metrics */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Real-Time Process Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ProcessMetricCard
              label="Temperature"
              value={processData.temperature}
              unit="°C"
              min={60}
              max={75}
              optimal={{ min: 65, max: 70 }}
              icon={Thermometer}
            />
            <ProcessMetricCard
              label="Viscosity"
              value={processData.viscosity}
              unit="cP"
              min={10}
              max={20}
              optimal={{ min: 14, max: 16 }}
              icon={Droplets}
            />
            <ProcessMetricCard
              label="Moisture Content"
              value={processData.moisture}
              unit="%"
              min={10}
              max={15}
              optimal={{ min: 12, max: 13.5 }}
              icon={Droplets}
            />
            <ProcessMetricCard
              label="Flow Rate"
              value={processData.flowRate}
              unit="kg/h"
              min={700}
              max={1000}
              optimal={{ min: 800, max: 900 }}
              icon={Wind}
            />
            <ProcessMetricCard
              label="Pressure"
              value={processData.pressure}
              unit="bar"
              min={2}
              max={3}
              optimal={{ min: 2.2, max: 2.5 }}
              icon={Gauge}
            />
            <ProcessMetricCard
              label="pH Level"
              value={processData.pH}
              unit=""
              min={6}
              max={7}
              optimal={{ min: 6.3, max: 6.7 }}
              icon={Droplets}
            />
            <ProcessMetricCard
              label="Solids Content"
              value={processData.solidsContent}
              unit="%"
              min={85}
              max={90}
              optimal={{ min: 86, max: 88 }}
              icon={Target}
            />
            <ProcessMetricCard
              label="Drier Speed"
              value={processData.drierSpeed}
              unit="RPM"
              min={1000}
              max={1500}
              optimal={{ min: 1150, max: 1300 }}
              icon={Wind}
            />
          </div>
        </section>

        {/* Setpoint Recommendations */}
        <section>
          <h2 className="text-2xl font-bold mb-4">AI-Powered Setpoint Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecommendationCard
              parameter="Temperature"
              currentValue={recommendations.temperature.current}
              recommendedValue={recommendations.temperature.recommended}
              confidence={recommendations.temperature.confidence}
              unit="°C"
              impact="high"
            />
            <RecommendationCard
              parameter="Viscosity"
              currentValue={recommendations.viscosity.current}
              recommendedValue={recommendations.viscosity.recommended}
              confidence={recommendations.viscosity.confidence}
              unit="cP"
              impact="medium"
            />
            <RecommendationCard
              parameter="Flow Rate"
              currentValue={recommendations.flowRate.current}
              recommendedValue={recommendations.flowRate.recommended}
              confidence={recommendations.flowRate.confidence}
              unit="kg/h"
              impact="high"
            />
            <RecommendationCard
              parameter="Drier Speed"
              currentValue={recommendations.drierSpeed.current}
              recommendedValue={recommendations.drierSpeed.recommended}
              confidence={recommendations.drierSpeed.confidence}
              unit="RPM"
              impact="medium"
            />
          </div>
        </section>

        {/* Charts and Alarms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart parameters={['temperature', 'viscosity', 'moisture']} />
          <AlarmPanel />
        </div>

        {/* Additional Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Production Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Throughput:</span>
                <span className="font-semibold">{kpis.throughput.toFixed(0)} kg/h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Downtime:</span>
                <span className="font-semibold">{kpis.downtime.toFixed(1)} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Availability:</span>
                <span className="font-semibold">{((24 - kpis.downtime) / 24 * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Shift Performance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Shift:</span>
                <span className="font-semibold">Day Shift</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Shift Start:</span>
                <span className="font-semibold">07:00 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Time Remaining:</span>
                <span className="font-semibold">4h 23m</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
