import { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize2, X, Play, Pause, Loader } from 'lucide-react';
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
  const isLoadingRef = useRef(false);
  
  const [isWatching, setIsWatching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const disposeModel = useCallback((model) => {
    model.traverse((child) => {
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
  }, []);

  const loadModel = useCallback((scene, path) => {
    if (isLoadingRef.current) {
      console.log('Load already in progress, skipping...');
      return;
    }
    
    isLoadingRef.current = true;
    setIsLoading(true);
    setLoadProgress(0);
    
    const loader = new GLTFLoader();
    const cacheBustedPath = `${path}?t=${Date.now()}`;
    
    loader.load(
      cacheBustedPath,
      (gltf) => {
        const newModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(newModel);
        const size = new THREE.Vector3();
        box.getSize(size);

        const targetSize = 6;
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = targetSize / maxDim;

        newModel.scale.setScalar(scale);
        newModel.rotation.y = Math.PI / 8;

        const scaledBox = new THREE.Box3().setFromObject(newModel);
        const center = new THREE.Vector3();
        scaledBox.getCenter(center);
        newModel.position.sub(center);

        scene.add(newModel);
        
        if (currentModelRef.current) {
          scene.remove(currentModelRef.current);
          disposeModel(currentModelRef.current);
        }
        
        currentModelRef.current = newModel;

        if (cameraRef.current && controlsRef.current) {
          const scaledSize = new THREE.Vector3();
          scaledBox.getSize(scaledSize);
          const maxScaledDim = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
          const cameraDistance = maxScaledDim * 1.5;
          
          cameraRef.current.position.set(0, cameraDistance * 0.7, cameraDistance);
          cameraRef.current.lookAt(0, 0, 0);
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
        
        isLoadingRef.current = false;
        setIsLoading(false);
        setLoadProgress(100);
      },
      (progress) => {
        if (progress.lengthComputable) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setLoadProgress(percent);
        }
      },
      (error) => {
        console.error('Error loading model:', error);
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    );
  }, [disposeModel]);

  const wasWatchingRef = useRef(isWatching);
  const glbPath = './assets/mymy_room.glb';

  useEffect(() => {
    // Reload when switching from paused to watching (but not on initial mount)
    if (isWatching && !wasWatchingRef.current && sceneRef.current) {
      loadModel(sceneRef.current, glbPath);
    }
    wasWatchingRef.current = isWatching;
    
    if (!isWatching) return;

    // Poll every 0.5s so when the GLB file is replaced (same name), the visualizer updates
    const pollInterval = setInterval(() => {
      if (sceneRef.current) {
        loadModel(sceneRef.current, glbPath);
      }
    }, 500);

    if (import.meta.hot) {
      const handleGlbUpdate = (data) => {
        console.log('GLB file changed:', data.file);
        if (sceneRef.current) {
          loadModel(sceneRef.current, glbPath);
        }
      };

      import.meta.hot.on('glb-update', handleGlbUpdate);

      return () => {
        import.meta.hot.off('glb-update', handleGlbUpdate);
        clearInterval(pollInterval);
      };
    }

    return () => clearInterval(pollInterval);
  }, [isWatching, loadModel]);

  const toggleWatching = () => {
    setIsWatching(!isWatching);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Reset loading state on mount (important for React 18 Strict Mode)
    isLoadingRef.current = false;

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

    // Store refs
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

    const loader = new GLTFLoader();
    const cacheBustedPath = `./assets/mymy_room.glb?t=${Date.now()}`;
    
    isLoadingRef.current = true;
    setIsLoading(true);
    setLoadProgress(0);
    
    loader.load(
      cacheBustedPath,
      (gltf) => {
        const newModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(newModel);
        const size = new THREE.Vector3();
        box.getSize(size);

        const targetSize = 6;
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = targetSize / maxDim;

        newModel.scale.setScalar(scale);
        newModel.rotation.y = Math.PI / 8;

        const scaledBox = new THREE.Box3().setFromObject(newModel);
        const center = new THREE.Vector3();
        scaledBox.getCenter(center);
        newModel.position.sub(center);

        scene.add(newModel);
        currentModelRef.current = newModel;

        const scaledSize = new THREE.Vector3();
        scaledBox.getSize(scaledSize);
        const maxScaledDim = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
        const cameraDistance = maxScaledDim * 1.5;
        
        camera.position.set(0, cameraDistance * 0.7, cameraDistance);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
        
        isLoadingRef.current = false;
        setIsLoading(false);
        setLoadProgress(100);
      },
      (progress) => {
        if (progress.lengthComputable) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setLoadProgress(percent);
        }
      },
      (error) => {
        console.error('Error loading model:', error);
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    );

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && camera && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        
        const fixedWidth = 384;
        const fixedHeight = 384;
        renderer.setSize(fixedWidth, fixedHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      // Reset refs on cleanup
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      currentModelRef.current = null;
      isLoadingRef.current = false;
      
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
          {isWatching ? (
            <Pause size={20} onClick={toggleWatching} className="control-button" title="Pause" />
          ) : (
            <Play size={20} onClick={toggleWatching} className="control-button" title="Play" />
          )}
          {isExpanded ? (
            <X size={20} onClick={onClose} className="control-button" />
          ) : (
            <Maximize2 size={20} onClick={onExpand} className="control-button" />
          )}
        </div>
      </div>
      <div className="widget-content" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
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
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(34, 34, 34, 0.7)',
            borderRadius: '8px',
            pointerEvents: 'none'
          }}>
            <Loader 
              size={32} 
              style={{ 
                animation: 'spin 1s linear infinite',
                color: '#fff'
              }} 
            />
            <span style={{ 
              color: '#fff', 
              marginTop: '8px',
              fontSize: '14px'
            }}>
              {loadProgress > 0 ? `Loading ${loadProgress}%` : 'Loading...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualizerWidget; 