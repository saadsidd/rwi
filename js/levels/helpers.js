import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
  groundContactMaterial,
  COLLISIONGROUP_PLATFORM,
  COLLISIONGROUP_PLAYER
} from '../init.js';

// Helpers for creating various bodies from gltf meshes

const meshBodySync = [];
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

export {
  vec3,
  generateCubeBody,
  generateCylinderBody,
};