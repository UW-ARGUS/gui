import { Maximize2, X, Camera } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

const imageModules = import.meta.glob('../../assets/received_*.jpg', { query: '?url', import: 'default', eager: true });

function CamerasWidget({ isExpanded, onExpand, onClose }) {
  const [imageErrors, setImageErrors] = useState({});
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());

  const cameraFiles = useMemo(() => [
    'received_0.jpg',
    'received_2.jpg',
    'received_4.jpg',
    'received_6.jpg'
  ], []);

  const imageUrls = useMemo(() => cameraFiles.map(
    (filename) => imageModules[`../../assets/${filename}`] ?? null
  ), [cameraFiles]);

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

  // Poll every 1s so new images (same filename) show immediately via cache-busting
  useEffect(() => {
    const pollInterval = setInterval(() => {
      setRefreshTimestamp(Date.now());
    }, 1000);

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
              {!imageUrls[index] || imageErrors[index] ? (
                <div className="camera-placeholder">
                  <Camera size={32} />
                  <span>Camera {index + 1}</span>
                  <small>{filename}</small>
                </div>
              ) : (
                <img
                  src={`${imageUrls[index]}?t=${refreshTimestamp}`}
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