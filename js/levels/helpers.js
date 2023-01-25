import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as TWEEN from 'tween';
import {
  levelResets,
  groundContactMaterial,
  superSlipperyContactMaterial,
  COLLISIONGROUP_PLATFORM,
  COLLISIONGROUP_PLAYER
} from '../init.js';
import { finishLevel } from '../main.js';

// Helpers for creating various bodies from gltf meshes and collision/tween events

const vec3 = new THREE.Vector3();

const generateCubeBody = (size, pos, rot) => {
  return new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z)),
    position: pos,
    quaternion: new CANNON.Quaternion().setFromEuler(rot.x, rot.y, rot.z),
    material: groundContactMaterial,
    collisionFilterGroup: COLLISIONGROUP_PLATFORM,
    collisionFilterMask: COLLISIONGROUP_PLAYER
  });
};

const generateCylinderBody = (size, pos) => {
  return new CANNON.Body({
    shape: new CANNON.Cylinder(size.x, size.x, size.y * 2, 12),
    position: pos,
    material: groundContactMaterial,
    collisionFilterGroup: COLLISIONGROUP_PLATFORM,
    collisionFilterMask: COLLISIONGROUP_PLAYER
  });
};

const addDisappearOnCollision = ({mesh, body}) => {

  mesh.material.transparent = true;
  const redToInvisible = new TWEEN.Tween(mesh.material)
  .to({opacity: 0}, 1000)
  .onStart(() => mesh.material.color.setHex(0xFF0000))
  .onComplete(() => body.collisionResponse = false);

  body.addEventListener('collide', () => {

    if (body.collisionResponse) {
      redToInvisible.start();
    }

  });

  levelResets.push(() => {

    body.collisionResponse = true;
    mesh.material.opacity = 1;
    mesh.material.color.setHex(0xCCCCCC);

  });

};

const addSlipOnCollision = ({mesh, body}) => {

  const whiteToBlue = new TWEEN.Tween(mesh.material.color)
  .to({r: 0.24, g: 0.75, b: 1}, 1000)
  .onComplete(() => body.material = superSlipperyContactMaterial);

  body.addEventListener('collide', () => {

    if (mesh.material.color.getHexString() === 'cccccc') {
      console.log('turn blue');
      whiteToBlue.start();
    }

  });

  levelResets.push(() => {

    mesh.material.color.setHex(0xCCCCCC);
    body.material = groundContactMaterial;

  });

};

const addFinishLevelOnCollision = ({mesh, body}, level) => {

  body.addEventListener('collide', () => {

    finishLevel(level);

  });

};

export {
  vec3,
  generateCubeBody,
  generateCylinderBody,
  addDisappearOnCollision,
  addSlipOnCollision,
  addFinishLevelOnCollision,
};