import { useState } from 'react';
import { 
  SystemWidget, 
  IMUWidget, 
  VisualizerWidget, 
  CamerasWidget, 
  TimeSeriesGraphWidget 
} from './components';
import './App.css';

function App() {
  const [expandedWidget, setExpandedWidget] = useState(null);

  const handleExpand = (widgetName) => {
    setExpandedWidget(widgetName);
  };

  const handleClose = () => {
    setExpandedWidget(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>A.R.G.U.S Dashboard</h1>
      </header>

      <main>
        <div className="dashboard">
                  <div className="dashboard-grid">
          {/* system widget */}
          <div className="system-widget">
              <SystemWidget
                isExpanded={expandedWidget === 'system'}
                onExpand={() => handleExpand('system')}
                onClose={handleClose}
              />
            </div>

            {/* IMU Data Widget */}
            <div className="imu-widget">
              <IMUWidget
                isExpanded={expandedWidget === 'imu'}
                onExpand={() => handleExpand('imu')}
                onClose={handleClose}
              />
            </div>

            {/* 3D Visualizer Widget */}
            <div className="visualizer-widget">
              <VisualizerWidget
                isExpanded={expandedWidget === 'visualizer'}
                onExpand={() => handleExpand('visualizer')}
                onClose={handleClose}
              />
            </div>

          {/* cameras widget */}
          <div className="cameras-widget">
              <CamerasWidget
                isExpanded={expandedWidget === 'cameras'}
                onExpand={() => handleExpand('cameras')}
                onClose={handleClose}
              />
            </div>

            {/* Time Series Graph Widget */}
            <div className="timeseries-widget">
              <TimeSeriesGraphWidget
                isExpanded={expandedWidget === 'timeseries'}
                onExpand={() => handleExpand('timeseries')}
                onClose={handleClose}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modal overlay for expanded widgets */}
      {expandedWidget && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {expandedWidget === 'system' && (
              <SystemWidget
                isExpanded={true}
                onExpand={() => {}}
                onClose={handleClose}
              />
            )}
            {expandedWidget === 'imu' && (
              <IMUWidget
                isExpanded={true}
                onExpand={() => {}}
                onClose={handleClose}
              />
            )}
            {expandedWidget === 'visualizer' && (
              <VisualizerWidget
                isExpanded={true}
                onExpand={() => {}}
                onClose={handleClose}
              />
            )}
            {expandedWidget === 'cameras' && (
              <CamerasWidget
                isExpanded={true}
                onExpand={() => {}}
                onClose={handleClose}
              />
            )}
            {expandedWidget === 'timeseries' && (
              <TimeSeriesGraphWidget
                isExpanded={true}
                onExpand={() => {}}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;