import { useState, useEffect } from 'react';
import { Maximize2, X, Thermometer, Activity, Battery } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Shared configurations
const CHART_CONFIG = {
  cartesianGrid: { strokeDasharray: "3 3", stroke: "rgba(255, 255, 255, 0.1)" },
  xAxis: { 
    tick: { fontSize: 10 }, 
    interval: "preserveStartEnd",
    axisLine: false,
    tickLine: false
  },
  yAxis: { tick: { fontSize: 10 }, axisLine: false, tickLine: false },
  tooltip: {
    contentStyle: {
      background: 'rgba(30, 30, 30, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      fontSize: '12px'
    }
  },
  line: { strokeWidth: 2, dot: false, animationDuration: 500 }
};

const METRICS_CONFIG = {
  temperature: { icon: Thermometer, label: 'Temperature', unit: '°C', color: '#82ca9d', domain: [15, 35] },
  latency: { icon: Activity, label: 'Latency', unit: 'ms', color: '#8884d8', domain: [0, 100] },
  battery: { icon: Battery, label: 'Battery', unit: '%', color: '#ffc658', domain: [0, 100] }
};

// Reusable Chart Component
function MetricChart({ data, metricKey, height = 150 }) {
  const config = METRICS_CONFIG[metricKey];
  
  return (
    <div className="chart-section">
      <h4>{config.label} ({config.unit})</h4>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid {...CHART_CONFIG.cartesianGrid} />
          <XAxis 
            {...CHART_CONFIG.xAxis}
            dataKey="timestamp"
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis {...CHART_CONFIG.yAxis} domain={config.domain} />
          <Tooltip 
            {...CHART_CONFIG.tooltip}
            labelFormatter={(value) => `Time: ${new Date(value).toLocaleTimeString()}`}
            formatter={(value) => [`${value.toFixed(1)}${config.unit}`, config.label]}
          />
          <Line 
            {...CHART_CONFIG.line}
            type="monotone" 
            dataKey={metricKey}
            stroke={config.color}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TimeSeriesGraphWidget({ isExpanded, onExpand, onClose }) {
  const [data, setData] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({ temperature: 24, latency: 23, battery: 80 });

  useEffect(() => {
    const generateDataPoint = (timestamp) => {
      const newMetrics = {
        temperature: Math.max(15, Math.min(35, currentMetrics.temperature + (Math.random() - 0.5) * 2)),
        latency: Math.max(5, Math.min(100, currentMetrics.latency + (Math.random() - 0.5) * 10)),
        battery: Math.max(0, Math.min(100, currentMetrics.battery + (Math.random() - 0.5) * 1))
      };
      
      setCurrentMetrics(newMetrics);
      return { time: new Date(timestamp).toLocaleTimeString(), timestamp, ...newMetrics };
    };

    // Generate initial data
    const startTime = Date.now();
    const initialData = Array.from({ length: 20 }, (_, i) => 
      generateDataPoint(startTime - (19 - i) * 1000)
    );
    setData(initialData);

    // Start real-time updates
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        const newDataPoint = generateDataPoint(Date.now());
        setData(prev => [...prev, newDataPoint].slice(-50));
      }, 1000);

      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(startTimeout);
  }, []);

  return (
    <div className="widget">
      <div className="widget-header">
        <h3>System Metrics</h3>
        <div className="widget-controls">
          {isExpanded ? (
            <X size={20} onClick={onClose} className="control-button" />
          ) : (
            <Maximize2 size={20} onClick={onExpand} className="control-button" />
          )}
        </div>
      </div>
      
      <div className="widget-content">
        {!isExpanded ? (
          <div className="metric-summary">
            <div className="metric large">
              <Activity size={24} />
              <span className="metric-label">Latency</span>
              <span className="metric-value">{currentMetrics.latency.toFixed(1)}ms</span>
            </div>
            <div className="mini-chart">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data.slice(-15)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="timestamp"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: 'rgba(255, 255, 255, 0.6)' }}
                    interval="preserveStartEnd"
                    tickFormatter={(value) => `${new Date(value).getSeconds().toString().padStart(2, '0')}s`}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.6)' }}
                    domain={[0, 100]}
                    tickFormatter={(value) => value.toFixed(0)}
                  />
                  <Tooltip 
                    contentStyle={CHART_CONFIG.tooltip.contentStyle}
                    formatter={(value) => [`${value.toFixed(1)}ms`, 'Latency']}
                    labelFormatter={(label) => `Time: ${new Date(label).toLocaleTimeString()}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                    animationDuration={500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="expanded-metrics">
            <div className="metrics-grid">
              {Object.entries(METRICS_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div key={key} className="metric">
                    <Icon size={20} />
                    <span className="metric-label">{config.label}</span>
                    <span className="metric-value">
                      {currentMetrics[key].toFixed(1)}{config.unit}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="charts-container">
              {Object.keys(METRICS_CONFIG).map(metricKey => (
                <MetricChart key={metricKey} data={data} metricKey={metricKey} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimeSeriesGraphWidget; 