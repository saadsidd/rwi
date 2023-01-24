import { PATH, scene, world, gltfLoader, meshBodySync } from '../init.js';
import { vec3, generateCubeBody, generateCylinderBody } from './helpers.js';

export default function() {

	gltfLoader.load(PATH + 'assets/level3.glb', gltf => {

		const platforms = {};
		const level = gltf.scene;
		scene.add(level);

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
	
				child.receiveShadow = true;
			}
	
		});

	});

};