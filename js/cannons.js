import * as THREE from 'three';
import * as CANNON from 'cannon';
import { frictionlessContactMaterial } from './init.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();
const gltfPath = '../rwi/assets/cannon.glb';

const armsMaterial = new THREE.MeshStandardMaterial({ color: 0x505050 });
const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x101010 });
const boltsMaterial = new THREE.MeshStandardMaterial({ color: 0x202020 });

const cannonballGeometry = new THREE.SphereGeometry(0.75);
const cannonballMaterial = new THREE.MeshStandardMaterial({ color: 0x101010 });
const cannonballShape = new CANNON.Sphere(0.75);

class Cannon {
  constructor(pos) {

    this.shootDelay = 0;
    // this.rotationMatrix = new THREE.Matrix4();
    // this.targetQuaternion = new THREE.Quaternion();

    this.sides = new THREE.Mesh();
    this.sides.position.set(pos[0], pos[1], pos[2]);

    this.barrel = new THREE.Mesh();
    this.barrel.position.set(pos[0], pos[1], pos[2]);

    gltfLoader.load(gltfPath, gltf => {
      gltf.scene.children[0].material = armsMaterial;
      gltf.scene.children[1].material = barrelMaterial;
      gltf.scene.children[2].material = boltsMaterial;

      this.sides.add(gltf.scene.children[0]);
      this.barrel.add(gltf.scene.children[0]);
      this.sides.add(gltf.scene.children[0]);
    });

    this.cylinderTop = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x303030 })
    );
    this.cylinderTop.position.set(pos[0], pos[1] + 2.5, pos[2]);

    this.cannonball = {
      body: new CANNON.Body({
        mass: 5,
        type: CANNON.Body.DYNAMIC,
        shape: cannonballShape,
        material: frictionlessContactMaterial
      }),
      mesh: new THREE.Mesh(cannonballGeometry, cannonballMaterial),
      velocity: new THREE.Vector3(),
      freeze: function() {
        this.body.position.set(pos[0], pos[1] + 1000, pos[2]);
        this.body.sleep();
      }
    };

    // Cannonball suspended asleep above cannon initially or after hitting ground
    this.cannonball.freeze();

    this.cannonball.body.addEventListener('collide', event => {
      if (event.body.name === 'ground') {
        this.cannonball.freeze();
      }
    });


    this.dir = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.euler = new THREE.Euler();
  }

  update(delta, player) {
    const distanceToPlayer = player.position.distanceTo(this.barrel.position);
    if (distanceToPlayer < 40) {
      this.point(player);
      this.shoot(delta, distanceToPlayer);
    }
    this.syncCannonball();
  }

  point(player) {
    this.barrel.lookAt(player.position);
    // this.rotationMatrix.lookAt(player.position, this.barrel.position, this.barrel.up);
    // this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);
    // this.barrel.quaternion.rotateTowards(this.targetQuaternion, 0.05);
    this.sides.rotation.y = Math.atan2((player.position.x - this.barrel.position.x), (player.position.z - this.barrel.position.z));


  }

  shoot(delta, distanceToPlayer) {
    this.shootDelay += delta;
    if (this.shootDelay > 5) {
      this.shootDelay = 0;
      this.cannonball.body.wakeUp();
      this.cannonball.velocity.set(0, 0, 0);
      this.cannonball.velocity.z = 60 + distanceToPlayer;

      this.cannonball.velocity.applyQuaternion(this.barrel.quaternion);
      this.cannonball.body.position.copy(this.barrel.position);
      this.cannonball.body.velocity.copy(this.cannonball.velocity);
    }
  }

  syncCannonball() {
    this.cannonball.mesh.position.copy(this.cannonball.body.position);
  }
}

export {
  Cannon,
};