import { Maximize2, X, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';

function CamerasWidget({ isExpanded, onExpand, onClose }) {
  const [imageErrors, setImageErrors] = useState({});
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());
  
  // Define the specific image files to load
  const cameraFiles = [
    'received_0.jpg',
    'received_2.jpg', 
    'received_4.jpg',
    'received_6.jpg'
  ];

  const handleImageError = (index) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const handleImageLoad = (index) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: false
    }));
  };

  // Polling for new images every 1000ms
  useEffect(() => {
    const pollInterval = setInterval(() => {
      setRefreshTimestamp(Date.now());
    }, 15000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  return (
    <div className="widget">
      <div className="widget-header">
        <h3>Cameras</h3>
        <div className="widget-controls">
          {isExpanded ? (
            <X size={20} onClick={onClose} className="control-button" />
          ) : (
            <Maximize2 size={20} onClick={onExpand} className="control-button" />
          )}
        </div>
      </div>
      <div className="widget-content">
        <div className="camera-grid">
          {cameraFiles.map((filename, index) => (
            <div key={index} className="camera-feed">
              {imageErrors[index] ? (
                <div className="camera-placeholder">
                  <Camera size={32} />
                  <span>Camera {index + 1}</span>
                  <small>{filename}</small>
                </div>
              ) : (
                <img 
                  src={`./assets/${filename}?t=${refreshTimestamp}`}
                  alt={`Camera ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                  onError={() => handleImageError(index)}
                  onLoad={() => handleImageLoad(index)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CamerasWidget; 