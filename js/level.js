import {
  BoxPlatform,
  CylinderPlatform,
  SpherePlatform
} from './platforms.js';
import { Key } from './keys.js';
import { scene, world } from './init.js';

const platforms = [];
const keys = [];
const KINEMATIC = 4;
const DYNAMIC = 1;
const DEG2RAD = Math.PI / 180;

// Player constants
const START_POSITION = [0, 144, 0];
// const START_POSITION = [6, 140, -103.5];
const FALL_LIMIT = 100;

// Starting platform
platforms.push(new CylinderPlatform({size: [3, 1, 64], pos: [0, 140, 0], color: 'green'}));

// Spiral to key
platforms.push(new BoxPlatform({size: [1.5, 0.25, 3], pos: [0, 140, -6]}));
platforms.push(new BoxPlatform({size: [7, 0.25, 1.5], pos: [-5.5, 140, -10.5]}));
platforms.push(new BoxPlatform({size: [1, 0.25, 8], pos: [-11.5, 140, -20]}));
platforms.push(new BoxPlatform({size: [7, 0.25, 0.75], pos: [-3.5, 140, -27.25]}));
platforms.push(new BoxPlatform({size: [0.5, 0.25, 4], pos: [3, 140, -22.5]}));
platforms.push(new BoxPlatform({size: [4, 0.25, 0.25], pos: [-1.5, 140, -18.75]}));
platforms.push(new BoxPlatform({size: [1.5, 0.25, 1.5], pos: [-4, 140, -20.5]}));
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
platforms.push(new BoxPlatform({size: [1.5, 0.25, 1.5], pos: [-4, 135, -110.5]}));

// Second key
keys.push(new Key([-4, 137, -110.5]));

// Sideways platform key activated
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