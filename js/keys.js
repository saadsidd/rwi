import * as THREE from 'three';
import * as CANNON from 'cannon';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();
const gltfPath = '/assets/key2-center-change.glb';

const textureLoader = new THREE.TextureLoader();
const mapPath = './assets/key-shadow-circle.png';

const keyShape = new CANNON.Box(new CANNON.Vec3(0.3, 1, 0.3));
const keyMaterial = new THREE.MeshStandardMaterial({ color: 0xAF8700 });

const shadowGeometry = new THREE.PlaneGeometry(2, 2);
const shadowMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, map: textureLoader.load(mapPath), transparent: true });

class Key {
  constructor(pos) {

    this.collected = false;
    this.i = 0;
    this.posY = pos[1];

    this.mesh = new THREE.Mesh();
    this.mesh.position.set(pos[0], pos[1], pos[2]);
    this.mesh.rotation.set(0, 0, 0.3);

    gltfLoader.load(gltfPath, gltf => {
      gltf.scene.children[0].material = keyMaterial;
      this.mesh.add(gltf.scene.children[0]);
    });

    this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    this.shadow.rotation.set(-Math.PI / 2, 0, Math.PI);
    this.shadow.position.set(pos[0], pos[1] - 1.7, pos[2]);

    this.body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: keyShape,
      position: new CANNON.Vec3(pos[0], pos[1] + 0.1, pos[2]),
      collisionResponse: false
    });

    this.body.addEventListener('collide', event => {
      if (event.body.name === 'player' && !this.collected) {
        this.collected = true;
      }
    });

  }

  reset(scene) {
    this.collected = false;
    this.mesh.scale.set(1, 1, 1);
    this.shadow.scale.set(1, 1, 1);
    scene.add(this.mesh);
    scene.add(this.shadow);
  }

  update(delta, scene) {
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
        this.shadow.scale.multiplyScalar(0.93);
      } else {
        // Key is finished shrinking
        scene.remove(this.mesh);
        scene.remove(this.shadow);
      }
    }
  }
}

export {
  Key
};