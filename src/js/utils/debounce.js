export function debounce(f, ms) {

	let isCooldown = false;

	return function () {
		if (isCooldown) return;
		f.apply(this, arguments);

		isCooldown = true;
		console.log(1, isCooldown)

		setTimeout(() => isCooldown = false, ms);
	};

}