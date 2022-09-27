import {
  // DOM
  mainButton,
  sideButton,
  currentTimeDisplay,
  setOverlay,

  // THREE
  clock,
  scene,
  renderer,
  camera,

  // CANNON
  world,
} from './init.js';
import { player } from './player.js';
import { platforms, keys } from './level.js';
import { cannonDebugger, stats } from './helpers.js';

// Timing vars and overlay states
let delta = 0;
let currentTime = 0;
let bestTime = localStorage.getItem('best_time');
let paused = true;
let resetting = false;
let finished = false;

// Main button (Play), Side button (Reset)
mainButton.addEventListener('click', () => document.body.requestPointerLock());
sideButton.addEventListener('click', () => {
  resetting = true;
  document.body.requestPointerLock();
});

// If locked, then playing (with/without reset)
// If unlocked, then pausing or finishing
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement) {
    if (resetting) {
      resetGame();
      resetting = false;
    }
    setOverlay('playing', currentTime, bestTime);
    paused = false;
    clock.start();
    clock.elapsedTime = currentTime;
  } else {
    if (finished) {
      setOverlay('finished', currentTime, bestTime);
      finished = false;
    } else {
      setOverlay('paused');
    }
    currentTime = parseFloat(clock.elapsedTime.toFixed(1));
    paused = true;
  }
});

// Reset when collide with ground / Finish when collide with last platform
player.body.addEventListener('collide', event => {
  if (event.body.name === 'ground') {
    resetGame();
  }
  if (event.body.name === 'finish') {
    finishGame();
  }
});

// Reset player location/camera, add collected keys back into scene, reset platform positions, reset timer
const resetGame = () => {
  player.reset();
  keys.forEach(key => key.reset());
  platforms.forEach(platform => platform.reset());
  clock.elapsedTime = 0;
  currentTime = 0;
  bestTime = localStorage.getItem('best_time');
};

// Finish by saving time to localstorage (if new record), and exiting pointer lock to let pointerlockchange continue finishing
const finishGame = () => {
  finished = true;
  if (isNaN(parseFloat(bestTime)) || parseFloat(currentTime) < parseFloat(bestTime)) {
    localStorage.setItem('best_time', currentTime);
  }
  document.exitPointerLock();
};


// Main render loop
const animate = () => {

  requestAnimationFrame(animate);

  if (!paused) {

    stats.begin();

    currentTime = clock.elapsedTime.toFixed(1);
    currentTimeDisplay.innerText = currentTime;
    
    delta = clock.getDelta();
    player.update(delta);
    platforms.forEach(platform => platform.update(delta));
    keys.forEach(key => key.update(delta));

    // moveLatestPlatform();
    // cannonDebugger.update();
  
    world.fixedStep();
    renderer.render(scene, camera);

    stats.end();

  }
  
};

animate();