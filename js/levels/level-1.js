import { PATH, scene, world, gltfLoader, meshBodySync } from '../init.js';
import {
	vec3,
	generateCubeBody,
	generateCylinderBody,
	addDisappearOnCollision,
	addSlipOnCollision,
	addFinishLevelOnCollision
} from './helpers.js';
import * as TWEEN from 'tween';

export default function() {

	gltfLoader.load(PATH + 'assets/level-1.glb', gltf => {

		const platforms = {};
		const level = gltf.scene;
		scene.add(level);

		level.traverse(child => {
			if (child.isMesh) {
				
				let body;
				const size = child.geometry.boundingBox.getSize(vec3).divideScalar(2);
				const position = child.position;
				const rotation = child.rotation;
				
				if (child.name.includes('Cube') || child.name === 'Flag_Pole') {

						body = generateCubeBody(size, position, rotation);
						world.addBody(body);

				} else if (child.name === 'Start' || child.name === 'Finish') {

						body = generateCylinderBody(size, position);
						world.addBody(body);

				}
	
				child.receiveShadow = true;
				platforms[child.name] = { mesh: child, body};
			}
	
		});


		const flingBody = platforms['Cube_Fling_Back'].body;
		const flingMesh = platforms['Cube_Fling_Back'].mesh;
		flingBody.type = 4;
		let flingActive = false;

		const whiteToGreen = new TWEEN.Tween(flingMesh.material.color).to({r: 1, g: 1, b: 0}, 1000).onComplete(() => flingBody.angularVelocity.x = Math.PI * 2);
		const stopRotation = new TWEEN.Tween(flingBody.angularVelocity).to({x: 0}, 0).delay(495).onComplete(() => flingBody.quaternion.setFromEuler(0, 0, 0));
		const greenToWhite = new TWEEN.Tween(flingMesh.material.color).to({r: 0.8, g: 0.8, b: 0.8}, 1000).delay(495).onComplete(() => flingActive = false);
		whiteToGreen.chain(stopRotation);
		stopRotation.chain(greenToWhite);

		meshBodySync.push(platforms['Cube_Fling_Back']);

		world.addEventListener('preStep', event => {

			event.target.contacts.forEach(contact => {
				if (contact.bj === flingBody && !flingActive) {
					flingActive = true;
					whiteToGreen.start();
				}
			});

		});

		

		addSlipOnCollision(platforms['Cube_Slip']);

		addDisappearOnCollision(platforms['Cube_Disappear']);

		addFinishLevelOnCollision(platforms['Flag_Pole'], 'level_1');


		const group = level.getObjectByName('Scene');
		console.log('Group:', group.children);

		console.log('Platforms:', platforms);

		console.log('MeshBodySync:', meshBodySync);
	});


};