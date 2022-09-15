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

// Player constants
const START_POSITION = [0, 144, 0];
const FALL_LIMIT = 100;

platforms.push(new CylinderPlatform({size: [3, 0.5, 32], pos: [0, 140, 0], color: 'green'}));
platforms.push(new BoxPlatform({size: [1.5, 0.25, 3], pos: [0, 140, -6]}));
platforms.push(new BoxPlatform({size: [7, 0.25, 1.5], pos: [-5.5, 140, -10.5]}));
platforms.push(new BoxPlatform({size: [1.5, 0.25, 6], pos: [-5.5, 140, -10.5]}));



// platforms.push(new CylinderPlatform({size: [3, 0.5, 32], pos: [0, 140, -7], color: 0x888888, type: KINEMATIC,
// action: function() {
//   let i = 0;
//   return function() {
//     i += 0.1;
//     this.body.position.set(Math.sin(i), 140, -7);
//   };
// },
// customize: function() {
//   this.body.angularVelocity.y = 3;
// }

// }));

// keys.push(new Key([2, 142, 0]));
// keys.push(new Key([-2, 142, 0]));
// keys.push(new Key([-2, 142, 2]));
// keys.push(new Key([-2, 142, -2]));



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