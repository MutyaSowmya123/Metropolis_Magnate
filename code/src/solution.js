import * as THREE from "three";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";

let renderer, scene, camera, metalBall;
let penStands = [];
let lamps = [];
let chairs = [];

// Define a variable to track if the game is over
let gameOver = false;

const checkGameOver = () => {
  if (chairs.length === 0 && !gameOver) {
    const gameOverElement = document.createElement("div");
    gameOverElement.innerText = "Game Over !!";
    gameOverElement.style.position = "absolute";
    gameOverElement.style.top = "50%";
    gameOverElement.style.left = "50%";
    gameOverElement.style.transform = "translate(-50%, -50%)";
    gameOverElement.style.fontSize = "48px";
    gameOverElement.style.color = "white";
    document.body.appendChild(gameOverElement);
    gameOver = true;
  }
};
// Add score elements to display the count of collected elements
let penStandScoreElement, lampScoreElement, chairScoreElement;

const initScoreElements = () => {
  penStandScoreElement = document.createElement("div");
  lampScoreElement = document.createElement("div");
  chairScoreElement = document.createElement("div");

  // Position score elements in the top right corner
  penStandScoreElement.style.position =
    lampScoreElement.style.position =
    chairScoreElement.style.position =
      "absolute";
  penStandScoreElement.style.top = "30px";
  lampScoreElement.style.top = "50px";
  chairScoreElement.style.top = "70px";
  penStandScoreElement.style.right =
    lampScoreElement.style.right =
    chairScoreElement.style.right =
      "20px";

  // Initial scores are 0 for all elements
  penStandScoreElement.innerText = "Pen Stands: 0";
  lampScoreElement.innerText = "Lamps: 0";
  chairScoreElement.innerText = "Chairs: 0";

  // Append score elements to the body
  document.body.appendChild(penStandScoreElement);
  document.body.appendChild(lampScoreElement);
  document.body.appendChild(chairScoreElement);
};

const updateScores = () => {
  const updateScoreElement = (element, value) => {
    element.style.opacity = "0"; // Set opacity to 0 to initiate transition

    element.innerText = value;
    element.style.opacity = "1"; // Set opacity back to 1 after changing the value
  };

  // Update pen stands score
  if (penStands.length === 0) {
    updateScoreElement(penStandScoreElement, "Pen Stands: Completed");
  } else {
    updateScoreElement(
      penStandScoreElement,
      "Pen Stands: " + (5 - penStands.length)
    );
  }

  // Update lamps score
  if (lamps.length === 0) {
    updateScoreElement(lampScoreElement, "Lamps: Completed");
  } else {
    updateScoreElement(lampScoreElement, "Lamps: " + (5 - lamps.length));
  }

  // Update chairs score
  if (chairs.length === 0) {
    updateScoreElement(chairScoreElement, "Chairs: Completed");
  } else {
    updateScoreElement(chairScoreElement, "Chairs: " + (5 - chairs.length));
  }
};

const load = (url) =>
  new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });

const init = async () => {
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
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
  const texture = new THREE.TextureLoader().load("./assets/wood.jpeg");
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
  metalBall = await load("./metalBall/scene.gltf");
  metalBall.position.set(0, 1, 0); // Adjusted to be on the surface
  metalBall.scale.set(0.007, 0.007, 0.007);
  scene.add(metalBall);

  // Load chair, pen stand, and lamp
  const chair = await load("./office_desk_chair/scene.gltf");
  const penStand = await load("./penStand/scene.gltf");
  const lamp = await load("./office_desk_lamp/scene.gltf");

  // Scale factors for resizing
  const chairScale = 5;
  const penStandScale = 10;
  const lampScale = 5;

  const maxDistance = 60; // Maximum distance for random positioning
  const numInstances = 5; // Number of instances for each element

  for (let i = 0; i < numInstances; i++) {
    // Generate random positions for each instance
    const chairPosition = new THREE.Vector3(
      Math.random() * maxDistance - maxDistance / 2,
      0,
      Math.random() * maxDistance - maxDistance / 2
    );
    const penStandPosition = new THREE.Vector3(
      Math.random() * maxDistance - maxDistance / 2,
      0,
      Math.random() * maxDistance - maxDistance / 2
    );
    const lampPosition = new THREE.Vector3(
      Math.random() * maxDistance - maxDistance / 2,
      0,
      Math.random() * maxDistance - maxDistance / 2
    );

    // Clone and scale chair instance
    const chairInstance = chair.clone();
    chairInstance.scale.set(chairScale, chairScale, chairScale);
    chairInstance.position.copy(chairPosition);
    scene.add(chairInstance);
    chairs.push(chairInstance);

    // Clone and scale pen stand instance
    const penStandInstance = penStand.clone();
    penStandInstance.scale.set(penStandScale, penStandScale, penStandScale);
    penStandInstance.position.copy(penStandPosition);
    scene.add(penStandInstance);
    penStands.push(penStandInstance);

    // Clone and scale lamp instance
    const lampInstance = lamp.clone();
    lampInstance.scale.set(lampScale, lampScale, lampScale);
    lampInstance.position.copy(lampPosition);
    scene.add(lampInstance);
    lamps.push(lampInstance);
  }

  document.addEventListener("keydown", onKeyDown);
  animate();

  initScoreElements();
};

const onKeyDown = (event) => {
  const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
  const surfaceNormal = new THREE.Vector3(0, 1, 0); // Surface normal is always pointing up

  let moveDirection;

  switch (event.key) {
    case "ArrowUp":
      moveDirection = cameraDirection
        .clone()
        .projectOnPlane(surfaceNormal)
        .normalize();
      break;
    case "ArrowDown":
      moveDirection = cameraDirection
        .clone()
        .projectOnPlane(surfaceNormal)
        .normalize()
        .negate();
      break;
    case "ArrowLeft":
      // Calculate right direction based on the cross product of surface normal and camera direction
      moveDirection = surfaceNormal.clone().cross(cameraDirection).normalize();
      break;
    case "ArrowRight":
      // Calculate left direction based on the cross product of camera direction and surface normal
      moveDirection = cameraDirection.clone().cross(surfaceNormal).normalize();
      break;
    default:
      return;
  }

  moveBall(moveDirection);
};

const moveBall = (direction) => {
  const moveSpeed = 0.5;
  const horizontalDirection = new THREE.Vector3(
    direction.x,
    0,
    direction.z
  ).normalize();
  const newPosition = metalBall.position
    .clone()
    .add(horizontalDirection.multiplyScalar(moveSpeed));

  // Ensure the ball stays on the surface plane
  newPosition.setY(1); // Adjust the Y coordinate as needed

  const ballRadius = 0.5 * 0.01;
  const ballCircumference = 2 * Math.PI * ballRadius;

  const axisOfRotation = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), horizontalDirection)
    .normalize();
  const distanceMoved = horizontalDirection.length() * moveSpeed;
  const rotationAngle = (distanceMoved / ballCircumference) * (2 * Math.PI);

  metalBall.rotateOnWorldAxis(axisOfRotation, -rotationAngle);

  let collisionDetected = false; // Track if any collision is detected

  for (let i = penStands.length - 1; i >= 0; i--) {
    const penStandInstance = penStands[i];
    const distance = metalBall.position.distanceTo(penStandInstance.position);

    if (distance < 2) {
      // Increase ball size
      metalBall.scale.multiplyScalar(1.09);
      // Remove pen stand from scene
      scene.remove(penStandInstance);
      penStands.splice(i, 1);
      // Update scores
      updateScores();
      collisionDetected = true;
      break; // Exit loop after detecting collision with one penstand
    }
  }

  // Check for collisions with lamps
  if (!collisionDetected && penStands.length === 0) {
    lamps.forEach((lamp, index) => {
      if (metalBall.position.distanceTo(lamp.position) < 2) {
        // Increase ball size
        metalBall.scale.multiplyScalar(1.06);
        // Remove lamp from scene
        scene.remove(lamp);
        lamps.splice(index, 1);
        // Update scores
        updateScores();
        collisionDetected = true;
      }
    });
  }

  // Check for collisions with chairs
  if (!collisionDetected && penStands.length === 0 && lamps.length === 0) {
    chairs.forEach((chair, index) => {
      if (metalBall.position.distanceTo(chair.position) < 5) {
        // Increase ball size
        metalBall.scale.multiplyScalar(1.09);
        // Remove chair from scene
        scene.remove(chair);
        chairs.splice(index, 1);
        // Update scores
        updateScores();
        collisionDetected = true;
      }
    });
  }

  metalBall.position.copy(newPosition);

  // Adjust camera position to follow the ball
  const cameraOffset = new THREE.Vector3(4, 4, 4); // Adjust camera offset as needed
  camera.position.copy(newPosition.clone().add(cameraOffset));
  camera.lookAt(newPosition);

  // Check if the game is over after all collision checks
  if (!collisionDetected) {
    checkGameOver();
  }
};

// Modify the animate function to check for game over on each frame
const animate = () => {
  requestAnimationFrame(animate);

  // Only render the scene if the game is not over
  if (!gameOver) {
    renderer.render(scene, camera);
  }
};
init();
