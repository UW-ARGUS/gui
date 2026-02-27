import { useState } from 'react';
import { Maximize2, X, Activity, RefreshCw, Power } from 'lucide-react';
import { mockData } from '../data/mockData';

function SystemWidget({ isExpanded, onExpand, onClose, connectionStatus }) {
  const [executing, setExecuting] = useState(null);

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

  const runScript = async (script, action) => {
    if (executing) return;
    setExecuting(script);
    try {
      await fetch('/api/execute-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, action }),
      });
    } catch (err) {
      console.error(`Failed to execute ${script}:`, err);
    } finally {
      setExecuting(null);
    }
  };

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
        <div className="system-actions">
          <button
            className={`action-button restart-button ${executing === 'start_embedded.sh' ? 'executing' : ''}`}
            onClick={() => runScript('start_embedded.sh', 'restart_embedded')}
            disabled={!!executing}
          >
            <RefreshCw size={16} />
            {executing === 'start_embedded.sh' ? 'Restarting...' : 'Restart Embedded'}
          </button>
          <button
            className={`action-button power-button ${executing === 'power_off.sh' ? 'executing' : ''}`}
            onClick={() => runScript('power_off.sh', 'power_off')}
            disabled={!!executing}
          >
            <Power size={16} />
            {executing === 'power_off.sh' ? 'Powering Off...' : 'Power Off'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SystemWidget; 