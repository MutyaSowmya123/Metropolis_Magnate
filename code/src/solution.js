import * as THREE from 'three';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

let renderer, scene, camera, metalBall, elements = [];
let moveDirection = new THREE.Vector3(0, 0, -1); // Initial movement direction

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

  // Generate and add elements randomly on the surface
  generateElements(20); // Change the number as per your requirement

  document.addEventListener('keydown', onKeyDown); // Listen for keydown events
  animate(); // Start the animation loop after initialization
};

const generateElements = (count) => {
  const elementGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const elementMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  
  for (let i = 0; i < count; i++) {
    const element = new THREE.Mesh(elementGeometry, elementMaterial);
    const randomX = Math.random() * 100 - 50; // Random x position within the plane
    const randomZ = Math.random() * 100 - 50; // Random z position within the plane
    element.position.set(randomX, 0.1, randomZ); // Set y position slightly above the plane
    scene.add(element);
    elements.push(element);
  }
};

const onKeyDown = (event) => {
  switch (event.key) {
    case 'ArrowUp':
      const frontDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      moveBall(frontDirection); // Move ball forward
      break;
    case 'ArrowDown':
      const backDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
      moveBall(backDirection); // Move ball backward
      break;
    case 'ArrowLeft':
      const leftDirection = new THREE.Vector3(-1, 0, 0).applyQuaternion(camera.quaternion);
      moveBall(leftDirection); // Move ball left
      break;
    case 'ArrowRight':
      const rightDirection = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      moveBall(rightDirection); // Move ball right
      break;
  }
};


const moveBall = (direction) => {
  // Project the movement direction onto the horizontal plane
  const horizontalDirection = new THREE.Vector3(direction.x, 0, direction.z).normalize();
  // Calculate the new position of the ball
  const newPosition = metalBall.position.clone().add(horizontalDirection.multiplyScalar(0.1)); // Adjust the movement speed as per your requirement
  
  // Move the ball to the new position
  metalBall.position.copy(newPosition);
  
  // Check for collision with elements
  elements.forEach((element, index) => {
    const elementDistance = element.position.distanceTo(metalBall.position);
    if (elementDistance < 0.3) { // Adjust the collision radius as per your requirement
      // Remove the element from the scene
      scene.remove(element);
      // Add the element to the ball's children so that it sticks to the ball
      metalBall.add(element);
      // Remove the element from the elements array
      elements.splice(index, 1);
    }
  });
};





const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

init(); // Call the init function to start the initialization process
