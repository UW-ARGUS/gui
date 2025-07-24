import { useEffect, useRef, useState } from 'react';
import { Maximize2, X, Play, Pause } from 'lucide-react';
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
  const pollIntervalRef = useRef(null);
  
  //state for start/pause polling
  const [isPolling, setIsPolling] = useState(true);

  //polling
  const startPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    pollIntervalRef.current = setInterval(() => {
      if (sceneRef.current) {
        loadModel(sceneRef.current, './assets/mymy_room.glb');
      }
    }, 7000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  //handling polling state changes
  useEffect(() => {
    if (isPolling) {
      startPolling();
    } else {
      stopPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [isPolling]);

  // function to load/reload the model
  const loadModel = (scene, path) => {
    const loader = new GLTFLoader();
    
    const cacheBustedPath = `${path}?t=${Date.now()}`;
    
    loader.load(cacheBustedPath, (gltf) => {
      //delete current model
      if (currentModelRef.current) {
        scene.remove(currentModelRef.current);
        
        //removing previous material
        currentModelRef.current.traverse((child) => {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => {
                if (material.map) material.map.dispose();
                if (material.normalMap) material.normalMap.dispose();
                if (material.roughnessMap) material.roughnessMap.dispose();
                if (material.metalnessMap) material.metalnessMap.dispose();
                material.dispose();
              });
            } else {
              if (child.material.map) child.material.map.dispose();
              if (child.material.normalMap) child.material.normalMap.dispose();
              if (child.material.roughnessMap) child.material.roughnessMap.dispose();
              if (child.material.metalnessMap) child.material.metalnessMap.dispose();
              child.material.dispose();
            }
          }
        });
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

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    
    //adjusting resolution and pixel size
    const fixedWidth = 384
    const fixedHeight = 384;
    
    renderer.setSize(fixedWidth, fixedHeight);
    renderer.setClearColor(0x222222);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.imageRendering = 'pixelated';
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight1.position.set(10, 10, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-10, 5, -5);
    scene.add(directionalLight2);

    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(0, -10, 0);
    scene.add(fillLight);

    // initial model load
    loadModel(scene, './assets/mymy_room.glb');

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
        // Update camera aspect ratio to match the widget's aspect ratio
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        
        // Keep the same fixed low resolution (pixels stay the same size)
        const fixedWidth = 384;
        const fixedHeight = 384;
        renderer.setSize(fixedWidth, fixedHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
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
          {isPolling ? (
            <Pause size={20} onClick={togglePolling} className="control-button" title="Pause polling" />
          ) : (
            <Play size={20} onClick={togglePolling} className="control-button" title="Start polling" />
          )}
          {isExpanded ? (
            <X size={20} onClick={onClose} className="control-button" />
          ) : (
            <Maximize2 size={20} onClick={onExpand} className="control-button" />
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