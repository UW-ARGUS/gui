import { Maximize2, X, Activity } from 'lucide-react';
import { mockData } from '../data/mockData';

function SystemWidget({ isExpanded, onExpand, onClose, connectionStatus }) {
  const getConnectionStatus = () => {
    if (connectionStatus.isConnected) {
      return { text: 'Connected', class: 'status-active' };
    } else if (connectionStatus.error) {
      return { text: 'Disconnected', class: 'status-error' };
    } else {
      return { text: 'Connecting...', class: 'status-warning' };
    }
  };

  const connStatus = getConnectionStatus();

  return (
    <div className="widget">
      <div className="widget-header">
        <h3>System</h3>
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
          <span className="metric-label">Connection</span>
          <span className={`metric-value ${connStatus.class}`}>
            {connStatus.text}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Sensors Connected</span>
          <span className="metric-value">{mockData.system.sensorsConnected}</span>
        </div>
      </div>
    </div>
  );
}

export default SystemWidget; 