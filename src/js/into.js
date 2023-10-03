const overlay = document.querySelector('.overlay')
const mainLogo = document.querySelector('.mainLogo')

export function hideOverlay() {
	overlay.classList.toggle('hideAnimation')

	setTimeout(() => {
		overlay.classList.toggle('hide')
		mainLogo.classList.add('show')
	}, 1000)
}