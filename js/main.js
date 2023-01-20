import CannonDebugger from 'cannon-es-debugger';
import {
  currentTimeDisplay,
  levelTiles,
  homeButton,
  restartButton,
  playButton,
  completionTime,
  setOverlay,
  updateLevelTimes,
  clock,
  meshBodySync,
  scene,
  renderer,
  camera,
  world,
} from './init.js';
import player from './player.js';
import loadLevel1 from './levels/level-1.js';
import loadLevel2 from './levels/level-2.js';
import loadLevel3 from './levels/level-3.js';
import loadLevel4 from './levels/level-4.js';
import loadLevel5 from './levels/level-5.js';
import * as TWEEN from 'tween';

let delta = 0;
let paused = true;
let finished = false;
let currentTime = 0;

const cannonDebugger = new CannonDebugger(scene, world);

const levelSelect = {
  '1': loadLevel1,
  '2': loadLevel2,
  '3': loadLevel3,
  '4': loadLevel4,
  '5': loadLevel5,
};

// Reset player and timer on collision with ground
player.body.addEventListener('collide', event => {
  if (event.body.name === 'ground') {
    player.reset();
    clock.elapsedTime = 0;
    currentTime = 0;
  }
});

const destroyLevel = () => {

  meshBodySync.length = 0;

  // Remove from scene
  const levelGLTF = scene.getObjectByName('Scene');
  if (levelGLTF) {
    scene.remove(levelGLTF);
    levelGLTF.traverse(child => {
      if (child.isMesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
  }

  // Remove from world
  const bodies = world.bodies.slice(2);
  for (const body of bodies) {
    world.removeBody(body);
  }

  console.log('Removed: ', renderer.info.memory.geometries, renderer.info.memory.textures);
};

// Save time to localStorage if better than previous, and show New Record!
const finishLevel = (level) => {

  finished = true;
  const prevTime = parseFloat(localStorage.getItem(level));
  const currTime = parseFloat(currentTime);

  completionTime.children[0].textContent = `${currTime.toFixed(1)}`;

  if (isNaN(prevTime)) {

    completionTime.children[1].textContent = ' (The time to beat!)';
    completionTime.children[1].style.color = '#ffffff';
    localStorage.setItem(level, currTime.toFixed(1));
    setOverlay('finished_better_time');

  } else if (currTime < prevTime) {

    completionTime.children[1].textContent = ` (${(currTime - prevTime).toFixed(1)})`;
    completionTime.children[1].style.color = '#6aff6a';
    localStorage.setItem(level, currTime.toFixed(1));
    setOverlay('finished_better_time');

  } else {

    completionTime.children[1].textContent = ` (+${(currTime - prevTime).toFixed(1)})`;
    completionTime.children[1].style.color = '#ff4a4a';
    setOverlay('finished');

  }

  document.exitPointerLock();

};

export { finishLevel };

// Dispose any already loaded meshes, reset player position, then load level
levelTiles.addEventListener('click', event => {

  if (event.target.tagName === 'BUTTON') {
    destroyLevel();
    player.reset();
    levelSelect[event.target.textContent]();
    document.body.requestPointerLock();
  }

});

// Go back to home page
homeButton.addEventListener('click', () => {
  currentTime = 0;
  setOverlay('home');
  updateLevelTimes();
});

// Reset player position and timer then resume level
restartButton.addEventListener('click', () => {
  currentTime = 0;
  player.reset();
  document.body.requestPointerLock();
});

// Continue playing
playButton.addEventListener('click', () => {
  document.body.requestPointerLock();
});

// If locked then playing so unpause, remove overlay, and start timer
// Otherwise pause, display paused overlay, and stop timer
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement) {

    paused = false;
    clock.start();
    clock.elapsedTime = currentTime;
    setOverlay('playing');

  } else if (finished) {

    finished = false;
    paused = true;

  } else {

    paused = true;
    currentTime = parseFloat(clock.elapsedTime.toFixed(1));
    clock.stop();
    setOverlay('paused');
  }
  
});

const animate = () => {

  requestAnimationFrame(animate);
  
  if (!paused) {

    delta = clock.getDelta();

    currentTime = clock.elapsedTime.toFixed(1);
    currentTimeDisplay.innerText = currentTime;

    player.update(delta);

    meshBodySync.forEach(platform => {
      platform.mesh.position.copy(platform.body.position);
      platform.mesh.quaternion.copy(platform.body.quaternion);
    });

    // cannonDebugger.update();

    TWEEN.update();
  
    world.fixedStep();
    renderer.render(scene, camera);

  }
  
};

animate();