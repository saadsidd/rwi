import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/*
  Setup THREE clock, scene, renderer, camera, lights, loaders
*/
const clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader()
  .setPath('/assets/skybox/clearbluesky/')
  // clearbluesky
  // bluesunset
  // gloriouspink
  // nightsky
  // space
  .load([
    // 'px.jpg',
    // 'nx.jpg',
    // 'py.jpg',
    // 'ny.jpg',
    // 'pz.jpg',
    // 'nz.jpg',

    'px.png',
    'nx.png',
    'py.png',
    'ny.png',
    'pz.png',
    'nz.png',

    // 'ft.jpg',
    // 'bk.jpg',
    // 'up.jpg',
    // 'dn.jpg',
    // 'rt.jpg',
    // 'lf.jpg',
  ]);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// document.body.appendChild(renderer.domElement);

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

const extraDirectionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.3);
extraDirectionalLight.position.set(0, 10, 10);
// scene.add(extraDirectionalLight);

const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);

// THREE Exports
export {
  clock,
  scene,
  renderer,
  camera,
  directionalLight,
  loadingManager,
  gltfLoader,
  rgbeLoader,
};

/*
  Setup CANNON world, contact materials, ground plane
*/
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -15, 0)
});

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