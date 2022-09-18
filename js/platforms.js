import * as THREE from 'three';
import * as CANNON from 'cannon';
import { groundContactMaterial } from './init.js';

const DEG2RAD = Math.PI / 180;

class Platform {
  constructor(args) {
    const {
      type = 2, // Default static
      pos,
      rot = [0, 0, 0],
      color = 0xBBBBBB,
      reset = function() {},
      action = function() {
        return function() {};
      }
    } = args;

    this.body = new CANNON.Body();
    this.body.position.set(pos[0], pos[1], pos[2]);
    this.body.quaternion.setFromEuler(rot[0] * DEG2RAD, rot[1] * DEG2RAD, rot[2] * DEG2RAD);
    this.body.material = groundContactMaterial;
    this.body.type = type;

    this.mesh = new THREE.Mesh();
    this.mesh.material = new THREE.MeshStandardMaterial({ color });
    this.mesh.receiveShadow = true;

    this.reset = reset;
    this.action = action.call(this);
  }

  update(delta) {
    this.action(delta);
    this.sync();
  }

  sync() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}

class BoxPlatform extends Platform {
  constructor(args) {
    super(args);
    const { size } = args;

    this.body.addShape(new CANNON.Box(new CANNON.Vec3(size[0], size[1], size[2])));
    this.mesh.geometry = new THREE.BoxGeometry(size[0] * 2, size[1] * 2, size[2] * 2);
  }
}

class CylinderPlatform extends Platform {
  constructor(args) {
    super(args);
    const { size } = args;

    this.body.addShape(new CANNON.Cylinder(size[0], size[0], size[1], size[2] || 8));
    this.mesh.geometry = new THREE.CylinderGeometry(size[0], size[0], size[1], size[2] || 8);
  }
}

class SpherePlatform extends Platform {
  constructor(args) {
    super(args);
    const { size } = args;

    this.body.addShape(new CANNON.Sphere(size[0] || 1));
    this.mesh.geometry = new THREE.SphereGeometry(size[0] || 1);
  }
}

export {
  BoxPlatform,
  CylinderPlatform,
  SpherePlatform,
};