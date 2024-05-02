import * as THREE from "three";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
let renderer, scene, camera, metalBall;
let penStands = [];
let lamps = [];
let chairs = [];
let officePhones = [];
let gameOver = false;
let timerElement, timeLeft = 60; // Set initial time to 60 seconds
let keysPressed = {};

let backgroundMusic; // Declare this at the top of your script

function setupBackgroundMusic() {
    backgroundMusic = new Audio('../music/04 - Akitaka Tohyama & Kenji Ninuma - The Moon and The Prince copy.mp3');
    backgroundMusic.loop = true; // Make the music loop indefinitely
    backgroundMusic.volume = 0.5; // Set the volume at a comfortable level (adjust as needed)
}

// Call this function in your game's initialization process
setupBackgroundMusic();

const checkGameOver = () => {
  if ((chairs.length === 0 || timeLeft === 0) && !gameOver) {
    const gameOverElement = document.createElement("div");
    gameOverElement.style.position = "absolute";
    gameOverElement.style.top = "50%";
    gameOverElement.style.left = "50%";
    gameOverElement.style.transform = "translate(-50%, -50%)";
    gameOverElement.style.fontSize = "72px";
    gameOverElement.style.color = "red";
    if (timeLeft === 0) {
      gameOverElement.innerHTML = " GAME OVER!! <br>  YOU LOSE:(";
    } else if (timeLeft>=0 && chairs.length===0){
      gameOverElement.innerHTML = "Game Over !! <br> YOU WIN:)";
    }
    document.body.appendChild(gameOverElement);
    gameOver = true;
  }
};

const updateTimer = () => {
  timerElement.innerText = "Timer: " + timeLeft + "s";
};

const initTimerElement = () => {
  timerElement = document.createElement("div");
  timerElement.innerText = "Timer: " + timeLeft + "s";
  timerElement.style.position = "absolute";
  timerElement.style.top = "50px";
  timerElement.style.left = "20px"; // Position on the left
  timerElement.style.color = "black";
  timerElement.style.fontSize = "20px"; // Adjust font size as needed
  timerElement.style.fontFamily = "Arial, sans-serif"; // Adjust font family as needed
  document.body.appendChild(timerElement);
};

let timerStarted = false; // Track if the timer has started

const startTimer = () => {
  if (!timerStarted) {
      timerStarted = true; // Set the timer started flag to true
      const timerInterval = setInterval(() => {
          timeLeft--;
          updateTimer();
          checkGameOver();
          if (timeLeft <= 0 || chairs.length === 0) {
              clearInterval(timerInterval); // Stop the timer if time runs out or all chairs are taken
          }
      }, 1000);
  }
};

// Add score elements to display the count of collected elements
let penStandScoreElement, lampScoreElement, chairScoreElement, officePhoneScoreElement;

const initScoreElements = () => {
  // Create score elements
  penStandScoreElement = createScoreElement("Pen Stands: 0/5");
  lampScoreElement = createScoreElement("Lamps: 0/5");
  chairScoreElement = createScoreElement("Chairs: 0/5");
  officePhoneScoreElement = createScoreElement("Office Phones: 0/5"); // Move this line here

  // Position score elements in the top right corner
  penStandScoreElement.style.top = "50px";
  officePhoneScoreElement.style.top = "80px"; // Adjusted position for office phones
  lampScoreElement.style.top = "110px";
  chairScoreElement.style.top = "140px";
  penStandScoreElement.style.right = officePhoneScoreElement.style.right = lampScoreElement.style.right = chairScoreElement.style.right = "20px";

  // Append score elements to the body
  document.body.appendChild(penStandScoreElement);
  document.body.appendChild(officePhoneScoreElement); // Move this line here
  document.body.appendChild(lampScoreElement);
  document.body.appendChild(chairScoreElement);
};


const createScoreElement = (text) => {
  const scoreElement = document.createElement("div");
  scoreElement.innerText = text;
  scoreElement.style.position = "absolute";
  scoreElement.style.color = "black";
  scoreElement.style.fontSize = "20px"; // Adjust font size as needed
  scoreElement.style.fontFamily = "Arial, sans-serif"; // Adjust font family as needed
  return scoreElement;
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
    updateScoreElement(penStandScoreElement, "Pen Stands: " + (5 - penStands.length) + "/5");
  }

  // Update officePhones score
  if (officePhones.length === 0) {
    updateScoreElement(officePhoneScoreElement, "Office Phones: Completed");
  } else {
    updateScoreElement(officePhoneScoreElement, "Office Phones: " + (5 - officePhones.length) + "/5");
  }

  // Update lamps score
  if (lamps.length === 0) {
    updateScoreElement(lampScoreElement, "Lamps: Completed");
  } else {
    updateScoreElement(lampScoreElement, "Lamps: " + (5 - lamps.length) + "/5");
  }

  // Update chairs score
  if (chairs.length === 0) {
    updateScoreElement(chairScoreElement, "Chairs: Completed");
  } else {
    updateScoreElement(chairScoreElement, "Chairs: " + (5 - chairs.length) + "/5");
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
  const texture = new THREE.TextureLoader().load("./assets/carpet.jpg");
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

  // Load chair, pen stand, lamp, and officePhones
  const chair = await load("./office_desk_chair/scene.gltf");
  const penStand = await load("./penStand/scene.gltf");
  const lamp = await load("./office_desk_lamp/scene.gltf");
  const officePhone = await load("./office_phone/scene.gltf");

  // Scale factors for resizing
  const chairScale = 5;
  const penStandScale = 10;
  const lampScale = 6;
  const officePhoneScale = 0.15;

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
    const officePhonePosition = new THREE.Vector3(
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

    // Clone and scale officePhone instance
    const officePhoneInstance = officePhone.clone();
    officePhoneInstance.scale.set(officePhoneScale, officePhoneScale, officePhoneScale);
    officePhoneInstance.position.copy(officePhonePosition);
    scene.add(officePhoneInstance);
    officePhones.push(officePhoneInstance);
  }

  //document.addEventListener("keydown", onKeyDown);
  //document.addEventListener("keyup", onKeyUp);
  animate();

  initScoreElements();
  initTimerElement();
  //startTimer();
};
document.addEventListener("keydown", (event) => {
  keysPressed[event.key] = true;
  moveBallInDirection();
});

document.addEventListener("keyup", (event) => {
  keysPressed[event.key] = false;
  moveBallInDirection();
});

// Define variables for acceleration, deceleration, and maximum speed
let acceleration = 0.004; // Reduce acceleration rate
let deceleration = 0.004; // Increase deceleration rate
let maxSpeed = 0.2; // Reduce maximum speed

let currentSpeed = 0; // Current speed of the ball

let lastNonZeroDirection = new THREE.Vector3();
// Modify moveBallInDirection function to handle acceleration and deceleration
const moveBallInDirection = () => {
  if (!timerStarted) {
    return; // Don't move the ball if the game hasn't started
  }
  let moveDirection = new THREE.Vector3();

  const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
  const surfaceNormal = new THREE.Vector3(0, 1, 0); // Up vector

  // Check which keys are pressed and update movement direction accordingly
  if (keysPressed['ArrowUp']) {
    moveDirection.add(cameraDirection.clone().projectOnPlane(surfaceNormal).normalize());
  }
  if (keysPressed['ArrowDown']) {
    moveDirection.sub(cameraDirection.clone().projectOnPlane(surfaceNormal).normalize());
  }
  if (keysPressed['ArrowRight']) {
    moveDirection.add(cameraDirection.clone().cross(surfaceNormal).normalize());
  }
  if (keysPressed['ArrowLeft']) {
    moveDirection.sub(cameraDirection.clone().cross(surfaceNormal).normalize());
  }

  // Accelerate or decelerate based on key press state
  if (moveDirection.length() > 0) {
    // Accelerate
    lastNonZeroDirection.copy(moveDirection.normalize());
    currentSpeed += acceleration;
    currentSpeed = Math.min(currentSpeed, maxSpeed); // Limit speed to a maximum value if needed
  } else if(currentSpeed>0){
    // Decelerate
    currentSpeed -= deceleration;
    currentSpeed = Math.max(currentSpeed, 0); // Ensure speed doesn't go negative
    moveDirection.copy(lastNonZeroDirection).multiplyScalar(currentSpeed / maxSpeed);
  }
  //console.log("Current Speed: ", currentSpeed);
  if (currentSpeed > 0) {
    // Move the ball based on current speed and direction
    moveDirection.normalize();
    moveDirection.multiplyScalar(currentSpeed);
    moveBall(moveDirection);
  }
};
const rotateBall = (direction, speed) => {
  const ballRadius = 0.03; // Set this to match the actual radius of your ball model in your scene
  const distanceMoved = direction.length() * speed;
  const rotationAngle = distanceMoved / (ballRadius * 2 * Math.PI);

  const axisOfRotation = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
  metalBall.rotateOnWorldAxis(axisOfRotation, rotationAngle);
};


const moveBall = (moveDirection) => {
  //console.log("movedirection:", moveDirection.length())
  const moveSpeed = currentSpeed;
  const horizontalDirection = new THREE.Vector3(
    moveDirection.x,
    0,
    moveDirection.z
  ).normalize();
  
  const newPosition = metalBall.position.clone().add(horizontalDirection.multiplyScalar(moveSpeed));
  const boundaryLimit = 500 - 5; // Limit to keep the ball within boundaries
  //console.log("Horizontal Direction:", horizontalDirection.length())
  // Ensure the ball stays within boundaries
  newPosition.setY(1); // Keep the Y-coordinate consistent
  newPosition.setX(Math.min(Math.max(newPosition.x, -boundaryLimit), boundaryLimit));
  newPosition.setZ(Math.min(Math.max(newPosition.z, -boundaryLimit), boundaryLimit));

  metalBall.position.copy(newPosition);

  // Continue to rotate the ball
  rotateBall(horizontalDirection, moveSpeed);
 // console.log("Rotation Axis: ", axisOfRotation, "Rotation Angle: ", rotationAngle);
  let collisionDetected = false; // Track if any collision is detected

  // Check for collisions with penStands
  for (let i = penStands.length - 1; i >= 0; i--) {
    const penStandInstance = penStands[i];
    const distance = metalBall.position.distanceTo(penStandInstance.position);

    if (distance < 2) {
      // Increase ball size
      metalBall.scale.multiplyScalar(1.09);
      // Remove penStand from scene
      scene.remove(penStandInstance);
      penStands.splice(i, 1);
      // Update scores
      updateScores();
      collisionDetected = true;
      break; // Exit loop after detecting collision with one penstand
    }
  }

  // Check for collisions with lamps
  if (!collisionDetected && penStands.length === 0 && officePhones.length===0) {
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
  if (!collisionDetected && penStands.length === 0 && officePhones.length===0 && lamps.length === 0) {
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

  // Check for collisions with officePhones
  if (!collisionDetected && penStands.length === 0 ) {
    officePhones.forEach((officePhone, index) => {
      if (metalBall.position.distanceTo(officePhone.position) < 5) {
        // Increase ball size
        metalBall.scale.multiplyScalar(1.09);
        // Remove officePhone from scene
        scene.remove(officePhone);
        officePhones.splice(index, 1);
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
    moveBallInDirection();
    renderer.render(scene, camera);
  }
};
init();

// Function to hide the start button and show the restart button
const showRestartButton = () => {
  document.getElementById("startButtonContainer").style.display = "none";
  
};

// Function to start the game
const startGame = () => {
  startTimer();
  document.getElementById("startButtonContainer").remove();
  backgroundMusic.play().catch(e => console.error("Error playing music:", e)); // Start the music and handle any errors
};

// Event listener for start button click
document.getElementById("startButton").addEventListener("click", startGame);
backgroundMusic.play().catch(e => {
    console.error("Error playing music:", e);
    // Handle the error (e.g., show a notification, attempt to reload the audio, etc.)
});

