import * as CANNON from 'cannon';
import CannonDebugger from '../lib/cannon/cannon-es-debugger.js';
import Stats from '../lib/stats.module.js';
import { scene, world } from './init.js';
import { keyboard } from './player.js';
import { platforms } from './level.js';


// Display CANNON bodies in the world as outlines
const cannonDebugger = new CannonDebugger(scene, world);


// Displaying FPS, rendering time, memory (MB) for development
const stats = new Stats();
stats.showPanel(0);
// Shows the 3 panels side-by-side
// const panels = [0, 1, 2]; // 0: fps, 1: ms, 2: mb
// Array.from(stats.dom.children).forEach((child, index) => {
//   child.style.display = panels.includes(index) ? 'inline-block' : 'none';
// });
document.body.appendChild(stats.dom);


// For testing position/rotation of latest platform when developing
const latestPlatform = platforms[platforms.length - 1].body;
const testAngle = new CANNON.Vec3(0, 0, 0);

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
    latestPlatform.quaternion.setFromEuler(testAngle.x * Math.PI / 180, testAngle.y * Math.PI / 180, testAngle.z * Math.PI / 180);
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


export {
  cannonDebugger,
  stats,
  moveLatestPlatform
};