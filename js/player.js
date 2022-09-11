import * as THREE from 'three';
import * as CANNON from 'cannon';
import { scene, world, camera, directionalLight } from './init.js';

// Mouse controls
const quat = new CANNON.Quaternion();
const inputVelocity = new THREE.Vector3(0, 0, 0);

const pitchObject = new THREE.Object3D();
pitchObject.add(camera);
const yawObject = new THREE.Object3D();
yawObject.add(pitchObject);
scene.add(yawObject);

document.addEventListener('click', () => document.body.requestPointerLock());
document.addEventListener('mousemove', event => {
  if (document.pointerLockElement) {
    yawObject.rotation.y -= event.movementX * 0.002;
    pitchObject.rotation.x -= event.movementY * 0.002;

    pitchObject.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchObject.rotation.x));
  }
});

// Keyboard controls
const keyboard = {};
document.addEventListener('keydown', event => keyboard[event.code] = true);
document.addEventListener('keyup', event => keyboard[event.code] = false);


const SPIN_SPEED = 30;
const MOVEMENT_SPEED = 5;
const START_POSITION = [0, 22, 0];

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
    position: new CANNON.Vec3(...START_POSITION),
    angularDamping: 0.9
  }),
  mesh: mesh,
  sync: function() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
    yawObject.position.copy(this.body.position);
    directionalLight.position.set(this.mesh.position.x, this.mesh.position.y + 10, this.mesh.position.z);
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

    this.sync();
  }
};

world.addBody(player.body);
scene.add(player.mesh);

export {
  player,
};