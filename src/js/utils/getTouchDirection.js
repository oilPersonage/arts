export function getTouchDirection(xDiff, yDiff) {
	let isX = false;
	let isY = false;
	if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
		isX = true;
		isY = false;
	} else {
		isX = false;
		isY = true;
	}
	return {x: isX, y: isY}
};