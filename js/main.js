import CannonDebugger from 'cannon-es-debugger';
import {
  clock,
  scene,
  renderer,
  camera,
  world,
} from './init.js';
import { player, keyboard, testAngle } from './player.js';
import { sync } from './level.js';
import * as TWEEN from 'tween';

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

// Reset player, keys, platforms on collision with ground
player.body.addEventListener('collide', event => {
  if (event.body.name === 'ground') {
    player.reset();
  }
});

const cannonDebugger = new CannonDebugger(scene, world);

const animate = () => {

  requestAnimationFrame(animate);

  if (!paused) {

    delta = clock.getDelta();

    player.update(delta);

    sync.forEach(platform => {
      platform.mesh.position.copy(platform.body.position);
      platform.mesh.quaternion.copy(platform.body.quaternion);
    })

    cannonDebugger.update();

    TWEEN.update();
  
    world.fixedStep();
    renderer.render(scene, camera);

  }
  
};

animate();