import CannonDebugger from '../lib/cannon/cannon-es-debugger.js';
import {
  clock,
  scene,
  renderer,
  camera,
  world,
} from './init.js';
import { player, keyboard, testAngle } from './player.js';
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

// Reset player, keys, platforms on collision with ground
player.body.addEventListener('collide', event => {
  if (event.body.name === 'ground') {
    player.reset();
    keys.forEach(key => key.reset());
    platforms.forEach(platform => platform.reset());
  }
});

const cannonDebugger = new CannonDebugger(scene, world);

// For testing placement of latest platform when developing
const DEG2RAD = Math.PI / 180;
const latestPlatform = platforms[platforms.length - 1].body;

const moveLatestPlatform = () => {
  if (keyboard['KeyR']) {
    if (keyboard['ArrowLeft']) {
      testAngle.x -= 0.5;
    }
    if (keyboard['ArrowRight']) {
      testAngle.x += 0.5;
    }
    if (keyboard['ArrowUp']) {
      testAngle.z -= 0.5;
    }
    if (keyboard['ArrowDown']) {
      testAngle.z += 0.5;
    }
    if (keyboard['MetaRight']) {
      testAngle.y -= 0.5;
    }
    if (keyboard['ShiftLeft']) {
      testAngle.y += 0.5;
    }
    latestPlatform.quaternion.setFromEuler(testAngle.x * DEG2RAD, testAngle.y * DEG2RAD, testAngle.z * DEG2RAD);
    console.log(testAngle);
  } else {
    if (keyboard['ArrowLeft']) {
      latestPlatform.position.x -= 0.05;
      console.log(latestPlatform.position);
    }
    if (keyboard['ArrowRight']) {
      latestPlatform.position.x += 0.05;
      console.log(latestPlatform.position);
    }
    if (keyboard['ArrowUp']) {
      latestPlatform.position.z -= 0.05;
      console.log(latestPlatform.position);
    }
    if (keyboard['ArrowDown']) {
      latestPlatform.position.z += 0.05;
      console.log(latestPlatform.position);
    }
    if (keyboard['MetaRight']) {
      latestPlatform.position.y -= 0.05;
      console.log(latestPlatform.position);
    }
    if (keyboard['ShiftLeft']) {
      latestPlatform.position.y += 0.05;
      console.log(latestPlatform.position);
    }
  }
};

const animate = () => {

  requestAnimationFrame(animate);

  if (!paused) {

    delta = clock.getDelta();

    player.update(delta);
    platforms.forEach(platform => platform.update(delta));
    keys.forEach(key => key.update(delta));

    // moveLatestPlatform();

    // cannonDebugger.update();
  
    world.fixedStep();
    renderer.render(scene, camera);

  }
  
};

animate();