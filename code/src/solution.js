import * as THREE from 'three';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

let renderer, scene, camera, metalBall;

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

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.rotateSpeed = 0.5;
  controls.enablePan = false;
  controls.enableZoom = false;

  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(directionalLight);
  const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
  scene.add(helper);

  const geometry = new THREE.PlaneGeometry(1, 1);
  const texture = new THREE.TextureLoader().load('./assets/wood.jpeg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  plane.scale.set(1000, 1000, 1000);
  scene.add(plane);

  // Load and position the metal ball
  metalBall = await load('./metalBall/scene.gltf');
  metalBall.position.set(0, 1, 0);
  metalBall.scale.set(0.01, 0.01, 0.01);
  scene.add(metalBall);

  // Load and position multiple instances of the chair, pen stand, and lamp
  const chair = await load('./office_desk_chair/scene.gltf');
  const penStand = await load('./penStand/scene.gltf');
  const lamp = await load('./office_desk_lamp/scene.gltf');

  for (let i = 0; i < 5; i++) {
    const chairInstance = chair.clone();
    chairInstance.position.set(i * 2 - 4, 0, 0);
    scene.add(chairInstance);

    const penStandInstance = penStand.clone();
    penStandInstance.position.set(i * 2 - 4, 0, -2);
    scene.add(penStandInstance);

    const lampInstance = lamp.clone();
    lampInstance.position.set(i * 2 - 4, 0, 2);
    scene.add(lampInstance);
  }

  document.addEventListener('keydown', onKeyDown);
  animate();
};

const onKeyDown = (event) => {
  switch (event.key) {
    case 'ArrowUp':
      moveBall(new THREE.Vector3(0, 0, -1));
      break;
    case 'ArrowDown':
      moveBall(new THREE.Vector3(0, 0, 1));
      break;
    case 'ArrowLeft':
      moveBall(new THREE.Vector3(-1, 0, 0));
      break;
    case 'ArrowRight':
      moveBall(new THREE.Vector3(1, 0, 0));
      break;
  }
};

const moveBall = (direction) => {
  const moveSpeed = 0.5;
  const horizontalDirection = new THREE.Vector3(direction.x, 0, direction.z).normalize();
  const newPosition = metalBall.position.clone().add(horizontalDirection.multiplyScalar(moveSpeed));

  const ballRadius = 0.5 * 0.01;
  const ballCircumference = 2 * Math.PI * ballRadius;

  const axisOfRotation = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), horizontalDirection).normalize();
  const distanceMoved = horizontalDirection.length() * moveSpeed;
  const rotationAngle = distanceMoved / ballCircumference * (2 * Math.PI);

  metalBall.rotateOnWorldAxis(axisOfRotation, -rotationAngle);

  metalBall.position.copy(newPosition);

  // Adjust camera position to follow the ball
  const cameraOffset = new THREE.Vector3(4, 4, 4); // Adjust camera offset as needed
  camera.position.copy(newPosition.clone().add(cameraOffset));
  camera.lookAt(newPosition);
};

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

init();
