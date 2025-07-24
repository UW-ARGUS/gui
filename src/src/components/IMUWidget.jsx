import { Maximize2, X, Activity } from 'lucide-react';
import { mockData } from '../data/mockData';

function IMUWidget({ isExpanded, onExpand, onClose }) {
  // Use static mock data instead of generated data
  const imuData = mockData.imu;

  const formatValue = (value) => {
    return typeof value === 'number' ? value.toFixed(2) : '0.00';
  };

  return (
    <div className="widget">
      <div className="widget-header">
        <h3>IMU Data</h3>
        <div className="widget-controls">
          {isExpanded ? (
            <X size={20} onClick={onClose} className="control-button" />
          ) : (
            <Maximize2 size={20} onClick={onExpand} className="control-button" />
          )}
        </div>
      </div>
      <div className="widget-content">
        <div className="metric">
          <Activity size={20} />
          <span className="metric-label">State</span>
          <span className={`metric-value ${imuData.state === 'moving' ? 'status-active' : ''}`}>
            {imuData.state}
          </span>
        </div>
        
        <div>
          <h4>Acceleration (m/s²)</h4>
          <div className="metric">
            <span className="metric-label">X:</span>
            <span className="metric-value">{formatValue(imuData.accel.x)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Y:</span>
            <span className="metric-value">{formatValue(imuData.accel.y)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Z:</span>
            <span className="metric-value">{formatValue(imuData.accel.z)}</span>
          </div>
        </div>

        <div>
          <h4>Gyroscope (°/s)</h4>
          <div className="metric">
            <span className="metric-label">X:</span>
            <span className="metric-value">{formatValue(imuData.gyro.x)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Y:</span>
            <span className="metric-value">{formatValue(imuData.gyro.y)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Z:</span>
            <span className="metric-value">{formatValue(imuData.gyro.z)}</span>
          </div>
        </div>

        <div>
          <h4>Magnetometer (A/m)</h4>
          <div className="metric">
            <span className="metric-label">X:</span>
            <span className="metric-value">{formatValue(imuData.mag.x)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Y:</span>
            <span className="metric-value">{formatValue(imuData.mag.y)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Z:</span>
            <span className="metric-value">{formatValue(imuData.mag.z)}</span>
          </div>
        </div>

        <div className="metric">
          <span className="metric-label">Timestamp</span>
          <span className="metric-value">{new Date(imuData.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

export default IMUWidget; 