import {
    loadingManager, gltfLoader, rgbeLoader,
    scene, renderer,
    world, COLLISIONGROUP_PLATFORM, COLLISIONGROUP_PLAYER, groundContactMaterial
} from './init.js';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import * as TWEEN from 'tween';

let level;
let vec3 = new THREE.Vector3();
const platforms = {};
const sync = [];

const generateCubeBody = (size, pos, rot) => {
    return new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z)),
        position: pos,
        quaternion: new CANNON.Quaternion().setFromEuler(rot.x, rot.y, rot.z),
        material: groundContactMaterial,
        collisionFilterGroup: COLLISIONGROUP_PLATFORM,
        collisionFilterMask: COLLISIONGROUP_PLAYER
    });
};

const generateCylinderBody = (size, pos) => {
    return new CANNON.Body({
        shape: new CANNON.Cylinder(size.x, size.x, size.y * 2),
        position: pos,
        material: groundContactMaterial,
        collisionFilterGroup: COLLISIONGROUP_PLATFORM,
        collisionFilterMask: COLLISIONGROUP_PLAYER
    });
};

// rgbeLoader.load('/assets/dancing_hall_1k.hdr', hdr => {
    // hdr.mapping = THREE.EquirectangularReflectionMapping;
    // scene.environment = hdr;
    // scene.background = hdr;
// });

gltfLoader.load('/assets/level2.glb', gltf => {
    level = gltf.scene;
    scene.add(level);
});

loadingManager.onLoad = () => {
    console.log('Level Loaded');

    level.traverse(child => {
        if (child.isMesh) {
            
            let body;
            const size = child.geometry.boundingBox.getSize(vec3).divideScalar(2);
            const position = child.position;
            const rotation = child.rotation;
            
            if (child.name.includes('Cube')) {
                // console.log(child);
                body = generateCubeBody(size, position, rotation);
                world.addBody(body);
            } else if (child.name === 'Start' || child.name === 'Finish') {
                body = generateCylinderBody(size, position);
                world.addBody(body);
            }

            child.receiveShadow = true;
            platforms[child.name] = { mesh: child, body };

        }

    });


    let hit = false;
    const mesh6 = platforms['Cube006'].mesh;
    const body6 = platforms['Cube006'].body;
    mesh6.material.transparent = true;
    body6.addEventListener('collide', function() {
        if (!hit) {
            hit = true;
            new TWEEN.Tween({r: 0, opacity: 1})
            .to({r: 1, opacity: 0.2}, 2000)
            // .onStart(() => platforms['Cube006'].mesh.material.color.set(0xFF0000))
            .onUpdate(value => {
                mesh6.material.color.setRGB(value.r, 0, 0);
                mesh6.material.opacity = value.opacity;
            })
            // .onComplete(() => this.collisionResponse = false)
            .onComplete(() => {
                this.type = CANNON.Body.DYNAMIC;
                this.mass = 5;
                this.updateMassProperties();
            })
            .start();
        }
    });

    const body2 = platforms['Cube002'].body;
    body2.type = CANNON.Body.KINEMATIC;

    new TWEEN.Tween({y: -10})
    .to({y: 10}, 1000)
    .onUpdate(value => {
        body2.velocity.y = value.y;
        // console.log(body2.velocity.y.toFixed(2));
    })
    // .onRepeat(() => body2.position.y = 0)
    // .onRepeat(() => )
    .yoyo(true)
    .repeat(Infinity)
    .start();

    sync.push(platforms['Cube002']);
    sync.push(platforms['Cube006']);

};

export {
    sync
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