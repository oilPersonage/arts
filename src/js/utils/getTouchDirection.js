export function getTouchDirection(xDiff, yDiff) {
	let isX = false;
	let isY = false;
	if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
		isX = true;
	} else {
		isY = true;
	}
	return {x: isX, y: isY}
};