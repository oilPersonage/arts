export function showAnimate(elem, className = 'active', ms) {
	let timer = setTimeout(() => {
		elem.classList.add(className)
		timer = null;
	}, ms)
}