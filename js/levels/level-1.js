import { scene, world, gltfLoader, loadingManager, meshBodySync } from '../init.js';
import { vec3, generateCubeBody, generateCylinderBody } from './helpers.js';
import { finishLevel } from '../main.js';

let level;
let finishPlatform;

export default function() {
	console.log('loading level 1');

	gltfLoader.load('/assets/level1.glb', gltf => {
		level = gltf.scene;
		scene.add(level);
	});
	
	loadingManager.onLoad = () => {
	
		level.traverse(child => {

			if (child.isMesh) {
				
				let body;
				const size = child.geometry.boundingBox.getSize(vec3).divideScalar(2);
				const position = child.position;
				const rotation = child.rotation;
				
				if (child.name.includes('Cube')) {
						body = generateCubeBody(size, position, rotation);
						world.addBody(body);
				} else if (child.name === 'Start' || child.name === 'Finish') {
						body = generateCylinderBody(size, position);
						world.addBody(body);
				}

				if (child.name === 'Cube001') {
					finishPlatform = body;
				}
	
				child.receiveShadow = true;
			}
	
		});

		finishPlatform.addEventListener('collide', () => {
			finishLevel('level_1');
		});

	};

};