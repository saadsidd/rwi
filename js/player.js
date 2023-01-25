import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { scene, camera, directionalLight, world, COLLISIONGROUP_PLAYER, playerContactMaterial } from './init.js';

const FALL_LIMIT = -30;

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
const PITCH_LIMIT = Math.PI / 3;
const pitchObject = new THREE.Object3D();
pitchObject.name = 'Pitch Object';
pitchObject.add(camera);
const yawObject = new THREE.Object3D();
yawObject.name = 'Yaw Object';
yawObject.add(pitchObject);
scene.add(yawObject);

// Mouse to camera movement
document.addEventListener('mousemove', event => {
  if (document.pointerLockElement && player.body.position.y > FALL_LIMIT) {
    yawObject.rotation.y -= event.movementX * 0.002;
    pitchObject.rotation.x -= event.movementY * 0.002;

    // Ensure camera doesn't go past threshold when player looks up/down
    pitchObject.rotation.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitchObject.rotation.x));
  }
});

// Create the 4 color quadrants of the player ball (yellow, blue, green, red)
const COLORS = [0xFFBE0B, 0x3A86FF, 0x37FC1E, 0xFF4F88];
const mesh = new THREE.Mesh();
mesh.name = 'Player';
for (let i = 0; i < 4; i++) {
  let quarterMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 16, Math.PI / 2 * i, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: COLORS[i] })
  );
  quarterMesh.name = 'Color Quadrant';
  quarterMesh.castShadow = true;
  mesh.add(quarterMesh);
}

// Make the directional light keep pointing at player
directionalLight.target = mesh;

const player = {
  spinSpeed: 50,
  movementSpeed: 0,
  body: new CANNON.Body({
    mass: 2,
    shape: new CANNON.Sphere(1),
    material: playerContactMaterial,
    position: new CANNON.Vec3(0, 4, 0),
    angularDamping: 0.9,
    collisionFilterGroup: COLLISIONGROUP_PLAYER
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
    directionalLight.position.set(this.mesh.position.x, this.mesh.position.y + 2, this.mesh.position.z);
  },
  reset: function() {
    this.body.position.set(0, 4, 0);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
  
    pitchObject.rotation.set(0, 0, 0);
    yawObject.rotation.set(0, 0, 0);
    yawObject.position.copy(this.body.position);
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
    // if (keyboard['Space']) {
    //   this.body.velocity.y += 50 * delta;
    // }
    // if (keyboard['ShiftLeft']) {
    //   this.movementSpeed = 20;
    // } else {
    //   this.movementSpeed = 0;
    // }

    quat.setFromEuler(pitchObject.rotation.x, yawObject.rotation.y, 0);
    inputVelocity.applyQuaternion(quat);

    this.body.angularVelocity.x += inputVelocity.x * this.spinSpeed * delta;
    this.body.angularVelocity.z += inputVelocity.z * this.spinSpeed * delta;

    this.body.velocity.x -= inputVelocity.z * this.movementSpeed * delta;
    this.body.velocity.z += inputVelocity.x * this.movementSpeed * delta;

    inputVelocity.set(0, 0, 0);

    this.fallingCheck();
    this.sync();
  }
};

player.body.name = 'player';
world.addBody(player.body);
scene.add(player.mesh);

export default player;