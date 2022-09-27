import * as THREE from 'three';
import * as CANNON from 'cannon';

/*
  DOM elements to show/hide in overlay
*/
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');

const currentTimeDisplay = document.getElementById('current-time');
const bestTimeDisplay = document.getElementById('best-time');

const instructions = document.getElementById('instructions');

const resultContainer = document.getElementById('result-container');
const newRecord = document.getElementById('new-record');
const completionTime = document.getElementById('completion-time').children[0];
const completionTimeDifference = document.getElementById('completion-time').children[1];

const buttonsContainer = document.getElementById('buttons-container');
const mainButton = document.getElementById('main-button');
const sideButton = document.getElementById('side-button');

const newRecordMessage = ['You did it!', 'Nice one!', 'Well done!', 'Awesome!'];

// Show/hide overlay and child elements (titles, instructions, buttons, etc)
// setTimeout(s) to delay showing buttons to overcome error reentering Pointer Lock too quickly (~1s)
const setOverlay = (state, currentTime, bestTime) => {
  switch (state) {
  case 'playing':
    overlay.style.display = 'none';
    bestTimeDisplay.innerText = `Best: ${bestTime || '--'}`;
    break;
  case 'paused':
    overlay.style.display = 'flex';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlayTitle.innerText = 'Paused';
    instructions.style.display = 'block';
    resultContainer.style.display = 'none';
    buttonsContainer.style.visibility = 'hidden';
    mainButton.style.display = 'block';
    sideButton.style.display = 'block';
    setTimeout(() => {
      buttonsContainer.style.visibility = 'visible';
    }, 1100);
    break;
  case 'finished':
    overlay.style.display = 'flex';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    instructions.style.display = 'none';
    
    resultContainer.style.display = 'flex';
    completionTime.innerText = `Time: ${currentTime} `;

    // If current time lower than best time, show NewRecord! animation + make time difference green
    if (bestTime === null || parseFloat(currentTime) < parseFloat(bestTime)) {
      overlayTitle.innerText = newRecordMessage[Math.floor(Math.random() * newRecordMessage.length)];
      newRecord.style.display = 'block';
      completionTimeDifference.innerText = `(-${Math.abs(bestTime - currentTime).toFixed(1)})`;
      completionTimeDifference.style.color = '#00FF00';
    } else {
      overlayTitle.innerText = 'Finished!';
      newRecord.style.display = 'none';
      completionTimeDifference.innerText = `(+${Math.abs(currentTime - bestTime).toFixed(1)})`;
      completionTimeDifference.style.color = '#FF4747';
    }

    buttonsContainer.style.visibility = 'hidden';
    mainButton.style.display = 'none';
    sideButton.style.display = 'block';
    setTimeout(() => {
      buttonsContainer.style.visibility = 'visible';
    }, 1100);
    break;
  }
};

/*
  Setup THREE clock, scene, renderer, camera, lights
*/
const clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader()
  .setPath('../rwi/assets/skybox/clearbluesky/')
  // .setPath('../assets/skybox/clearbluesky/')
  .load([
    'px.png',
    'nx.png',
    'py.png',
    'ny.png',
    'pz.png',
    'nz.png'
  ]);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 2, 10);
scene.add(camera);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.55);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

const extraDirectionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.3);
extraDirectionalLight.position.set(0, 10, 10);
scene.add(extraDirectionalLight);

/*
  Setup CANNON world, ground plane
*/
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -25, 0)
});

const playerContactMaterial = new CANNON.Material('player');
const groundContactMaterial = new CANNON.Material('ground');
const gripContactMaterial = new CANNON.Material('grip');

world.addContactMaterial(new CANNON.ContactMaterial(playerContactMaterial, groundContactMaterial, {
  friction: 0.02,
  restitution: 0.2
}));
world.addContactMaterial(new CANNON.ContactMaterial(playerContactMaterial, gripContactMaterial, {
  friction: 0.9,
  restitution: 0.2
}));

const ground = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane()
});
ground.name = 'ground';
ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(ground);

export {
  // DOM
  mainButton,
  sideButton,
  currentTimeDisplay,
  setOverlay,

  // THREE
  clock,
  scene,
  renderer,
  camera,
  directionalLight,

  // CANNON
  world,
  playerContactMaterial,
  groundContactMaterial,
  gripContactMaterial,
};