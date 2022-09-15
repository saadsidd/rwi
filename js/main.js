import CannonDebugger from '../lib/cannon/cannon-es-debugger.js';
import {
  clock,
  scene,
  renderer,
  camera,
  world,
} from './init.js';
import { player } from './player.js';
import { platforms, keys } from './level.js';

let delta = 0;
let paused = false;

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement) {
    paused = false;
    clock.start();
  } else {
    paused = true;
    clock.stop();
  }
});

const cannonDebugger = new CannonDebugger(scene, world);

const animate = () => {

  requestAnimationFrame(animate);

  if (!paused) {

    delta = clock.getDelta();

    player.update(delta);
    platforms.forEach(platform => platform.update(delta));
    keys.forEach(key => key.update(delta));

    cannonDebugger.update();
  
    world.fixedStep();
    renderer.render(scene, camera);

  }
  
};

animate();