import * as THREE from 'three';
import * as CANNON from 'cannon';
import {
  Platform,
  BoxPlatform,
  CylinderPlatform,
} from './platforms.js';
import { player } from './player.js';
import { Key } from './keys.js';
import { Cannon } from './cannons.js';
import { scene, world, slipperyContactMaterial, superSlipperyContactMaterial, frictionlessContactMaterial, groundContactMaterial } from './init.js';

const platforms = [];
const cannons = [];
const keys = [];
const KINEMATIC = 4;
const DYNAMIC = 1;
const DEG2RAD = Math.PI / 180;

const textureLoader = new THREE.TextureLoader();

// Player constants
const START_POSITION = [0, 145, 62];
// const START_POSITION = [6, 140, -76];
// const START_POSITION = [6, 137, -144];
// const START_POSITION = [6, 135, -207];
// const START_POSITION = [6, 135, -247];
// const START_POSITION = [-18, 133, -272];
// const START_POSITION = [-41, 138, -298];
// const START_POSITION = [51, 136, -350];
// const START_POSITION = [34, 136, -387];
// const START_POSITION = [15, 137, -43];
const FALL_LIMIT = 100;


const disappearingAction = function() {
  let active = false;
  const material = this.mesh.material;
  material.transparent = true;

  this.body.addEventListener('collide', event => {
    if (event.body.name === 'player' && !active) {
      active = true;
      material.color.setHex(0xFF0000);
    }
  });
  return function(delta) {
    if (active) {
      if (material.opacity > 0) {
        material.opacity -= delta * 0.4;
      } else {
        active = false;
        this.body.collisionResponse = false;
      }
    }
  };
};

const disappearingReset = function() {
  this.body.collisionResponse = true;
  this.mesh.material.color.setHex(0xBBBBBB);
  this.mesh.material.opacity = 1;
};


// Starting platform
platforms.push(new CylinderPlatform({size: [3, 1, 64], pos: [0, 141, 62], color: 'green'}));


// Spin to spin platforms
platforms.push(new BoxPlatform({type: KINEMATIC, size: [10, 0.25, 1.5], pos: [0, 140.75, 48.5],
  action: function() {
    this.body.angularVelocity.y = 1;
    return function() {};
  }
}));
platforms.push(new BoxPlatform({type: KINEMATIC, size: [10, 0.25, 1.5], pos: [0, 140.5, 28],
  action: function() {
    this.body.angularVelocity.y = -1;
    return function() {};
  }
}));
platforms.push(new BoxPlatform({type: KINEMATIC, size: [10, 0.25, 1.5], pos: [0, 140.25, 7.5],
  action: function() {
    this.body.angularVelocity.y = -1;
    return function() {};
  }
}));



// Spiral to key
platforms.push(new BoxPlatform({size: [1.5, 0.25, 3], pos: [0, 140, -6]}));
platforms.push(new BoxPlatform({size: [7, 0.25, 1.5], pos: [-5.5, 140, -10.5]}));
platforms.push(new BoxPlatform({size: [1, 0.25, 8], pos: [-11.5, 140, -20]}));
platforms.push(new BoxPlatform({size: [7, 0.25, 0.75], pos: [-3.5, 140, -27.25]}));
platforms.push(new BoxPlatform({size: [0.5, 0.25, 4], pos: [3, 140, -22.5]}));
platforms.push(new BoxPlatform({size: [4, 0.25, 0.25], pos: [-1.5, 140, -18.75]}));
platforms.push(new BoxPlatform({size: [1.5, 0.25, 1.5], pos: [-4, 140, -20.5]}));
platforms.push(new BoxPlatform({size: [1.5, 0.25, 10], pos: [-4, 135, -32]}));

// First key
keys.push(new Key([-4, 142, -20.5]));

// Spinning tilted cube
platforms.push(new BoxPlatform({type: KINEMATIC, size: [5, 5, 5], pos: [-4, 150, -50],
  action: function() {
    this.body.angularVelocity.y -= 1;
    this.body.quaternion.setFromEuler(35 * DEG2RAD, 0, 45 * DEG2RAD);
    this.canMove = true;
    return function(delta) {
      if (keys[0].collected && this.canMove) {
        if (this.body.position.y >= 135) {
          this.body.position.y -= 8 * delta;
        } else {
          this.canMove = false;
        }
      }
    };
  },
  reset: function() {
    this.body.position.y = 150;
    this.canMove = true;
  }
}));

// Falling platforms maze
platforms.push(new BoxPlatform({size: [1.5, 0.25, 10], pos: [-4, 135, -68]}));
platforms.push(new BoxPlatform({size: [5, 0.25, 1.5], pos: [-10.5, 135, -76.5]}));
platforms.push(new BoxPlatform({size: [5, 0.25, 1.5], pos: [2.5, 135, -76.5]}));
platforms.push(new BoxPlatform({type: DYNAMIC, size: [1.5, 0.25, 7], pos: [-4, 135, -85],
  action: function() {
    this.body.mass = 2;
    this.body.sleep();
    this.body.addEventListener('collide', event => {
      if (event.body.name === 'player') {
        this.body.collisionResponse = false;
      }
    });
    return function() {};
  },
  reset: function() {
    this.body.position.set(-4, 135, -85);
    this.body.quaternion.setFromEuler(0, 0, 0);
    this.body.collisionResponse = true;
    this.body.sleep();
  }
}));
platforms.push(new BoxPlatform({type: DYNAMIC, size: [1.5, 0.25, 7], pos: [6, 135, -85],
  action: function() {
    this.body.mass = 2;
    this.body.sleep();
    this.body.addEventListener('collide', event => {
      if (event.body.name === 'player') {
        this.body.collisionResponse = false;
      }
    });
    return function() {};
  },
  reset: function() {
    this.body.position.set(6, 135, -85);
    this.body.quaternion.setFromEuler(0, 0, 0);
    this.body.collisionResponse = true;
    this.body.sleep();
  }
}));
platforms.push(new BoxPlatform({size: [1.5, 0.25, 7], pos: [-14, 135, -85]}));
platforms.push(new BoxPlatform({size: [6.5, 0.25, 1.5], pos: [-9, 135, -93.5]}));
const invisiblePlatform1 = new BoxPlatform({size: [5, 0.25, 1.5], pos: [2.5, 135, -93.5]});
world.addBody(invisiblePlatform1.body);
platforms.push(new BoxPlatform({type: DYNAMIC, size: [1.5, 0.25, 7], pos: [-4, 135, -102],
  action: function() {
    this.body.mass = 2;
    this.body.sleep();
    this.body.addEventListener('collide', event => {
      if (event.body.name === 'player') {
        this.body.collisionResponse = false;
      }
    });
    return function() {};
  },
  reset: function() {
    this.body.position.set(-4, 135, -102);
    this.body.quaternion.setFromEuler(0, 0, 0);
    this.body.collisionResponse = true;
    this.body.sleep();
  }
}));
platforms.push(new BoxPlatform({type: DYNAMIC, size: [1.5, 0.25, 8.5], pos: [6, 135, -103.5]}));
const invisiblePlatform2 = new BoxPlatform({size: [3.5, 0.25, 1.5], pos: [1, 135, -110.5]});
world.addBody(invisiblePlatform2.body);
platforms.push(new BoxPlatform({size: [1.5, 0.25, 1.5], pos: [-4, 135, -110.5]}));


// Second key
keys.push(new Key([-4, 137, -110.5]));


// Sideways platform key activated
// platforms.push(new BoxPlatform({type: KINEMATIC, size: [5, 0.25, 10], pos: [6, 135, -122], rot: [0, 0, 90],
//   action: function() {
//     this.canSpin = true;
//     return function() {
//       if (keys[1].collected && this.canSpin) {
//         this.body.angularVelocity.z = -3;
//         if (this.mesh.rotation.z <= 0.1 && this.mesh.rotation.z >= 0) {
//           this.body.angularVelocity.z = 0;
//           this.body.quaternion.setFromEuler(0, 0, 0);
//           this.canSpin = false;
//         }
//       }
//     };
//   },
//   reset: function() {
//     this.body.quaternion.setFromEuler(0, 0, 90 * DEG2RAD);
//     this.canSpin = true;
//   }
// }));

const spinningSpeed = 3;
const positions = [
  [6, 134, -117],
  [-2, 132, -122],
  [-2, 130, -131],
  [6, 128, -136],
];

for (let i = 0; i < positions.length; i++) {
  platforms.push(new CylinderPlatform({type: KINEMATIC, size: [4, 1, 3], pos: positions[i],
    action: function() {
      this.body.angularVelocity.y = spinningSpeed;
      return function() {};
    }
  }));
}

platforms.push(new CylinderPlatform({type: KINEMATIC, size: [4, 1, 3], pos: [20, 134, -117], color: 0xFF50CB,
  action: function() {
    this.body.quaternion.setFromEuler(0, Math.random() * 2, 0);
    this.body.addEventListener('collide', event => {
      event.body.velocity.y = 15;
    });
    return function() {};
  }
}));


// Ice platform
const crackTexture = textureLoader.load('/assets/ice-texture.png');
crackTexture.wrapS = crackTexture.wrapT = THREE.RepeatWrapping;
crackTexture.repeat.set(0.5, 0.5);
crackTexture.rotation = Math.PI / 6;
platforms.push(new BoxPlatform({size: [5, 0.5, 5], pos: [15, 134, -90], color: 0x4080FF,
  action: function() {
    this.body.material = superSlipperyContactMaterial;
    this.mesh.material.map = crackTexture;
    return function() {};
  }
}));





// Add a platform that turns red when touched then falls down/disappears
// ======================
// -[=-=-=-=-=0[p=-0=[00=-p][=-0=0]]]
for (let i = 0; i < 10; i++) {

  platforms.push(new BoxPlatform({size: [3, 0.5, 2], pos: [11 + 6 * i, 134, -108],
    action: disappearingAction,
    reset: disappearingReset
  }));

}


cannons.push(new Cannon([-45, 145, -80]));

// Point to point constraints
const swingPosition = [-30, 130, -80];

const anchor = new CANNON.Body({
  position: new CANNON.Vec3(...swingPosition)
});

const swing = new Platform({pos: swingPosition, color: 'lightgreen',
  action: function() {
    this.mesh.material.transparent = true;
    this.mesh.material.opacity = 0.5;
    this.body.type = CANNON.Body.DYNAMIC;
    this.body.mass = 2;
    this.body.addShape(new CANNON.Cylinder(6, 6, 0.5));

    this.mesh.add(new THREE.Mesh(
      new THREE.CylinderGeometry(6, 6, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xBBBBBB, flatShading: true })
    ));
    this.mesh.add(new THREE.Mesh(
      // new THREE.IcosahedronGeometry(1, 2),
      new THREE.SphereGeometry(1, 8, 8),
      // new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.MeshStandardMaterial({ color: 0xBBBBBB })
    ));
    this.mesh.add(new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 12, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xBBBBBB, transparent: true, opacity: 0.5 })
    ));
    // this.mesh.add(new THREE.Mesh(
    //   new THREE.BoxGeometry(0.5, 2, 0.5),
    //   new THREE.MeshStandardMaterial({ color: 0xBBBBBB, transparent: true, opacity: 0.5 })
    // ));
    this.mesh.children[0].receiveShadow = true;
    this.mesh.children[1].position.y += 12;
    this.mesh.children[2].position.y += 6;
    // this.mesh.children[3].position.y += 4;
    return function() {};
  },
  reset: function() {
    // Need to set position so it stops moving
    this.body.position.set(...swingPosition);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.quaternion.setFromEuler(0, 0, 0);
  }
});

const pointA = {
  mesh: new THREE.Mesh(
    new THREE.SphereGeometry(0.25),
    new THREE.MeshStandardMaterial({ color: 'blue' })
  ),
  local: new CANNON.Vec3(0, 12, 0)
};
pointA.mesh.position.set(
  anchor.position.x + pointA.local.x,
  anchor.position.y + pointA.local.y,
  anchor.position.z + pointA.local.z,
);
scene.add(pointA.mesh);

const pointB = {
  mesh: new THREE.Mesh(
    new THREE.SphereGeometry(0.25),
    new THREE.MeshStandardMaterial({ color: 'red' })
  ),
  local: new CANNON.Vec3(0, 12, 0)
};
pointB.mesh.position.set(
  swing.body.position.x + pointB.local.x,
  swing.body.position.y + pointB.local.y,
  swing.body.position.z + pointB.local.z,
);
scene.add(pointB.mesh);

world.addConstraint(new CANNON.PointToPointConstraint(
  anchor,
  pointA.local,
  swing.body,
  pointB.local
));

// platforms.push(anchor);
// world.addBody(anchor);
platforms.push(swing);


platforms.push(new BoxPlatform({size: [2, 0.25, 4], pos: [6, 135, -144]}));

// Spinning spiral obstacle
platforms.push(new Platform({type: KINEMATIC, pos: [6, 142, -152],
  action: function() {
    const boxSize = [1.5, 0.25, 3];
    const boxShape = new CANNON.Box(new CANNON.Vec3(...boxSize));
    const boxPos = new CANNON.Vec3();
    const boxQuat = new CANNON.Quaternion();

    const boxColor = new THREE.Color(0.2, 0.2, 0);
    const boxGeometry = new THREE.BoxGeometry(boxSize[0] * 2, boxSize[1] * 2, boxSize[2] * 2);

    for (let i = 0; i < 20; i++) {
      boxPos.set(8 * Math.cos((270 - 30 * i) * DEG2RAD), 8 * Math.sin((270 - 30 * i) * DEG2RAD), -2.5 * i);
      boxQuat.setFromEuler(0, 0, (360 - 30 * i) * DEG2RAD);
      this.body.addShape(boxShape, boxPos, boxQuat);

      // boxColor.b += i / 200;
      // boxColor.g += i / 60;
      boxColor.r += i / 100;
      let tempMesh = new THREE.Mesh(boxGeometry, new THREE.MeshStandardMaterial({ color: boxColor }));
      tempMesh.receiveShadow = true;
      tempMesh.position.copy(boxPos);
      tempMesh.quaternion.copy(boxQuat);
      this.mesh.add(tempMesh);
    }

    this.body.angularVelocity.z = 1.5;
    this.body.material = slipperyContactMaterial;
    return function() {};
  },
  reset: function() {
    this.body.quaternion.setFromEuler(0, 0, 0);
  }
}));

platforms.push(new BoxPlatform({size: [2, 0.25, 4], pos: [6, 132.5, -207]}));


const bounceTexture = textureLoader.load('/assets/bounce-texture7.png');
bounceTexture.wrapS = bounceTexture.wrapT = THREE.RepeatWrapping;
bounceTexture.repeat.set(1, 4);
// const bounceMaterial = new THREE.MeshStandardMaterial({ color: 0xFF50CB, map: bounceTexture });
// Bouncy platforms obstacle
// let rubberTextureSquare = null;
// let rubberTextureLong = null;
// textureLoader.load('/assets/rubber-texture2.png', texture => {
//   rubberTextureSquare = texture.clone();
//   rubberTextureLong = texture.clone();
// });
// rubberTexture.wrapS = rubberTexture.wrapT = THREE.RepeatWrapping;
// rubberTexture.repeat.set(2, 2);
// console.log(rubberTexture.clone());

platforms.push(new BoxPlatform({size: [2.5, 0.25, 10], pos: [11, 125, -226], color: 0xFF50CB,
  action: function() {
    this.mesh.material.map = bounceTexture;
    this.body.addEventListener('collide', event => event.body.velocity.y = 20);
    return function() {};
  }
}));
platforms.push(new BoxPlatform({size: [2.5, 0.25, 10], pos: [1, 125, -226], color: 0xFF50CB,
  action: function() {
    this.body.addEventListener('collide', event => event.body.velocity.y = 20);
    return function() {};
  }
}));

platforms.push(new BoxPlatform({size: [2, 0.25, 4], pos: [6, 132.5, -245]}));

platforms.push(new BoxPlatform({size: [2, 0.25, 2], pos: [-1, 125, -247], color: 0xFF50CB,
  action: function() {
    this.mesh.material.map = bounceTexture;
    // this.mesh.material = bounceMaterial;
    this.body.addEventListener('collide', event => event.body.velocity.y = 15);
    return function() {};
  }
}));
platforms.push(new BoxPlatform({size: [2, 0.25, 2], pos: [-9, 125, -247], color: 0xFF50CB,
  action: function() {
    this.body.addEventListener('collide', event => event.body.velocity.y = 15);
    return function() {};
  }
}));
platforms.push(new BoxPlatform({size: [3, 0.25, 3], pos: [-18, 125, -247], color: 0xFF50CB,
  action: function() {
    this.body.addEventListener('collide', event => event.body.velocity.y = 15);
    return function() {};
  }
}));
platforms.push(new BoxPlatform({size: [2, 0.25, 2], pos: [-18, 125, -255], color: 0xFF50CB,
  action: function() {
    this.body.addEventListener('collide', event => event.body.velocity.y = 15);
    return function() {};
  }
}));
platforms.push(new BoxPlatform({size: [2, 0.25, 2], pos: [-18, 125, -263], color: 0xFF50CB,
  action: function() {
    this.body.addEventListener('collide', event => event.body.velocity.y = 15);
    return function() {};
  }
}));

platforms.push(new BoxPlatform({size: [2, 0.25, 4], pos: [-18, 130, -272]}));



// Flinging platform
platforms.push(new BoxPlatform({type: KINEMATIC, size: [4, 0.25, 2], pos: [12, 135, -76], color: 0xDAA520,
  action: function() {
    let canSpin = true;
    let timer = 0;
    return function() {
      if (canSpin) {
        timer += 0.005;
      }
      if (timer > 1) {
        timer = 0;
        canSpin = false;
        this.body.angularVelocity.z = -10;
      }
      if (this.mesh.rotation.z < -2.7) {
        this.body.angularVelocity.z = 0;
        this.body.quaternion.setFromEuler(0, 0, 0);
        canSpin = true;
      }
    };
  }
}));


// Flinging platform catchers
// ===0==0000========00000====00====0=0
// Add door hinge constraint for backboard catcher
// maybe shrinks before falling down to form a path?
platforms.push(new BoxPlatform({size: [6, 0.25, 1.5], pos: [100, 135, -76]}));
platforms.push(new BoxPlatform({size: [0.25, 6, 1.5], pos: [108, 141, -76], rot: [0, 0, -10],
  action: function() {
    this.body.material = superSlipperyContactMaterial;
    return function() {};
  }
}));



cannons.push(new Cannon([0, 150, -10]));


keys.push(new Key([-41, 137.25, -309]));

// Spinning plus sign, have to cross it twice (once on round floor, then again over the blades)
platforms.push(new CylinderPlatform({size: [20, 1, 16], pos: [-18, 129.25, -297], color: 0xBA8500}));
platforms.push(new Platform({type: KINEMATIC, pos: [-18, 132, -297],
  action: function() {
    const bladeShape = new CANNON.Box(new CANNON.Vec3(20, 2, 1.5));
    const pos = new CANNON.Vec3(0, 0, 0);
    this.body.addShape(bladeShape, pos);
    this.body.addShape(bladeShape, pos, new CANNON.Quaternion().setFromEuler(0, 90 * DEG2RAD, 0));
    this.body.material = slipperyContactMaterial;
    // this.body.angularVelocity.y = 1.5;

    const bladeGeometry = new THREE.BoxGeometry(40, 4, 3);
    this.mesh.add(new THREE.Mesh(bladeGeometry, new THREE.MeshStandardMaterial({ color: 0xBAA520 })));
    this.mesh.add(new THREE.Mesh(bladeGeometry, new THREE.MeshStandardMaterial({ color: 0xFAA520 })));
    this.mesh.children[0].receiveShadow = true;
    this.mesh.children[1].receiveShadow = true;
    this.mesh.children[1].rotation.y += Math.PI / 2;
    this.mesh.children[1].position.y += 0.001;  // Prevent z-fighting
    return function() {
      if (keys[2].collected) {
        this.body.angularVelocity.y = 0.75;
      }
    };
  },
  reset: function() {
    this.body.angularVelocity.y = 1.5;
  }
}));
platforms.push(new BoxPlatform({size: [2, 0.25, 4], pos: [-18, 132.5, -320], rot: [45, 0, 0]}));
platforms.push(new BoxPlatform({size: [11.5, 0.25, 2], pos: [-27.5, 135.25, -324.65]}));
platforms.push(new BoxPlatform({size: [2, 0.25, 17], pos: [-41, 135.25, -309.65]}));



platforms.push(new BoxPlatform({size: [8, 0.25, 2], pos: [11, 133.4, -297]}));
// Hidden slippery before finish
platforms.push(new Platform({pos: [34, 133.4, -297],
  action: function() {
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(15, 0.25, 2)));
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(2, 0.25, 6)), new CANNON.Vec3(17, 0, -4));
    this.body.material = superSlipperyContactMaterial;

    const material = new THREE.MeshStandardMaterial({ color: 0xBBBBBB });
    this.mesh.add(new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 4), material));
    this.mesh.add(new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 12), material));
    this.mesh.children[0].receiveShadow = true;
    this.mesh.children[1].receiveShadow = true;
    this.mesh.children[1].position.set(17, 0, -4);

    this.body.addEventListener('collide', () => {
      this.mesh.children[0].material.color.setHex(0x4080FF);
      this.mesh.children[1].material.color.setHex(0x4080FF);
    });
    
    return function() {};
  },
  reset: function() {
    this.mesh.children[0].material.color.setHex(0xBBBBBB);
    this.mesh.children[1].material.color.setHex(0xBBBBBB);
  }
}));
platforms.push(new BoxPlatform({size: [2, 0.25, 10], pos: [51, 133.4, -317]}));

// Hidden bouncy platform
platforms.push(new BoxPlatform({size: [2, 0.25, 2], pos: [51, 133.4, -329],
  action: function() {
    this.body.addEventListener('collide', event => {
      event.body.velocity.y = 15;
      this.mesh.material.color.setHex(0xFF50CB);
    });
    return function() {};
  },
  reset: function() {
    this.mesh.material.color.setHex(0xBBBBBB);
  }
}));

platforms.push(new BoxPlatform({size: [2, 0.25, 5], pos: [51, 133.4, -336]}));

// Ending/Finish platform
const finishTexture = textureLoader.load('/assets/finish-texture.png');
finishTexture.wrapS = THREE.RepeatWrapping;
finishTexture.wrapT = THREE.RepeatWrapping;
finishTexture.repeat.set(5, 5);
// finishTexture.rotation = Math.PI / 4;
const finishMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, map: finishTexture });
const finishSide = new THREE.MeshStandardMaterial({ color: 0xBBBBBB });
const finishArray = [
  finishSide,
  finishMaterial,
  finishMaterial
];
platforms.push(new CylinderPlatform({size: [6, 0.5, 64], pos: [51, 133.4, -347],
  action: function() {
    this.mesh.material = finishArray;
    return function() {};
  }
}));


cannons.push(new Cannon([25, 140, -380]));



platforms.push(new BoxPlatform({size: [1, 0.25, 5], pos: [51, 133.4, -358]}));
platforms.push(new BoxPlatform({size: [1, 0.25, 5], pos: [47.75, 133.4, -365.85], rot: [0, 45, 0]}));
platforms.push(new BoxPlatform({size: [9.6, 0.25, 1.5], pos: [53.15, 133.4, -370.1]}));
platforms.push(new BoxPlatform({size: [0.25, 1.5, 1.5], pos: [32.5, 134.65, -370.1],
  action: function() {
    this.body.material = superSlipperyContactMaterial;
    return function() {};
  }
}));
platforms.push(new BoxPlatform({size: [1, 0.25, 10], pos: [33.75, 133.4, -381.6]}));



platforms.push(new BoxPlatform({size: [1.5, 0.25, 1.5], pos: [49, 133.4, -382], color: 'gray'}));
keys.push(new Key([49, 135.4, -382]));


platforms.push(new BoxPlatform({size: [1, 0.25, 5], pos: [61.75, 133.4, -376.6]}));
platforms.push(new BoxPlatform({size: [0.5, 0.25, 2.5], pos: [61.75, 133.4, -384.1]}));
platforms.push(new BoxPlatform({size: [0.25, 0.25, 2.5], pos: [61.75, 133.4, -389.1]}));
platforms.push(new BoxPlatform({size: [2.5, 0.25, 0.2], pos: [59, 133.4, -391.4]}));
platforms.push(new BoxPlatform({size: [8, 0.25, 0.15], pos: [54.55, 133.4, -383.85], rot: [0, 75, 0]}));
platforms.push(new BoxPlatform({size: [3, 0.25, 0.15], pos: [50.35, 133.4, -378.35], rot: [0, 135, 0]}));




platforms.push(new Platform({type: KINEMATIC, pos: [33.75, 131.5, -396],
  action: function() {
    const shape = new CANNON.Box(new CANNON.Vec3(2, 2, 4));
    const offset = new CANNON.Vec3();
    const quat = new CANNON.Quaternion();
    const geometry = new THREE.BoxGeometry(4, 4, 8);
    // const material = new THREE.MeshStandardMaterial({ color: 0xBBBBBB });
    const color = new THREE.Color(0x440000);
    
    for (let i = 0; i < 10; i++) {
      offset.z = -i * 8;
      quat.setFromEuler(0, 0, i * 10 * DEG2RAD);
      this.body.addShape(shape, offset, quat);
      
      color.r += i / 40;
      // console.log(color);
      const tempMesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color }));
      tempMesh.receiveShadow = true;
      tempMesh.position.copy(offset);
      tempMesh.quaternion.copy(quat);
      this.mesh.add(tempMesh);
    }

    this.body.angularVelocity.z = 1;
    // this.body.material = slipperyContactMaterial;

    return function() {};
  }
}));


// Frictionless ice texture platform
const iceTexture = textureLoader.load('/assets/ice-background2.png');
iceTexture.wrapS = THREE.MirroredRepeatWrapping;
iceTexture.wrapT = THREE.MirroredRepeatWrapping;
iceTexture.repeat.set(2, 1);
const iceMaterial = new THREE.MeshStandardMaterial({ color: 0x3070FF, map: iceTexture });
const iceSide = new THREE.MeshStandardMaterial({ color: 0x50A0FF });
const iceArray = [
  iceSide,
  iceSide,
  iceMaterial,
  iceSide,
  iceSide,
  iceSide,
];
platforms.push(new BoxPlatform({size: [75, 1, 10], pos: [84, 134, -55], color: 0x50A0FF,
  action: function() {
    this.body.addEventListener('collide', event => {
      if (event.body.name === 'player') {
        player.movementSpeed = 0;
      }
    });
    this.body.name = 'slip';
    this.body.material = frictionlessContactMaterial;
    this.mesh.material = iceArray;
    return function() {};
  }
}));

// Event listener for when leaving frictionless platform, put back player movement speed
world.addEventListener('endContact', event => {
  if (event.bodyA.name === 'slip') {
    player.movementSpeed = 20;
  }
});

platforms.push(new BoxPlatform({size: [6, 1, 1], pos: [165, 134, -55]}));
platforms.push(new BoxPlatform({size: [6, 1, 3], pos: [3, 134, -55]}));

platforms.push(new BoxPlatform({size: [1.5, 1, 5], pos: [15, 134, -40]}));
platforms.push(new BoxPlatform({size: [1.5, 1, 2], pos: [35, 134, -67]}));
platforms.push(new BoxPlatform({size: [1.5, 1, 2], pos: [55, 134, -43]}));





[[75, 134, -67],
  [95, 134, -43],
  [115, 134, -67]
].forEach(coords => {
  platforms.push(new BoxPlatform({size: [1.5, 1, 2], pos: coords,
    action: disappearingAction,
    reset: disappearingReset
  }));
});

// platforms.push(new BoxPlatform({size: [1.5, 1, 2], pos: [75, 134, -67]}));
// platforms.push(new BoxPlatform({size: [1.5, 1, 2], pos: [95, 134, -43]}));
// platforms.push(new BoxPlatform({size: [1.5, 1, 2], pos: [115, 134, -67]}));

platforms.push(new BoxPlatform({size: [1.5, 1, 2], pos: [135, 134, -43]}));



keys.push(new Key([169, 136.75, -55]));













// Add all created platforms to world/scene
platforms.forEach(platform => {
  world.addBody(platform.body);
  scene.add(platform.mesh);
});

// Add all separate cannons' pieces to world/scene as well as cannonballs
cannons.forEach(cannon => {
  scene.add(cannon.sides);
  scene.add(cannon.barrel);
  scene.add(cannon.cylinderTop);

  world.addBody(cannon.cannonball.body);
  scene.add(cannon.cannonball.mesh);
});

// Add all keys to world/scene and create collision event listener
keys.forEach(key => {
  world.addBody(key.body);
  scene.add(key.mesh);
  scene.add(key.shadow);
});

export {
  platforms,
  cannons,
  keys,

  START_POSITION,
  FALL_LIMIT,
};