import * as THREE from 'three';
import fragment from "./shaders/fragment.glsl?raw";
import vertex from "./shaders/vertex.glsl?raw";
import {Gesture} from '@use-gesture/vanilla';
import anime from 'animejs'

const cursor = document.querySelector('.cursor')
const cursorDot = document.querySelector('.cursorDot')

import {data} from './data.js'

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {log} from "three/nodes";

const CURSOR_SIZE = 64;
const CURSOR_OFFSET = CURSOR_SIZE / 2;

setCursorSizes(CURSOR_SIZE)

const HEIGHT_CARD = 600 * 3; // 700 px
const IMAGE_ASPECT_WIDTH = 0.5625;
const SMOOTH = 0.9;
const SCROLL_FORCE = 0.0001;
const OFFSET_BETWEEN_IMG = 0.12;
const MAX_SCROLL_WIDTH = data.length - 1 + OFFSET_BETWEEN_IMG * (data.length - 1);
const CAMERA_OFFSET = 0.2;
const MOUSE_INERTIA = 0.15;
const ANIMATION_DURATION = 3000;
let VIEWPORT_WIDTH = 5;
let VIEWPORT_HEIGHT = 3;
let CAMERA_DEPTH = 2;
let PERCENT_CUR_TH = 0;
let PERCENT_CUR_TW = 0;

let camera, scene, renderer, width, height, controls, mesh, gui, raycaster, intersects, isHovered;
let sliderPosition = 0;
let sliderSpeed = 0;

const settings = {
	camera: {
		positionX: 0,
		positionY: 0,
		positionZ: 0,
	}
}

const mouse = new THREE.Vector2()
const futureMouse = new THREE.Vector2()

const dataItems = [];


imgLoading();
animate();

function imgLoading() {
	let loadImages = 0;
	data.forEach(el => {
		const {img, ...rest} = el;
		const texture = new THREE.TextureLoader().load(img)
		dataItems.push({
			...rest,
			texture
		})
		++loadImages;
		if (loadImages === data.length) {
			init();
		}
	})
}

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
	camera.position.set(0, CAMERA_OFFSET, CAMERA_DEPTH);
	camera.lookAt(0, CAMERA_OFFSET, 0);


	raycaster = new THREE.Raycaster()
	intersects = []

	scene = new THREE.Scene();

	// calculate visible view
	const vFOV = THREE.MathUtils.degToRad(camera.fov); // convert vertical fov to radians
	VIEWPORT_HEIGHT = 2 * Math.tan(vFOV / 2) * 2; // visible height
	VIEWPORT_WIDTH = VIEWPORT_HEIGHT * camera.aspect;  // visible width
	PERCENT_CUR_TH = CURSOR_OFFSET / height;
	PERCENT_CUR_TW = CURSOR_OFFSET / width;

	createMeshes()
	initGesture()

	// setDataGui()
}

function createMeshes() {
	dataItems.forEach((o, index) => {
		const {planeWidth, planeHeight} = getPlaneSize()

		const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)

		const material = new THREE.ShaderMaterial({
			uniforms: {
				uTime: {type: 'f', value: 1.0},
				uHover: {type: 'f', value: 0},
				uTexture: {type: 't', value: o.texture},
				uRatio: {value: 1 / window.devicePixelRatio},
				uResolution: {type: 'vec2', value: [height, width]},
				uOffset: {value: index},
				uMouse: {value: mouse},
				uInitOffset: {value: index},
				uOffsetBetweenImg: {value: OFFSET_BETWEEN_IMG},
				uBigSizeShow: {value: 0},
			},
			// wireframe: true,
			vertexShader: vertex,
			fragmentShader: fragment,
		})


		const {left, right, top, bottom} = calculateViewSizes(o, geometry, index);
		o.userParams = {
			initPos: index,
			initLeft: left,
			initRight: right,
			initTop: top,
			initBottom: bottom,
		}
		o.mesh = new THREE.Mesh(geometry, material);
		o.mesh.name = index;

		scene.add(o.mesh)

		// удалить для работы vertex
	})
}

function calculateViewSizes(o, geometry, index) {
	const left = index - sliderPosition;
	const {width: wP, height: hP} = geometry.parameters;
	const halfP = wP / 2;
	const initLeft = VIEWPORT_WIDTH / 2 - halfP + left;

	const hSizeInView = hP / VIEWPORT_HEIGHT;
	const halfHideView = (1 - hSizeInView) / 2;

	const offsetPercent = CAMERA_OFFSET / VIEWPORT_HEIGHT;

	const sizes = {
		left: (initLeft + OFFSET_BETWEEN_IMG * index) / VIEWPORT_WIDTH,
		right: (wP + initLeft + OFFSET_BETWEEN_IMG * index) / VIEWPORT_WIDTH,
		top: halfHideView + offsetPercent - PERCENT_CUR_TH,
		bottom: halfHideView + hSizeInView + offsetPercent + PERCENT_CUR_TH,
	}
	return sizes;
}

function initGesture() {
	const element = document.body;

	function onWheel({offset: [, y], direction: [, dy], ...rest}) {
		const next = 100 * dy * SCROLL_FORCE;

		const isRight = dy !== 1;
		const isLeftStop = sliderPosition < 0 && isRight;
		const isRightStop = sliderPosition > MAX_SCROLL_WIDTH;
		sliderSpeed = isLeftStop || isRightStop && !isRight ? 0 : sliderSpeed + next;
		sliderPosition = isLeftStop && dy === -1 ? 0 : isRightStop && dy === 1 ? MAX_SCROLL_WIDTH : sliderPosition;
	}

	const eventGesture = new Gesture(element, {
		onWheel,
		// gesture specific options
		// drag: dragOptions,
		// wheel: wheelOptions,
		// pinch: pinchOptions,
		// scroll: scrollOptions,
		// wheel: wheelOptions,
		// hover: hoverOptions,
	})
}

function getPlaneSize() {
	const h = window.innerHeight;
	const planeHeight = HEIGHT_CARD / h;
	const planeWidth = planeHeight * IMAGE_ASPECT_WIDTH;

	return {planeWidth, planeHeight};
}


// function setDataGui() {
// 	gui = new GUI();
// 	document.querySelector('#gui').append(gui.domElement);
//
// 	// const cameraFolder = gui.addFolder('Camera')
// 	// console.log(mesh)
// 	gui.add(uniforms.uHover, 'value', 0, 1, 0.01)
// 	// // cameraFolder.open()
// }

function onDocumentMouseMove(event) {
	futureMouse.set(event.clientX / renderer.domElement.clientWidth,
		event.clientY / renderer.domElement.clientHeight)
	cursorDot.style.transform = `translate(${width * futureMouse.x - 4}px, ${height * futureMouse.y - 4}px)`
}

document.addEventListener('mousemove', onDocumentMouseMove, false)

function resize() {
	const calcWidth = window.innerWidth;
	const calcHeight = window.innerHeight;
	height = calcHeight;
	width = calcWidth;

	// const {planeWidth, planeHeight} = getPlaneSize()
	camera.aspect = calcWidth / calcHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(calcWidth, calcHeight);

	PERCENT_CUR_TH = CURSOR_OFFSET / calcHeight;
	PERCENT_CUR_TW = CURSOR_OFFSET / calcWidth;
}

window.addEventListener("resize", resize);

function onClick() {
	let isShowBigImage = false;
	dataItems.forEach(el => {
		if (el.isHovered) {
			el.mesh.material.uniforms.uBigSizeShow.value = 1;
		} else {
			el.mesh.material.uniforms.uBigSizeShow.value = 0;
		}

		isShowBigImage = isHovered ? true : isShowBigImage
	})
	console.log(isShowBigImage)
}

window.addEventListener('click', onClick)

function setLimitScroll() {
	return sliderPosition < 0 || sliderPosition > MAX_SCROLL_WIDTH;
}

function setCursorSizes(size) {
	cursor.style.height = size + 'px'
	cursor.style.width = size + 'px'
}

function animate() {

	sliderPosition += sliderSpeed;
	sliderSpeed *= SMOOTH;


	const x = futureMouse.x;
	const y = futureMouse.y;
	// console.log(x, y)

	mouse.set(
		mouse.x + (x - mouse.x) * MOUSE_INERTIA,
		mouse.y + (y - mouse.y) * MOUSE_INERTIA,
	)

	cursor.style.transform = `translate(${width * mouse.x - CURSOR_OFFSET}px, ${height * mouse.y - CURSOR_OFFSET}px)`

	dataItems.forEach((el, index) => {
		const {initLeft, initRight, initPos, initBottom, initTop} = el.userParams
		
		if (!setLimitScroll()) {
			el.mesh.material.uniforms.uOffset.value = initPos - sliderPosition;
		}

		const insideX = mouse.x >= initLeft - sliderPosition / VIEWPORT_WIDTH - PERCENT_CUR_TW && mouse.x <= initRight - sliderPosition / VIEWPORT_WIDTH + PERCENT_CUR_TW;
		const insideY = mouse.y >= initTop && mouse.y <= initBottom;
		const inside = insideX && insideY;


		if (!el.isHovered && inside) {
			el.isHovered = true;
			anime({
				targets: el.mesh.material.uniforms.uHover,
				value: 1,
				duration: ANIMATION_DURATION
			})
		} else if (el.isHovered && !inside) {
			el.isHovered = false;

			anime({
				targets: el.mesh.material.uniforms.uHover,
				value: 0,
				duration: ANIMATION_DURATION
			})
		}
	})
	isHovered = dataItems.some(el => el.isHovered)

	if (isHovered && !cursorDot.classList.contains('isHovered')) {
		cursorDot.classList.add('isHovered')
	} else if (!isHovered && cursorDot.classList.contains('isHovered')) {
		cursorDot.classList.remove('isHovered')
	}
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}