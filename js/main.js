import CannonDebugger from 'cannon-es-debugger';
import {
  meshBodySync,
  levelResets,
  // DOM
  currentTimeDisplay,
  levelTiles,
  homeButton,
  restartButton,
  playButton,
  completionTime,
  setOverlay,
  updateLevelTimes,
  // THREE
  clock,
  scene,
  renderer,
  camera,
  // CANNON
  world
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
    restartLevel();
  }
});

const restartLevel = () => {
  player.reset();
  levelResets.forEach(resetCallback => resetCallback());
  clock.elapsedTime = 0;
  currentTime = 0;
}

const destroyLevel = () => {

  meshBodySync.length = 0;
  levelResets.length = 0;

  // Remove from THREE scene
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

  // Remove from CANNON world (except player and ground)
  const bodies = world.bodies.slice(2);
  for (const body of bodies) {
    world.removeBody(body);
  }

  // Remove any preStep listeners
  if (world._listeners && world._listeners.preStep) {
    world._listeners.preStep.length = 0;
  }


  console.log('After removing: ', renderer.info.memory.geometries, renderer.info.memory.textures);
};

// Save time to localStorage if better than previous, and show New Record!
// Otherwise just show time
const finishLevel = (level) => {

  finished = true;
  const prevTime = parseFloat(localStorage.getItem(level));
  const currTime = parseFloat(currentTime);

  // Showing time to complete level
  completionTime.children[0].textContent = `${currTime.toFixed(1)}`;

  // Below is determining whether to show red(-)/green(+) time difference
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

// Loading levels after reseting player position back to start
levelTiles.addEventListener('click', event => {

  if (event.target.tagName === 'BUTTON') {
    player.reset();
    levelSelect[event.target.textContent]();
    document.body.requestPointerLock();
  }

});

// Go back to home page
homeButton.addEventListener('click', () => {

  currentTime = 0;
  destroyLevel();
  setOverlay('home');
  updateLevelTimes();

});

// Reset player position and timer then resume level
restartButton.addEventListener('click', () => {

  restartLevel();
  document.body.requestPointerLock();

});

// Continue playing
playButton.addEventListener('click', () => {

  document.body.requestPointerLock();

});

// If locked then playing so unpause, remove overlay, and start timer
// Otherwise pause, display paused overlay, and stop timer
// However if finished = true, show "Finished!" & finishing time, also remove resume button
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

  requestAnimationFrame(animate);
  
};

export {
  finishLevel
};

animate();