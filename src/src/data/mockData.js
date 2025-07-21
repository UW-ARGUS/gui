export const mockData = {
  system: {
    sensorsConnected: 12,
    status: 'Active'
  },
  // Static IMU data with realistic values
  imu: {
    state: 'moving',
    accel: {
      x: 2.45,
      y: -1.23,
      z: 9.78
    },
    gyro: {
      x: 15.67,
      y: -8.34,
      z: 23.12
    },
    mag: {
      x: 32.45,
      y: -18.67,
      z: 48.92
    },
    timestamp: 1703621400000 // Fixed timestamp
  },
  environment: {
    temperature: 24,
    latency: 23,
    battery: 80
  },
  cameras: [
    '/api/placeholder/200/150?text=Camera+1',
    '/api/placeholder/200/150?text=Camera+2', 
    '/api/placeholder/200/150?text=Camera+3',
    '/api/placeholder/200/150?text=Camera+4'
  ]
}; 