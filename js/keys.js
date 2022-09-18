import * as THREE from 'three';
import * as CANNON from 'cannon';
import { scene } from './init.js';

class Key {
  constructor(pos) {

    this.collected = false;
    this.i = 0;
    this.posY = pos[1];

    this.body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(0.3, 1, 0.3)),
      position: new CANNON.Vec3(pos[0], pos[1] - 0.5, pos[2]),
      collisionResponse: false
    });
    this.mesh = new THREE.Mesh();

    const keyMaterial = new THREE.MeshStandardMaterial({ color: 0xAF8700 });

    const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.15, 8, 8), keyMaterial);
    keyRing.castShadow = true;
    this.mesh.add(keyRing);

    const keyNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.13), keyMaterial);
    keyNeck.castShadow = true;
    keyNeck.position.set(0, -0.94, 0);
    this.mesh.add(keyNeck);

    const keyTooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.14), keyMaterial);
    keyTooth1.castShadow = true;
    keyTooth1.position.set(-0.07, -1.39, 0);
    this.mesh.add(keyTooth1);

    const keyTooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.15, 0.14), keyMaterial);
    keyTooth2.castShadow = true;
    keyTooth2.position.set(-0.02, -1.13, 0);
    this.mesh.add(keyTooth2);

    this.mesh.position.set(pos[0], pos[1], pos[2]);
    this.mesh.rotation.set(0, 0, -0.3);

  }

  setCollisionListener() {
    this.body.addEventListener('collide', event => {
      if (event.body.name === 'player' && !this.collected) {
        this.collected = true;
      }
    });
  }

  reset() {
    this.collected = false;
    this.mesh.scale.set(1, 1, 1);
    scene.add(this.mesh);
  }

  update(delta) {
    // Key is not collected yet
    if (!this.collected) {
      this.i += 0.1;
      this.mesh.position.y = Math.sin(this.i / 2) * 5 * delta + this.posY;
      this.mesh.rotation.y += 0.8 * delta;
    } else {
      // Key is collected and is shrinking
      if (this.mesh.scale.x >= 0.1) {
        this.mesh.rotation.y += 20 * delta;
        this.mesh.scale.multiplyScalar(0.93);
      } else {
        // Key is finished shrinking
        scene.remove(this.mesh);
      }
    }
  }
}

export {
  Key
};