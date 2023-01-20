import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/*
  DOM elements
*/

const currentTimeDisplay = document.getElementById('current-time');

const overlay = document.getElementById('overlay');
const titleContainer = document.getElementById('title-container');
const instructions = document.getElementById('instructions');
const levelsContainer = document.getElementById('levels-container');
const levelTiles = document.getElementById('level-tiles');
const buttonsContainer = document.getElementById('buttons-container');

const [homeButton, restartButton, playButton] = document.getElementsByClassName('nav-button');

const newRecord = document.getElementById('new-record');
const completionTime = document.getElementById('completion-time');
const resultContainer = document.getElementById('result-container');

const homeBackground = overlay.style.background;
const pausedBackground = 'rgba(0, 0, 0, 0.5)';

const homeTitle = titleContainer.innerHTML;
const pausedTitle = '<div class="title-text">PAUSED</div>';
const finishedTitle = '<div class="title-text">Finished!</div>';

const setOverlay = (mode) => {

  if (mode === 'home') {

    overlay.style.display = 'flex';
    overlay.style.background = homeBackground;
    titleContainer.innerHTML = homeTitle;

    instructions.style.display = 'block';
    resultContainer.style.display = 'none';
    levelsContainer.style.display = 'flex';
    buttonsContainer.style.display = 'none';

  } else if (mode === 'playing') {

    overlay.style.display = 'none';
    buttonsContainer.style.display = 'none';
    homeButton.style.display = 'none';
    restartButton.style.display = 'none';
    playButton.style.display = 'none';

  } else if (mode === 'paused') {

    overlay.style.display = 'flex';
    overlay.style.background = pausedBackground;
    titleContainer.innerHTML = pausedTitle;

    instructions.style.display = 'none';
    resultContainer.style.display = 'none';
    levelsContainer.style.display = 'none';
    buttonsContainer.style.display = 'flex';
    // Ensure pointer lock has enough time to reset to prevent error
    setTimeout(() => {
      for (const button of buttonsContainer.children) {
        homeButton.style.display = 'block';
        restartButton.style.display = 'block';
        playButton.style.display = 'block';
      }
    }, 1200);

  } else if (mode === 'finished' || mode === 'finished_better_time') {

    overlay.style.display = 'flex';
    overlay.style.background = pausedBackground;
    titleContainer.innerHTML = finishedTitle;

    instructions.style.display = 'none';
    levelsContainer.style.display = 'none';
    resultContainer.style.display = 'flex';
    newRecord.style.display = 'none';
    buttonsContainer.style.display = 'flex';
    setTimeout(() => {
      homeButton.style.display = 'block';
      restartButton.style.display = 'block';
    }, 1200);
  }

  if (mode === 'finished_better_time') {
    newRecord.style.display = 'block';
  }

};

const updateLevelTimes = () => {

  for (let i = 0; i < 5; i++) {
    const time = parseFloat(localStorage.getItem(`level_${i + 1}`));
    const showTime = levelTiles.children[i].children[1];
    if (!isNaN(time)) {
      showTime.textContent = time.toFixed(1);
    }
  }

};

updateLevelTimes();

// DOM Exports
export {
  currentTimeDisplay,
  levelTiles,
  homeButton,
  restartButton,
  playButton,
  completionTime,
  setOverlay,
  updateLevelTimes
};


/*
  Setup THREE clock, scene, renderer, camera, lights, loaders
*/
const clock = new THREE.Clock();
const meshBodySync = [];

const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader()
  .setPath('/assets/skybox/clearbluesky/').load([
    'px.png',
    'nx.png',
    'py.png',
    'ny.png',
    'pz.png',
    'nz.png',
  ]);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 20;
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager);

// THREE Exports
export {
  clock,
  meshBodySync,
  scene,
  renderer,
  camera,
  directionalLight,
  loadingManager,
  gltfLoader,
};


/*
  Setup CANNON world, contact materials, ground plane
*/
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -15, 0)
});

// Using collision masking so platforms fall through ground, but player can still collide
const COLLISIONGROUP_PLAYER = 1;
const COLLISIONGROUP_GROUND = 2;
const COLLISIONGROUP_PLATFORM = 4;

const playerContactMaterial = new CANNON.Material('player');
const groundContactMaterial = new CANNON.Material('ground');
const slipperyContactMaterial = new CANNON.Material('slippery');
const superSlipperyContactMaterial = new CANNON.Material('superSlippery');
const frictionlessContactMaterial = new CANNON.Material('frictionless');

const defaultFriction = 0.02;
const defaultRestitution = 0.3;

world.addContactMaterial(new CANNON.ContactMaterial(playerContactMaterial, groundContactMaterial, {
  friction: defaultFriction,
  restitution: defaultRestitution
}));
world.addContactMaterial(new CANNON.ContactMaterial(playerContactMaterial, slipperyContactMaterial, {
  friction: 0.02,
  restitution: defaultRestitution
}));
world.addContactMaterial(new CANNON.ContactMaterial(playerContactMaterial, superSlipperyContactMaterial, {
  friction: 0.002,
  restitution: defaultRestitution
}));
world.addContactMaterial(new CANNON.ContactMaterial(playerContactMaterial, frictionlessContactMaterial, {
  friction: 0,
  restitution: defaultRestitution
}));

const ground = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
  collisionFilterGroup: COLLISIONGROUP_GROUND,
  collisionFilterMask: COLLISIONGROUP_PLAYER
});
ground.name = 'ground';
ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
ground.position.set(0, -100, 0);
world.addBody(ground);

// CANNON Exports
export {
  world,
  COLLISIONGROUP_PLAYER,
  COLLISIONGROUP_GROUND,
  COLLISIONGROUP_PLATFORM,
  playerContactMaterial,
  groundContactMaterial,
  slipperyContactMaterial,
  superSlipperyContactMaterial,
  frictionlessContactMaterial,
};




// Helpers
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);