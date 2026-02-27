import { useState, useEffect } from 'react';
import { Maximize2, X, Activity } from 'lucide-react';
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
  latency: { icon: Activity, label: 'Latency', unit: 'ms', color: '#8884d8', domain: [0, 100] }
};

// Reusable Chart Component
function MetricChart({ data, metricKey }) {
  const config = METRICS_CONFIG[metricKey];
  
  return (
    <div className="chart-section">
      <h4>{config.label} ({config.unit})</h4>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height="100%">
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
    </div>
  );
}

function TimeSeriesGraphWidget({ isExpanded, onExpand, onClose }) {
  const [data, setData] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({ latency: 23 });

  useEffect(() => {
    let isMounted = true;

    const fetchLatency = async () => {
      try {
        const response = await fetch('/api/latency');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { latencyMs } = await response.json();
        if (!isMounted || latencyMs == null) return;

        const latency = Math.max(0, Number(latencyMs));
        const timestamp = Date.now();
        const newMetrics = { latency };
        const newDataPoint = {
          time: new Date(timestamp).toLocaleTimeString(),
          timestamp,
          ...newMetrics
        };

        setCurrentMetrics(newMetrics);
        setData(prev => [...prev, newDataPoint].slice(-50));
      } catch (err) {
        console.error('Failed to fetch latency:', err);
      }
    };

    // Initial fill
    fetchLatency();

    // Poll every second
    const interval = setInterval(fetchLatency, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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
              <ResponsiveContainer width="100%" height="100%">
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