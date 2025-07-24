import { Maximize2, X } from 'lucide-react';
import { mockData } from '../data/mockData';

function SystemWidget({ isExpanded, onExpand, onClose }) {
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
          <span className="metric-label">Sensors Connected</span>
          <span className="metric-value">{mockData.system.sensorsConnected}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Status</span>
          <span className="metric-value status-active">{mockData.system.status}</span>
        </div>
      </div>
    </div>
  );
}

export default SystemWidget; 