import {animateItem} from "./utils/animate.js";

const tabs = [...document.querySelectorAll('.tabs__item')]
const content = [...document.querySelectorAll('.tabs__contentItem')]
const copyText = document.querySelector('.tabs__contentItem_phone p');
const copyItem = document.querySelector('.tabs__contentItem_phone');

const copySuccess = document.querySelector('.copySuccess');
const modalWrapper = document.querySelector('.modal__wrapper');
const modal = document.querySelector('.modal');

const downloadButton = document.querySelector('.download')
const supportButton = document.querySelector('.support')
const supportContent = document.querySelector('.supportContent')

const paddingV = 12;
const paddingH = 24;

let activeIndex = 0;
let prevIndex = 0;
let timeout;
let isOpenSupport = false;

let isMobile = window.matchMedia('(max-width: 600px)').matches
const heights = content.map(el => el.clientHeight);

export function showModalFn() {
	modalWrapper.classList.add('open')
	animateItem(modal, 'show', 100)
}

export function hideModalFn() {
	modal.classList.add('hide')
	modalWrapper.classList.add('hide')
	animateItem(modalWrapper, 'open', 300, 'remove')
	animateItem(modalWrapper, 'hide', 300, 'remove')
	animateItem(modal, 'hide', 300, 'remove')
	animateItem(modal, 'show', 300, 'remove')
}

function setStyle() {
	const currentContent = content[activeIndex]
	currentContent.classList.add('active')
	currentContent.style.maxHeight = heights[activeIndex] + paddingV * 2 + 'px'
	currentContent.style.padding = `${paddingV}px ${paddingH}px`
}

function removeStyle() {
	const currentContent = content[prevIndex]
	currentContent.classList.remove('active')
	tabs[prevIndex].classList.remove('active')

	currentContent.style.maxHeight = '0px'
	currentContent.style.padding = `0px ${paddingH}px`
}

function initStyle() {
	tabs.forEach(el => el.classList.remove('active'))
	content.forEach(el => {
		el.classList.remove('active')
		el.style.maxHeight = '0px'
		el.style.padding = `0px ${paddingH}px`
	})
}

function onClick({target}) {
	supportContent.style.maxHeight = '500px'
	const dataName = target.getAttribute('data-tab');
	activeIndex = content.findIndex(el => el.getAttribute('data-tabContent') === dataName)
	removeStyle()
	setStyle()

	target.classList.add('active')
	prevIndex = activeIndex;
}

tabs.forEach(el => el.addEventListener('click', onClick))

copyItem.addEventListener('click', function () {
	const text = copyText.textContent.replace(/ |-/g, '');
	navigator.clipboard.writeText(text)
		.then(() => {
			copySuccess.classList.add('active');
			if (timeout) return;
			timeout = setTimeout(() => {
				timeout = null;
				copySuccess.classList.remove('active')
			}, 1000)
			// Получилось!
		})
		.catch(err => {
			console.log('Something went wrong', err);
		});
})

function supportClick() {

	supportButton.classList.toggle('open')
	supportContent.classList.toggle('open')

	if (!isOpenSupport) {
		isOpenSupport = true;
		supportContent.style.maxHeight = '156px'
		if (isMobile) {
			tabs[1].click()
		} else {
			tabs[0].click()
		}
		supportButton.innerHTML = 'Передумал'
	} else {
		isOpenSupport = false;
		supportContent.style.maxHeight = '0px'
		supportButton.innerHTML = 'Поддержать автора'
	}
}


supportContent.style.maxHeight = '0px'
initStyle()

supportButton.addEventListener('click', supportClick)
downloadButton.addEventListener('click', () => window.downloadFn())
modalWrapper.addEventListener('click', ({target}) => target === modalWrapper ? hideModalFn() : null)