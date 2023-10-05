import {animateItem} from "./utils/animate.js";

const overlay = document.querySelector('.overlay')
const headerLogo = document.querySelector('.headerLogo')
const overlayLogo = document.querySelector('.overlay__logotype')
const heading = document.querySelector('.heading')
const downloadHelpText = document.querySelector('.description')

const DEF_TIMEOUT = 300;

export function hideOverlay() {
	overlay.classList.toggle('hideAnimation')
	animateItem(overlayLogo, 'hide', 0)

	setTimeout(() => {
		overlay.classList.toggle('hide')
	}, DEF_TIMEOUT)

	animateItem(headerLogo, 'show', DEF_TIMEOUT + 200)
	animateItem(heading, 'show', DEF_TIMEOUT + 600)
	animateItem(downloadHelpText, 'show', DEF_TIMEOUT + 600)
}