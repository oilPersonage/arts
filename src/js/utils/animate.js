export function animateItem(elem, className = 'active', ms, isRemove) {
	let timer = setTimeout(() => {
		if (isRemove) {
			elem.classList.remove(className)
		} else {
			elem.classList.add(className)
		}
		timer = null;
	}, ms)
}