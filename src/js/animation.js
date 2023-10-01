import * as THREE from 'three';
import fragment from "./shaders/fragment.glsl?raw";
import vertex from "./shaders/vertex.glsl?raw";
import {WheelGesture} from '@use-gesture/vanilla';
import anime from 'animejs'

const cursor = document.querySelector('.cursor')
const cursorDot = document.querySelector('.cursorDot')

import {data} from './data.js'
import {getTouchDirection} from "./utils/getTouchDirection.js";
import {log} from "three/nodes";

const CURSOR_SIZE = 64;
const CURSOR_OFFSET = CURSOR_SIZE / 2;
const touchStart = {
	value: true,
	x: 0,
}

setCursorSizes(CURSOR_SIZE)

const IMAGE_ASPECT_WIDTH = 0.5625;
const SMOOTH = 0.9;
const SCROLL_FORCE = 0.00015;
const MOUSE_INERTIA = 0.15;
const PARALLAX_FORCE = 0.1;
let OFFSET_BETWEEN_IMG = 0.12;
let HEIGHT_CARD = 600 * 3; // 700 px
let CAMERA_OFFSET = 0.2;
let VIEWPORT_WIDTH = 5;
let VIEWPORT_HEIGHT = 3;
let CAMERA_DEPTH = 2;
let PERCENT_CUR_TH = 0;
let PERCENT_CUR_TW = 0;
let TOUCH_FUNCTION_CALLS = 0;
let MAX_SCROLL_WIDTH = calculateMaxScrollWidth();

let camera, scene, renderer, width, height, controls, mesh, gui, raycaster, intersects, isHovered;
const container = document.getElementById('container');
let isMobile = window.matchMedia('(max-width: 600px)').matches

let sliderPosition = 0;
let sliderSpeed = 0;

const mouse = new THREE.Vector2()
const futureMouse = new THREE.Vector2()

const dataItems = [];

imgLoading();
animate();

function calculateMaxScrollWidth() {
	return data.length - 1 + OFFSET_BETWEEN_IMG * (data.length - 1);
}

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

	renderer = new THREE.WebGLRenderer({
		precision: 'highp',
		antialias: true,
		powerPreference: 'high-performance'
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);


	if (isMobile) {
		HEIGHT_CARD = 500 * 3;
		CAMERA_OFFSET = 0.1;
		OFFSET_BETWEEN_IMG = 0.08;
		MAX_SCROLL_WIDTH = calculateMaxScrollWidth()
	}

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
				uParallaxOffset: {value: 0},
				uParallaxForce: {value: PARALLAX_FORCE},
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
		top: halfHideView + offsetPercent,
		bottom: halfHideView + hSizeInView + offsetPercent,
	}
	return sizes;
}


function initGesture() {
	const element = document.body;

	function onWheel({offset: [, y], direction: [dx, dy], ...rest}) {
		const next = 100 * dy * SCROLL_FORCE;
		sliderSpeed = isStopScrolling(dy) ? 0 : sliderSpeed + next;
	}

	new WheelGesture(element, onWheel)
}

function getPlaneSize() {
	const h = window.innerHeight;
	const planeHeight = HEIGHT_CARD / h;
	const planeWidth = planeHeight * IMAGE_ASPECT_WIDTH;

	return {planeWidth, planeHeight};
}

function onDocumentMouseMove(event) {
	futureMouse.set(event.clientX / renderer.domElement.clientWidth,
		event.clientY / renderer.domElement.clientHeight)
	cursorDot.style.transform = `translate(${width * futureMouse.x - 4}px, ${height * futureMouse.y - 4}px)`
}


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

function onClick() {

	// костыль, что бы он hover in animate успел поставить el.isHovered
	setTimeout(() => {
		dataItems.forEach((el, index) => {
			if (el.isHovered) {
				const link = document.createElement('a')
				link.download = `lirules_${index}`
				link.setAttribute('target', '_blank')

				link.href = el.texture.source.data.src;
				link.click()
			}
		})
	}, 100)
}

document.addEventListener('mousemove', onDocumentMouseMove, false)
window.addEventListener("resize", resize);
container.querySelector('canvas').addEventListener("click", onClick);

function limitScroll() {
	return sliderPosition < 0 || sliderPosition > MAX_SCROLL_WIDTH;
}

function setCursorSizes(size) {
	cursor.style.height = size + 'px'
	cursor.style.width = size + 'px'
}


function clamp(val, min = 0, max = MAX_SCROLL_WIDTH) {
	return Math.min(Math.max(val, min), max)
}

function animate() {

	sliderPosition = clamp(sliderPosition + sliderSpeed);
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
		const uOffset = initPos - sliderPosition
		const scrollWidth = dataItems.length - 1 + OFFSET_BETWEEN_IMG * (dataItems.length - 1)

		if (!limitScroll()) {
			el.mesh.material.uniforms.uOffset.value = uOffset;
			el.mesh.material.uniforms.uParallaxOffset.value = uOffset / scrollWidth * PARALLAX_FORCE;
		}

		const insideX = futureMouse.x >= initLeft - sliderPosition / VIEWPORT_WIDTH && futureMouse.x <= initRight - sliderPosition / VIEWPORT_WIDTH;
		const insideY = futureMouse.y >= initTop && futureMouse.y <= initBottom;
		const inside = insideX && insideY;


		if (!el.isHovered && inside) {
			el.isHovered = true;
		} else if (el.isHovered && !inside) {
			el.isHovered = false;
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

function isStopScrolling(direction) {
	const isRight = direction !== 1;
	const isLeftStop = sliderPosition < 0 && isRight;
	const isRightStop = sliderPosition > MAX_SCROLL_WIDTH;
	return isLeftStop || isRightStop && !isRight
}

container.addEventListener('touchstart', ({touches}) => {
	const event = touches[0];
	touchStart.x = sliderPosition + event.pageX / width;
	touchStart.y = sliderPosition + event.pageY / width;
	touchStart.nativeX = event.clientX;
	touchStart.nativeY = event.clientY;
	touchStart.prevX = event.clientX / width;
	touchStart.sliderInitPosition = sliderPosition;
})

function setTouchSpeed(event) {
	const normX = event.clientX / width; // 0-1 расстояние движения
	let diffX = Math.abs(Math.abs(touchStart.prevX) - Math.abs(normX));
	diffX = clamp(diffX, -1, 1) * 15;

	const dx = event.clientX / width > touchStart.prevX ? -1 : 1;
	const next = 100 * dx * SCROLL_FORCE * diffX || 0;

	sliderSpeed = isStopScrolling(dx) ? 0 : sliderSpeed + next;

	touchStart.prevX = event.clientX / width;
}

container.addEventListener('touchmove', (ev) => {
	ev.preventDefault();
	ev.stopImmediatePropagation();
	const {touches} = ev;
	const event = touches[0];
	onDocumentMouseMove(event)
	const {x: isDirX} = getTouchDirection(event.clientX - touchStart.nativeX, event.clientY - touchStart.nativeY);
	// if (TOUCH_FUNCTION_CALLS > 15) return;
	// ++TOUCH_FUNCTION_CALLS;
	if (isDirX) {
		setTouchSpeed(event)
	}
}, {passive: false})
