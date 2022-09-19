import * as THREE from 'three';
import * as CANNON from 'cannon';
import {
  Platform,
  BoxPlatform,
  CylinderPlatform,
} from './platforms.js';
import { Key } from './keys.js';
import { scene, world, gripContactMaterial } from './init.js';

const platforms = [];
const keys = [];
const KINEMATIC = 4;
const DYNAMIC = 1;
const DEG2RAD = Math.PI / 180;

// Player constants
const START_POSITION = [0, 144, -1.5];
// const START_POSITION = [6, 140, -103.5];
// const START_POSITION = [6, 143, -130];
// const START_POSITION = [6, 135, -204];
const FALL_LIMIT = 100;

// Starting platform
platforms.push(new CylinderPlatform({size: [1.5, 0.5, 16], pos: [0, 140, -1.5], color: 'green'}));

// Spiral to key
platforms.push(new BoxPlatform({size: [1.5, 0.25, 3], pos: [0, 140, -6]}));
platforms.push(new BoxPlatform({size: [7, 0.25, 1.5], pos: [-5.5, 140, -10.5]}));
platforms.push(new BoxPlatform({size: [1, 0.25, 8], pos: [-11.5, 140, -20]}));
platforms.push(new BoxPlatform({size: [7, 0.25, 0.75], pos: [-3.5, 140, -27.25]}));
platforms.push(new BoxPlatform({size: [0.5, 0.25, 4], pos: [3, 140, -22.5]}));
platforms.push(new BoxPlatform({size: [4, 0.25, 0.25], pos: [-1.5, 140, -18.75]}));
platforms.push(new BoxPlatform({color: 0xFF2222, size: [1.5, 0.25, 1.5], pos: [-4, 140, -20.5]}));
platforms.push(new BoxPlatform({size: [1.5, 0.25, 10], pos: [-4, 135, -32]}));

// First key
keys.push(new Key([-4, 142, -20.5]));

// Spinning tilted cube
platforms.push(new BoxPlatform({type: KINEMATIC, size: [5, 5, 5], pos: [-4, 150, -50],
  action: function() {
    this.body.angularVelocity.y -= 1;
    this.body.quaternion.setFromEuler(35 * DEG2RAD, 0, 45 * DEG2RAD);
    this.canMove = true;
    return function() {
      if (keys[0].collected && this.canMove) {
        if (this.body.position.y >= 135) {
          this.body.position.y -= 0.5;
        } else {
          this.canMove = false;
        }
      }
    };
  },
  reset: function() {
    this.body.position.y = 150;
    this.canMove = true;
  }
}));

// Falling platforms maze
platforms.push(new BoxPlatform({size: [1.5, 0.25, 10], pos: [-4, 135, -68]}));
platforms.push(new BoxPlatform({size: [5, 0.25, 1.5], pos: [-10.5, 135, -76.5]}));
platforms.push(new BoxPlatform({size: [5, 0.25, 1.5], pos: [2.5, 135, -76.5]}));
platforms.push(new BoxPlatform({type: DYNAMIC, size: [1.5, 0.25, 7], pos: [-4, 135, -85],
  action: function() {
    this.body.mass = 2;
    this.body.sleep();
    this.body.addEventListener('collide', event => {
      if (event.body.name === 'player') {
        this.body.collisionResponse = false;
      }
    });
    return function() {};
  },
  reset: function() {
    this.body.position.set(-4, 135, -85);
    this.body.quaternion.setFromEuler(0, 0, 0);
    this.body.collisionResponse = true;
    this.body.sleep();
  }
}));
platforms.push(new BoxPlatform({type: DYNAMIC, size: [1.5, 0.25, 7], pos: [6, 135, -85],
  action: function() {
    this.body.mass = 2;
    this.body.sleep();
    this.body.addEventListener('collide', event => {
      if (event.body.name === 'player') {
        this.body.collisionResponse = false;
      }
    });
    return function() {};
  },
  reset: function() {
    this.body.position.set(6, 135, -85);
    this.body.quaternion.setFromEuler(0, 0, 0);
    this.body.collisionResponse = true;
    this.body.sleep();
  }
}));
platforms.push(new BoxPlatform({size: [1.5, 0.25, 7], pos: [-14, 135, -85]}));
platforms.push(new BoxPlatform({size: [6.5, 0.25, 1.5], pos: [-9, 135, -93.5]}));
const invisiblePlatform1 = new BoxPlatform({size: [5, 0.25, 1.5], pos: [2.5, 135, -93.5]});
world.addBody(invisiblePlatform1.body);
platforms.push(new BoxPlatform({type: DYNAMIC, size: [1.5, 0.25, 7], pos: [-4, 135, -102],
  action: function() {
    this.body.mass = 2;
    this.body.sleep();
    this.body.addEventListener('collide', event => {
      if (event.body.name === 'player') {
        this.body.collisionResponse = false;
      }
    });
    return function() {};
  },
  reset: function() {
    this.body.position.set(-4, 135, -102);
    this.body.quaternion.setFromEuler(0, 0, 0);
    this.body.collisionResponse = true;
    this.body.sleep();
  }
}));
platforms.push(new BoxPlatform({type: DYNAMIC, size: [1.5, 0.25, 8.5], pos: [6, 135, -103.5]}));
const invisiblePlatform2 = new BoxPlatform({size: [3.5, 0.25, 1.5], pos: [1, 135, -110.5]});
world.addBody(invisiblePlatform2.body);
platforms.push(new BoxPlatform({color: 0xFF2222, size: [1.5, 0.25, 1.5], pos: [-4, 135, -110.5]}));

// Second key
keys.push(new Key([-4, 137, -110.5]));

// Sideways platform (key activated)
platforms.push(new BoxPlatform({type: KINEMATIC, size: [5, 0.25, 10], pos: [6, 135, -122], rot: [0, 0, 90],
  action: function() {
    this.canSpin = true;
    return function() {
      if (keys[1].collected && this.canSpin) {
        this.body.angularVelocity.z = -3;
        if (this.mesh.rotation.z <= 0.1 && this.mesh.rotation.z >= 0) {
          this.body.angularVelocity.z = 0;
          this.body.quaternion.setFromEuler(0, 0, 0);
          this.canSpin = false;
        }
      }
    };
  },
  reset: function() {
    this.body.quaternion.setFromEuler(0, 0, 90 * DEG2RAD);
    this.canSpin = true;
  }
}));

// Spinning circles of cylinder platforms
const cylinderShape = new CANNON.Cylinder(3, 3, 0.5, 8);
const cylinderGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 8);

platforms.push(new Platform({type: KINEMATIC, contactMaterial: gripContactMaterial, pos: [6, 134, -166],
  action: function() {
    this.body.addShape(cylinderShape, new CANNON.Vec3(0, 0, 30));
    this.body.addShape(cylinderShape, new CANNON.Vec3(30, 0, 0));
    this.body.addShape(cylinderShape, new CANNON.Vec3(0, 0, -30));
    this.body.addShape(cylinderShape, new CANNON.Vec3(-30, 0, 0));

    const mesh1 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    const mesh2 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    const mesh3 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    const mesh4 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    mesh1.receiveShadow = true;
    mesh2.receiveShadow = true;
    mesh3.receiveShadow = true;
    mesh4.receiveShadow = true;
    mesh1.position.set(0, 0, 30);
    mesh2.position.set(30, 0, 0);
    mesh3.position.set(0, 0, -30);
    mesh4.position.set(-30, 0, 0);
    this.mesh.add(mesh1);
    this.mesh.add(mesh2);
    this.mesh.add(mesh3);
    this.mesh.add(mesh4);

    this.body.angularVelocity.y = 0.2;
    return function() {};
  }
}));

platforms.push(new Platform({type: KINEMATIC, contactMaterial: gripContactMaterial, pos: [6, 134, -166],
  action: function() {
    this.body.addShape(cylinderShape, new CANNON.Vec3(0, 0, 24));
    this.body.addShape(cylinderShape, new CANNON.Vec3(0, 0, -24));

    const mesh1 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    const mesh2 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    mesh1.receiveShadow = true;
    mesh2.receiveShadow = true;
    mesh1.position.set(0, 0, 24);
    mesh2.position.set(0, 0, -24);
    this.mesh.add(mesh1);
    this.mesh.add(mesh2);

    this.body.angularVelocity.y = -0.3;
    return function() {};
  }
}));

platforms.push(new Platform({type: KINEMATIC, contactMaterial: gripContactMaterial, pos: [6, 134, -166],
  action: function() {
    this.body.addShape(cylinderShape, new CANNON.Vec3(0, 0, 18));
    this.body.addShape(cylinderShape, new CANNON.Vec3(0, 0, -18));

    const mesh1 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    const mesh2 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    mesh1.receiveShadow = true;
    mesh2.receiveShadow = true;
    mesh1.position.set(0, 0, 18);
    mesh2.position.set(0, 0, -18);
    this.mesh.add(mesh1);
    this.mesh.add(mesh2);

    this.body.angularVelocity.y = 0.4;
    return function() {};
  }
}));

platforms.push(new Platform({type: KINEMATIC, contactMaterial: gripContactMaterial, pos: [6, 134, -166],
  action: function() {
    this.body.addShape(cylinderShape, new CANNON.Vec3(0, 0, 12));
    this.body.addShape(cylinderShape, new CANNON.Vec3(0, 0, -12));

    const mesh1 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    const mesh2 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    mesh1.receiveShadow = true;
    mesh2.receiveShadow = true;
    mesh1.position.set(0, 0, 12);
    mesh2.position.set(0, 0, -12);
    this.mesh.add(mesh1);
    this.mesh.add(mesh2);

    this.body.angularVelocity.y = -0.5;
    return function() {};
  }
}));

platforms.push(new Platform({type: KINEMATIC, contactMaterial: gripContactMaterial, pos: [6, 134, -166],
  action: function() {
    this.body.addShape(cylinderShape, new CANNON.Vec3(0, 0, 6));
    this.body.addShape(cylinderShape, new CANNON.Vec3(0, 0, -6));

    const mesh1 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    const mesh2 = new THREE.Mesh(cylinderGeometry, this.mesh.material);
    mesh1.receiveShadow = true;
    mesh2.receiveShadow = true;
    mesh1.position.set(0, 0, 6);
    mesh2.position.set(0, 0, -6);
    this.mesh.add(mesh1);
    this.mesh.add(mesh2);

    this.body.angularVelocity.y = 0.6;
    return function() {};
  }
}));

// Center cylinder platform
platforms.push(new CylinderPlatform({color: 0xFF2222, size: [3, 0.5, 16], pos: [6, 134, -166]}));

// Third key
keys.push(new Key([6, 136, -166]));

// Final stretch
platforms.push(new BoxPlatform({size: [5, 0.25, 5], pos: [6, 133, -204]}));
platforms.push(new BoxPlatform({size: [3, 0.25, 4], pos: [6, 133, -213]}));
platforms.push(new BoxPlatform({type:KINEMATIC, size: [1.5, 0.25, 3], pos: [6, 133, -220], rot: [90, 0, 0],
  action: function() {
    this.canSpin = true;
    return function() {
      if (keys[2].collected && this.canSpin) {
        this.body.angularVelocity.x = -4;
        if (this.mesh.rotation.x <= 0.1 && this.mesh.rotation.x >= 0) {
          this.body.angularVelocity.x = 0;
          this.body.quaternion.setFromEuler(0, 0, 0);
          this.canSpin = false;
        }
      }
    };
  },
  reset: function() {
    this.body.quaternion.setFromEuler(90 * DEG2RAD, 0, 0);
    this.canSpin = true;
  }
}));

// Finishing platform
platforms.push(new CylinderPlatform({size: [1.5, 0.5, 16], pos: [6, 133, -224.5], color: 'green'}));




// Add all created platforms to world/scene
platforms.forEach(platform => {
  world.addBody(platform.body);
  scene.add(platform.mesh);
});

// Add all keys to world/scene and create collision event listener
keys.forEach(key => {
  world.addBody(key.body);
  scene.add(key.mesh);
  key.setCollisionListener(scene);
});

export {
  platforms,
  keys,

  START_POSITION,
  FALL_LIMIT,
};