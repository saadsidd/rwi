import * as THREE from 'three';
import * as CANNON from 'cannon';

/*
  Setup THREE clock, scene, renderer, camera, lights
*/
const clock = new THREE.Clock();

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x87CEEB);
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
scene.add(extraDirectionalLight);

/*
  Setup CANNON world, ground plane
*/
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -15, 0)
});

const playerContactMaterial = new CANNON.Material('player');
const groundContactMaterial = new CANNON.Material('ground');
const slipperyContactMaterial = new CANNON.Material('slippery');
const superSlipperyContactMaterial = new CANNON.Material('superSlippery');
const frictionlessContactMaterial = new CANNON.Material('frictionless');

const defaultFriction = 0.4;
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
  shape: new CANNON.Plane()
});
ground.name = 'ground';
ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(ground);


export {
  clock,
  scene,
  renderer,
  camera,
  directionalLight,

  world,
  playerContactMaterial,
  groundContactMaterial,
  slipperyContactMaterial,
  superSlipperyContactMaterial,
  frictionlessContactMaterial,
};


// Helpers
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(directionalLightHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const shadowCamera = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(shadowCamera);


// const loader = new THREE.TextureLoader();
// const texture = loader.load('/assets/roundshadow.png');
// texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
// const plane = new THREE.Mesh(
//   new THREE.PlaneGeometry(1, 1, 1),
//   new THREE.MeshStandardMaterial({ color: 0x808080, map: texture, transparent: true })
// );
// plane.position.set(5, 140, 0);
// scene.add(plane);

// const plane = new THREE.Mesh(
//   new THREE.PlaneGeometry(5, 5),
//   new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, roughness: 0, transmission: 0.5, thickness: 1 })
// );
// plane.position.set(0, 143, -5);
// scene.add(plane);