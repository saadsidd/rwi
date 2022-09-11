import CannonDebugger from '../lib/cannon/cannon-es-debugger.js';
import {
  clock,
  scene,
  renderer,
  camera,
  world,
} from './init.js';
import { player } from './player.js';
import { platforms } from './platforms.js';
import './level.js';

let delta = 0;

const cannonDebugger = new CannonDebugger(scene, world);

const animate = () => {

  requestAnimationFrame(animate);
  
  delta = clock.getDelta();

  player.update(delta);
  platforms.forEach(platform => platform.update(delta));
  // cannonDebugger.update();

  world.fixedStep();
  renderer.render(scene, camera);

};

animate();