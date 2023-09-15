import * as THREE from 'three';
import fragment from "./shaders/fragment.glsl?raw";
import vertex from "./shaders/vertex.glsl?raw";
import {GUI} from "dat.gui";
import anime from 'animejs'

import {data} from './data.js'

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

window.THREEJS = THREE;
const HEIGHT_CARD = 900 * 2; // 700 px
const IMAGE_ASPECT_WIDTH = 0.5625;

let camera, scene, renderer, width, height, controls, mesh, gui, raycaster, intersects, intersectedObject;

const settings = {
	camera: {
		positionX: 0,
		positionY: 0,
		positionZ: 0,
	}
}

const mouse = new THREE.Vector2()
let uniforms = {
	uTime: {type: 'f', value: 1.0},
	uHover: {type: 'f', value: 0},
};

const dataItem = data[0];

init();
animate();

function init() {
	width = window.innerWidth;
	height = window.innerHeight;

	const container = document.getElementById('container');

	renderer = new THREE.WebGLRenderer({
		precision: 'highp',
		antialias: true,
		powerPreference: 'high-performance'
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 0.2, 2);
	camera.lookAt(0, 0.2, 0);


	raycaster = new THREE.Raycaster()
	intersects = []

	scene = new THREE.Scene();

	imgLoading()

	setDataGui()
}

function getPlaneSize() {
	const h = window.innerHeight;
	const planeHeight = HEIGHT_CARD / h;
	const planeWidth = planeHeight * IMAGE_ASPECT_WIDTH; // коффициент стандартной ширины и ширины браузера 0.2

	return {planeWidth, planeHeight};
}

function imgLoading() {
	const texture = new THREE.TextureLoader().load(dataItem.img)

	const {planeWidth, planeHeight} = getPlaneSize()

	const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 10, 10)
	geometry.position = new THREE.Vector3(1, 0, 1)

	uniforms.uTexture = {type: 't', value: texture};
	uniforms.uRatio = {value: 1 / window.devicePixelRatio}

	// uniforms.uResolution = new THREE.Vector4(width, height, a1, 1);

	const material = new THREE.ShaderMaterial({
		uniforms: {
			...uniforms
		},
		// wireframe: true,
		vertexShader: vertex,
		fragmentShader: fragment,
	})

	mesh = new THREE.Mesh(geometry, material)

	scene.add(mesh)
}

function setDataGui() {
	gui = new GUI();
	document.querySelector('#gui').append(gui.domElement);

	// const cameraFolder = gui.addFolder('Camera')
	// console.log(mesh)
	gui.add(uniforms.uHover, 'value', 0, 1, 0.01)
	// // cameraFolder.open()
}

function onDocumentMouseMove(event) {
	mouse.set(
		(event.clientX / renderer.domElement.clientWidth) * 2 - 1,
		-(event.clientY / renderer.domElement.clientHeight) * 2 + 1
	)
	if (intersects.length > 0) {
		intersectedObject = intersects[0].object
	} else {
		intersectedObject = null
	}

	if (intersectedObject && intersectedObject.name === mesh.name) {
		if (!mesh.isHover) {
			console.log(1)
			mesh.isHover = true;
			anime({
				targets: uniforms.uHover,
				value: 1
			})
		}
	} else {

		if (mesh.isHover) {
			console.log(2)
			mesh.isHover = false
			anime({
				targets: uniforms.uHover,
				value: 0
			})
		}
	}

	raycaster.setFromCamera(mouse, camera)
	intersects = raycaster.intersectObjects([...scene.children]);
}

document.addEventListener('mousemove', onDocumentMouseMove, false)

function resize() {
	const calcWidth = window.innerWidth;
	const calcHeight = window.innerHeight;

	// const {planeWidth, planeHeight} = getPlaneSize()
	camera.aspect = calcWidth / calcHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(calcWidth, calcHeight);
}

window.addEventListener("resize", resize);

function animate() {

	// controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	uniforms.uTime.value = performance.now() / 1000;

	renderer.render(scene, camera);

	requestAnimationFrame(animate);
}