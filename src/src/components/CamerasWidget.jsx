import { Maximize2, X, Camera } from 'lucide-react';
import { mockData } from '../data/mockData';

function CamerasWidget({ isExpanded, onExpand, onClose }) {
  return (
    <div className="widget">
      <div className="widget-header">
        <h3>Cameras</h3>
        <div className="widget-controls">
          {isExpanded ? (
            <X size={16} onClick={onClose} className="control-button" />
          ) : (
            <Maximize2 size={16} onClick={onExpand} className="control-button" />
          )}
        </div>
      </div>
      <div className="widget-content">
        <div className="camera-grid">
          {mockData.cameras.map((camera, index) => (
            <div key={index} className="camera-feed">
              <div className="camera-placeholder">
                <Camera size={24} />
                <span>Camera {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CamerasWidget; 