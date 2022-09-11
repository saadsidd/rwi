import {
  platforms,
  BoxPlatform,
  CylinderPlatform,
} from './platforms.js';
import { scene, world } from './init.js';

const randomColor = () => {
  // return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
  return [Math.random(), Math.random(), Math.random()];
};

platforms.push(new CylinderPlatform({size: [3, 0.5, 32], pos: [0, 20, 0], color: 'green', type: 'kinematic'}));

platforms.forEach(platform => {
  world.addBody(platform.body);
  scene.add(platform.mesh);
});
