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

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight);
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

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.position.y += 10;
scene.add(directionalLight);

/*
  Setup CANNON world, ground plane
*/
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -15, 0)
});

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
};


// Helpers
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(directionalLightHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const shadowCamera = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(shadowCamera);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({color: 0x880000})
);
plane.receiveShadow = true;
plane.rotation.x -= Math.PI / 2;
// scene.add(plane);