import { useEffect, useRef } from 'react';
import { Maximize2, X } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function VisualizerWidget({ isExpanded, onExpand, onClose }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const currentModelRef = useRef(null);

  // function to load/reload the model
  const loadModel = (scene, path) => {
    const loader = new GLTFLoader();
    
    const cacheBustedPath = `${path}?t=${Date.now()}`;
    
    loader.load(cacheBustedPath, (gltf) => {
      if (currentModelRef.current) {
        scene.remove(currentModelRef.current);
      }
  
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
  
      const targetSize = 10;
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = targetSize / maxDim;
  
      model.scale.setScalar(scale);
      model.rotation.y = Math.PI / 8;
  
      const center = new THREE.Vector3();
      box.getCenter(center);
  
      // re-center the model geometry to origin
      model.position.sub(center);
  
      scene.add(model);
      currentModelRef.current = model;
  
      // reloading camera position
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 10, 5);
        cameraRef.current.lookAt(0, 0, 0);
      }
    }, undefined, (error) => {
      console.error('Error loading model:', error);
    });
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear any existing content
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x222222);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Store refs for polling
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // initial model load
    loadModel(scene, './assets/mymy_room.glb');

    // polling for file changes every 1000ms
    const pollInterval = setInterval(() => {
      if (sceneRef.current) {
        loadModel(sceneRef.current, './assets/mymy_room.glb');
      }
    }, 1000);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && camera && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="widget">
      <div className="widget-header">
        <h3>3D Visualizer</h3>
        <div className="widget-controls">
          {isExpanded ? (
            <X size={16} onClick={onClose} className="control-button" />
          ) : (
            <Maximize2 size={16} onClick={onExpand} className="control-button" />
          )}
        </div>
      </div>
      <div className="widget-content" style={{ padding: '0', overflow: 'hidden' }}>
        <div 
          ref={mountRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
            boxSizing: 'border-box'
          }} 
        />
      </div>
    </div>
  );
}

export default VisualizerWidget; 