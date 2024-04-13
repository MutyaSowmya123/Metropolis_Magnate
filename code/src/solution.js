import * as THREE from 'three';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

let renderer, scene, camera, metalBall;
const moveSpeed = 0.1;

const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

const init = async () => {
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(4, 4, 4);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement); // Initialize OrbitControls
  controls.update(); // Update controls to reflect any changes

  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(directionalLight);
  const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
  scene.add(helper);

  const geometry = new THREE.PlaneGeometry(1, 1);
  const texture = new THREE.TextureLoader().load('./assets/road.jpeg');
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  plane.scale.set(100, 100, 100);
  scene.add(plane);

  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  metalBall = await load('./metalBall/scene.gltf');
  // Adjust the position of the metalBall
  metalBall.position.set(0, 1, 0); // Adjust the position as per your requirement
  metalBall.scale.set(0.01, 0.01, 0.01); // Adjust the scale as per your requirement
  scene.add(metalBall);

  console.log('made a scene', metalBall);

  document.addEventListener('keydown', onKeyDown); // Listen for keydown events
  animate(); // Start the animation loop after initialization
};

const onKeyDown = (event) => {
  switch (event.key) {
    case 'ArrowUp':
      metalBall.position.z -= moveSpeed; // Move ball forward
      break;
    case 'ArrowDown':
      metalBall.position.z += moveSpeed; // Move ball backward
      break;
    case 'ArrowLeft':
      metalBall.position.x -= moveSpeed; // Move ball left
      break;
    case 'ArrowRight':
      metalBall.position.x += moveSpeed; // Move ball right
      break;
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  if (renderer) {
    renderer.render(scene, camera);
  }
};

init(); // Call the init function to start the initialization process
