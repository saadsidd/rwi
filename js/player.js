import * as THREE from 'three';
import * as CANNON from 'cannon';
import { scene, camera, directionalLight, world, playerContactMaterial } from './init.js';
import { START_POSITION, FALL_LIMIT } from './level.js';

const SPIN_SPEED = 30;
const MOVEMENT_SPEED = 5;
// const MOVEMENT_SPEED = 20;
const PITCH_LIMIT = Math.PI / 3;

// Keyboard controls
const keyboard = {};
document.addEventListener('keydown', event => keyboard[event.code] = true);
document.addEventListener('keyup', event => keyboard[event.code] = false);

// Prevent keys from 'sticking' while leaving pointerlock
document.addEventListener('pointerlockchange', () => {
  for (const key in keyboard) {
    keyboard[key] = false;
  }
});

// Mouse controls
const quat = new CANNON.Quaternion();
const inputVelocity = new THREE.Vector3(0, 0, 0);

// Camera -> pitchObject -> yawObject
const pitchObject = new THREE.Object3D();
pitchObject.add(camera);
const yawObject = new THREE.Object3D();
yawObject.add(pitchObject);
scene.add(yawObject);

document.addEventListener('click', () => document.body.requestPointerLock());
document.addEventListener('mousemove', event => {
  if (document.pointerLockElement && player.body.position.y > FALL_LIMIT) {
    yawObject.rotation.y -= event.movementX * 0.002;
    pitchObject.rotation.x -= event.movementY * 0.002;

    // Ensure camera doesn't go past threshold when player looks up/down
    pitchObject.rotation.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitchObject.rotation.x));
  }
});

// Create the 4 color quadrants of the player ball
const COLORS = [0xFFBE0B, 0x3A86FF, 0x37FC1E, 0xFF4F88];
const mesh = new THREE.Mesh();
for (let i = 0; i < 4; i++) {
  let quarterMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 16, Math.PI / 2 * i, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: COLORS[i] })
  );
  quarterMesh.castShadow = true;
  mesh.add(quarterMesh);
}

// Make the directional light keep pointing at player
directionalLight.target = mesh;

const player = {
  body: new CANNON.Body({
    mass: 2,
    shape: new CANNON.Sphere(1),
    material: playerContactMaterial,
    position: new CANNON.Vec3(...START_POSITION),
    angularDamping: 0.9
  }),
  mesh: mesh,
  fallingCheck: function() {
    if (this.body.position.y <= FALL_LIMIT) {
      camera.lookAt(this.mesh.position);
    } else {
      yawObject.position.copy(this.body.position);
    }
  },
  sync: function() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
    directionalLight.position.set(this.mesh.position.x, this.mesh.position.y + 10, this.mesh.position.z);
  },
  reset: function() {
    this.body.position.set(...START_POSITION);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
  
    pitchObject.rotation.set(0, 0, 0);
    yawObject.rotation.set(0, 0, 0);
    camera.rotation.set(0, 0, 0);
  },
  update: function(delta) {

    if (keyboard['KeyW']) {
      inputVelocity.x = -1;
    }
    if (keyboard['KeyS']) {
      inputVelocity.x = 1;
    }
    if (keyboard['KeyA']) {
      inputVelocity.z = 1;
    }
    if (keyboard['KeyD']) {
      inputVelocity.z = -1;
    }
    if (keyboard['Space']) {
      this.body.velocity.y += 0.75;
    }

    quat.setFromEuler(pitchObject.rotation.x, yawObject.rotation.y, 0);
    inputVelocity.applyQuaternion(quat);

    this.body.angularVelocity.x += inputVelocity.x * SPIN_SPEED * delta;
    this.body.angularVelocity.z += inputVelocity.z * SPIN_SPEED * delta;

    this.body.velocity.x -= inputVelocity.z * MOVEMENT_SPEED * delta;
    this.body.velocity.z += inputVelocity.x * MOVEMENT_SPEED * delta;

    inputVelocity.set(0, 0, 0);

    this.fallingCheck();
    this.sync();
  }
};

player.body.name = 'player';
world.addBody(player.body);
scene.add(player.mesh);

const testAngle = new CANNON.Vec3(0, 0, 0);

export {
  pitchObject,
  yawObject,
  player,

  keyboard,
  testAngle
};