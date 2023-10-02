const tabs = [...document.querySelectorAll('.tabs__item')]
const content = [...document.querySelectorAll('.tabs__contentItem')]
const copyItem = document.querySelector('.tabs__contentItem_phone');
const copySuccess = document.querySelector('.copySuccess');
const modal = document.querySelector('.modal__wrapper');

const downloadButton = document.querySelector('.download')
const supportButton = document.querySelector('.support')
const supportContent = document.querySelector('.supportContent')

const paddingV = 12;
const paddingH = 24;

let activeIndex = 0;
let prevIndex = 0;
let timeout;
let isOpenSupport = false;

const heights = content.map(el => el.clientHeight)

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
	const text = copyItem.textContent.trim();
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
		tabs[0].click()
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
modal.addEventListener('click', ({target}) => target === modal ? modal.classList.remove('open') : null)