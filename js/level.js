import { loadingManager, gltfLoader, rgbeLoader, scene, renderer, world } from './init.js';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import * as TWEEN from 'tween';

let level;
let vec3 = new THREE.Vector3();
const platforms = {};

const generateCubeBody = (size, position) => {
    return new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z)),
        position
    });
};

const generateCylinderBody = (size, position) => {
    return new CANNON.Body({
        shape: new CANNON.Cylinder(size.x, size.x, size.y * 2),
        position
    });
};

rgbeLoader.load('/assets/dancing_hall_1k.hdr', hdr => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdr;
    // scene.background = hdr;
});

gltfLoader.load('/assets/level1-1.glb', gltf => {
    level = gltf.scene;
    scene.add(level);
});

loadingManager.onLoad = () => {
    console.log('Level Loaded');

    level.traverse(child => {
        if (child.isMesh) {
            console.log(child);
            
            let body;
            const size = child.geometry.boundingBox.getSize(vec3).divideScalar(2);
            const position = child.position;

            if (child.name.includes('Cube')) {
                body = generateCubeBody(size, position);
                world.addBody(body);
            } else if (child.name === 'Start' || child.name === 'Finish') {
                body = generateCylinderBody(size, position);
                world.addBody(body);
            }

            platforms[child.name] = { mesh: child, body };

        }

    });

    // const vec = new THREE.Vector3();
    // console.log(gltf.scene.children[1].geometry.boundingBox.getSize(vec));
    // console.log(generateCylinderBody(gltf.scene.children[1].geometry.boundingBox, gltf.scene.children[1].position));
    // const starting = generateCylinderBody(gltf.scene.children[1].geometry.boundingBox.max, gltf.scene.children[1].position);
    // world.addBody(starting);

    // platforms['Cube006'].mesh.position.y += 5;
    // let hit = false;
    // platforms['Cube006'].mesh.material.transparent = true;
    // platforms['Cube006'].body.addEventListener('collide', function() {
    //     if (!hit) {
    //         hit = true;
    //         new TWEEN.Tween({r: 1, opacity: 1})
    //         .to({r: 0, opacity: 0}, 1000)
    //         // .onStart(() => platforms['Cube006'].mesh.material.color.set(0xFF0000))
    //         .onUpdate(value => {
    //             platforms['Cube006'].mesh.material.color.setRGB(value.r, 0, 0);
    //             platforms['Cube006'].mesh.material.opacity = value.opacity;
    //         })
    //         .onComplete(() => this.collisionResponse = false)
    //         .start();
    //     }
    // });

    // platforms['Cube002'].body.velocity.y += 5;
    // new TWEEN.Tween()
};

// const body = new CANNON.Body({
//     shape: new CANNON.Box(new CANNON.Vec3(2, 0.25, 2)),
//     position: new CANNON.Vec3(3, 2, 0),
//     type: CANNON.Body.KINEMATIC
// });

// world.addBody(body);
// console.log(body);

// // Tween chain for flinging platform
// const rot = new TWEEN.Tween(body.angularVelocity)
// .to({ x: Math.PI * 4}, 0)
// .onStart(() => body.quaternion.setFromEuler(0, 0, 0));
// // .delay(2000);

// const stop = new TWEEN.Tween({})
// .to({})
// .delay(250)
// .onStart(() => body.angularVelocity.x = 0);

// rot.chain(stop);
// stop.chain(rot);

// rot.start();