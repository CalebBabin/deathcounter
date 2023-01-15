import './main.css';
import 'animate.css';
import tmi from 'tmi.js';

// a default array of twitch channels to join
let channels = ['moonmoon', 'antimattertape'];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});
if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

// create our chat instance
const client = new tmi.Client({
	options: { debug: false },
	connection: {
		reconnect: true,
		secure: true
	},
	channels: channels
});

let conditions = query_vars.whitelist ? query_vars.whitelist.split(',') : ['mod', 'subscriber', 'vip'];
conditions.push('mod', 'broadcaster');

const adminPerms = ['mod', 'moderator', 'broadcaster'];
const softWhitelist = {}
try {
	let input = JSON.parse(localStorage.getItem('whitelist'));
	for (const key in input) {
		if (Object.hasOwnProperty.call(input, key)) {
			softWhitelist[key] = input[key];
		}
	}
} catch (e) { console.log(e) }

const saveWhitelist = () => {
	try {
		localStorage.setItem('whitelist', JSON.stringify(softWhitelist));
	} catch (e) { console.log(e) }
}

const whitelistedUsers = {
	'antimattertape': true,
	'moonmoon': true,
	'je_ek': true,
}

const update = (props = {}, counter = 'default') => {
	console.log('updating', props)
	for (const key in props) {
		if (Object.hasOwnProperty.call(props, key)) {
			counters[counter][key] = props[key];
		}
	}

	let number = counters[counter].count;
	if (counter.match(/\-dup$/)) {
		number = counters[counter.replace('-dup', '')].count;
	}
	counterElements[counter].numberElement.textElement.textContent = Number(number).toLocaleString();
	counterElements[counter].wrapper.style.left = counters[counter].x + 'px';
	counterElements[counter].wrapper.style.top = counters[counter].y + 'px';
	if (String(counters[counter].count).length >= 3) {
		counterElements[counter].numberElement.style.fontSize = (counters[counter].fontSize * 0.7) + 'px';
	} else {
		counterElements[counter].numberElement.style.fontSize = counters[counter].fontSize + 'px';
	}
	counterElements[counter].numberElement.style.color = counters[counter].color;
	counterElements[counter].numberElement.style.opacity = counters[counter].hidden ? 0 : counters[counter].opacity;

	counterElements[counter].subtitleElement.textElement.textContent = counters[counter].smallText;
	counterElements[counter].subtitleElement.style.fontSize = (counters[counter].smallTextSize) + 'px';
	counterElements[counter].wrapper.style.fontFamily = counters[counter].font;
	counterElements[counter].wrapper.style.fontWeight = counters[counter].fontWeight;
	counterElements[counter].wrapper.style.textShadow = counters[counter].shadow;
	counterElements[counter].wrapper.style.filter = counters[counter].filter;


	counters[counter].name = counter.toLowerCase();
	console.log(counters[counter])

	localStorage.setItem('counter-' + counters[counter].name, JSON.stringify(counters[counter]));

	if (counters[counter + '-dup']) {
		update({}, counter + '-dup');
	}

	if (window.hasOwnProperty('twemoji')) {
		twemoji.parse(counterElements[counter].subtitleElement.textElement, {
			folder: 'svg',
			ext: '.svg',
			base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
		});
		const ghosts = counterElements[counter].subtitleElement.textElement.querySelectorAll('img[alt="👻"]');
		for (let i = 0; i < ghosts.length; i++) {
			ghosts[i].setAttribute('src', ghostURL)
		}
	}
}
import ghostURL from './ghost.svg';

const defaultSettings = {
	x: 92,
	y: 69,
	count: 0,
	fontSize: 50,
	hidden: false,
	opacity: 1,
	flashOpacity: 1,
	color: '#BBB3A3',
	flashColor: '#ff0000',
	smallText: 'deaths',
	smallTextSize: 25,
	font: "'Redressed', cursive",
	fontWeight: 'normal',
	shadow: '0px 0px 5px #000',
	filter: 'none',
}


const counters = { default: { ...defaultSettings } };
const counterElements = {};

let counterList = [];

try {
	const storedCounters = JSON.parse(localStorage.getItem('counters'));
	if (storedCounters && storedCounters.length > 0) {
		for (let i = 0; i < storedCounters.length; i++) {
			try {
				const element = JSON.parse(localStorage.getItem('counter-' + storedCounters[i]));
				counters[element.name] = { ...defaultSettings, ...element };
				counterList.push(element.name);
			} catch (e) {
				console.error(e);
			}
		}
	}
} catch (e) {
	console.log(e);
}
try {
	// load in the first "default" counter if it's using the old format
	if (!Object.hasOwnProperty.call(counters, 'default')) {
		const storedSettings = JSON.parse(localStorage.getItem('settings'));
		if (storedSettings) {
			counters['default'] = { ...defaultSettings, ...storedSettings };
		}
	}
} catch (e) {
	console.log(e);
}

const transitionDuration = 3000;
const flashDuration = 500;
let flashing = false;

const createCounter = (settings = {}, key = 'default') => {
	counters[key] = { ...defaultSettings, ...settings };
	const elements = counterElements[key] = {};

	elements.wrapper = document.createElement('div');
	elements.wrapper.classList.add('animate__animated');
	elements.numberElement = document.createElement('span');
	elements.subtitleElement = document.createElement('span');

	const makeTextElement = (element) => {
		element.textElement = document.createElement('cooltext');
		element.appendChild(element.textElement);
	}
	makeTextElement(elements.numberElement);
	makeTextElement(elements.subtitleElement);

	elements.wrapper.style.transition = `all ${transitionDuration}ms ease`;
	elements.numberElement.style.transition = `all ${transitionDuration}ms ease`;

	window.requestAnimationFrame(() => {
		document.body.appendChild(elements.wrapper);
		elements.numberElement.appendChild(elements.subtitleElement);
		elements.wrapper.appendChild(elements.numberElement);
		elements.numberElement.style.position = 'absolute';
		update({}, key);
	});

	if (counterList.indexOf(key) === -1) {
		counterList.push(key);
		localStorage.setItem('counters', JSON.stringify(counterList));
	}
};

const removeCounter = (key) => {
	delete counters[key];
	localStorage.setItem('counters', JSON.stringify(counterList));
	document.body.removeChild(counterElements[key].wrapper);
	counterList.splice(counterList.indexOf(key), 1);
	delete counterElements[key];
}

for (const key in counters) {
	if (Object.hasOwnProperty.call(counters, key)) {
		createCounter(counters[key], key);
	}
}


const flash = (counter = 'default') => {
	if (flashing) return;
	counterElements[counter].numberElement.style.transition = `all ${flashDuration}ms ease-out`;
	flashing = true;
	window.requestAnimationFrame(() => {
		counterElements[counter].numberElement.style.color = counters[counter].flashColor;
		counterElements[counter].numberElement.style.opacity = counters[counter].flashOpacity;
	})
	setTimeout(() => {
		flashing = false;
		counterElements[counter].numberElement.style.transition = `all ${transitionDuration}ms ease`;
		window.requestAnimationFrame(() => {
			counterElements[counter].numberElement.style.opacity = counters[counter].opacity;
			counterElements[counter].numberElement.style.color = counters[counter].color;
		})
	}, flashDuration);
}

const messageListener = (channel, user, message, self) => {
	const split = message.split(' ');
	let counter = 'default';

	let permission = false;
	for (let index = 0; index < conditions.length; index++) {
		if (user[conditions[index]] || (user.badges && user.badges[conditions[index]])) {
			permission = true;
			break;
		}
	}

	let adminPermission = false;
	for (let index = 0; index < adminPerms.length; index++) {
		if (user[adminPerms[index]] || (user.badges && user.badges[adminPerms[index]])) {
			adminPermission = true;
			break;
		}
	}

	if (permission || adminPermission || softWhitelist[user['display-name'].toLowerCase()] || whitelistedUsers[user['display-name'].toLowerCase()]) {

		if (split.length > 1) {
			let temp = split[0].toLowerCase();
			if (temp.substr(0, 1) === '?') temp = temp.substr(1);

			if (Object.hasOwnProperty.call(counters, temp)) {
				counter = temp;
				split.splice(0, 1);
				console.log('detected counter', counter);
			}
		}

		if (split[0].match(/^(?:\-|\+)[0-9]{1,100}(\.[0-9]{1,100})?$/) && !isNaN(Number(split[0])) && !isNaN(counters[counter].count + Number(split[0]))) {
			flash(counter);
			update({ count: counters[counter].count + Number(split[0]) }, counter);
		}
	}

	if (whitelistedUsers[user['display-name'].toLowerCase()] || adminPermission) {
		if (message === "!refresh") {
			window.location.reload();
		}
		if (split[0] === "!set") {
			let newCount = split[1];
			if (newCount && !isNaN(Number(newCount))) {
				update({ count: Number(newCount) }, counter);
			} else {
				if (defaultSettings.hasOwnProperty(split[1]) && split.length >= 3) {
					if (typeof defaultSettings[split[1]] === 'number') {
						const newNumber = Number(split[2]);
						if (!isNaN(newNumber)) {
							update({ [split[1]]: newNumber }, counter);
						}
					} else {
						let value = "";
						for (let index = 2; index < split.length; index++) {
							const element = split[index];
							value += element + " ";
						}
						value = value.trim();

						update({ [split[1]]: value }, counter);
					}
				}
			}
		}

		if (split[0] === "!move") {
			if (split.length >= 3) {
				const direction = split[1].toLowerCase();
				let distance = split[2];
				if (distance && !isNaN(Number(distance))) {
					switch (direction) {
						case 'up':
							update({ y: counters[counter].y - Number(distance) }, counter);
							break;
						case 'down':
							update({ y: counters[counter].y + Number(distance) }, counter);
							break;
						case 'left':
							update({ x: counters[counter].x - Number(distance) }, counter);
							break;
						case 'right':
							update({ x: counters[counter].x + Number(distance) }, counter);
							break;
					}
				}
			}
		}

		if (split[0] === "!moveTo") {
			if (split.length >= 3) {
				let x = split[1];
				let y = split[2];
				if (x && !isNaN(Number(x)) && y && !isNaN(Number(y))) {
					update({ x: Number(x), y: Number(y) }, counter);
				}
			}
		}

		if (split[0] === '!color' && split.length >= 2) {
			update({ color: split[1] }, counter);
		}
		if (split[0] === '!flashColor' && split.length >= 2) {
			update({ flashColor: split[1] }, counter);
		}
		if (split[0] === '!size' && split.length >= 2) {
			const size = split[1];
			if (size && !isNaN(Number(size))) {
				update({ fontSize: Number(size) }, counter);
			}
		}
		if (split[0] === '!hide') {
			update({ hidden: true }, counter);
		}
		if (split[0] === '!show') {
			update({ hidden: false }, counter);
		}
		if (split[0] === '!reset') {
			update({ ...defaultSettings, count: counters[counter].count }, counter);
			counterElements[counter].wrapper.setAttribute('class', 'animate__animated');
		}

		if (split[0] === '!animate') {
			counterElements[counter].wrapper.classList.remove(lastAnimation);
			let animation = animations[Math.floor(Math.random() * animations.length)];
			if (split.length > 1) {
				const keyword = split[1];
				for (let index = 0; index < animations.length; index++) {
					const element = animations[index];
					if (element.includes(keyword)) {
						animation = element;
						break;
					}
				}
			}
			counterElements[counter].wrapper.classList.add(animation);
			lastAnimation = animation;
		}

		if (split[0] === '!permituser' && split.length >= 2) {
			const username = split[1];
			if (username) {
				softWhitelist[username.toLowerCase()] = true;
				saveWhitelist();
			}
		}
		if (split[0] === '!permitclass' && split.length >= 2) {
			conditions.push(...split.splice(1));
		}
		if (split[0] === '!removeuser' && split.length >= 2) {
			const username = split[1];
			if (username) {
				delete softWhitelist[username.toLowerCase()];
				saveWhitelist();
			}
		}

		if (split[0] === '!addCounter') {
			if (split.length >= 2) {
				const counter = split[1];
				if (counter && !Object.hasOwnProperty.call(counters, counter)) {
					let settings = {};
					try {
						let string = "";
						for (let index = 2; index < split.length; index++) {
							string += split[index] + " ";
						}
						settings = JSON.parse(string);
					} catch (e) { }
					createCounter(settings, counter);
				}
			}
		}

		if (split[0] === '!removeCounter') {
			if (split.length >= 2) {
				const counter = split[1];
				if (counter && Object.hasOwnProperty.call(counters, counter)) {
					removeCounter(counter);
				}
			}
		}

		if (split[0] === '!listCounters') {
			const container = document.createElement('div');
			container.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; font-family: monospace; color: white; display: flex; flex-wrap: wrap;');
			for (const key in counters) {
				if (Object.hasOwnProperty.call(counters, key)) {
					const counter = counters[key];
					const element = document.createElement('div');
					element.setAttribute('style', 'display: inline-block; background-color: black; padding: 5px; margin: 5px;');
					element.innerText = `${key}: ${counter.count}`;
					container.appendChild(element);
				}
			}
			document.body.appendChild(container);
			setTimeout(() => {
				document.body.removeChild(container);
			}, 1000);
		}
		if (split[0] === '!countdown') {

			let counter = 'countdown';/*split[split.length - 1];
			if (split.length === 2) {
				if (counters['countdown']) counter = 'countdown';
				else counter = 'default';
			}*/

			if (split.length >= 2) {
				if (
					counter &&
					Object.hasOwnProperty.call(counters, counter) &&
					countdowns.indexOf(counter) < 0
				) {
					countdowns.push(counter);
					counters[counter].startingCount = Number(counters[counter].count);
				}
				if (split[1] === 'set' && countdowns.indexOf(counter) >= 0) {
					let number = Number(split[2]);
					if (Number.isNaN(number)) {
						number = 100;
					}
					counters[counter].count = number;
					counters[counter].startingCount = number;
					counterElements[counter].numberElement.textElement.textContent = number;
					if (countdowns.indexOf(counter) >= 0) countdowns.splice(countdowns.indexOf(counter), 1);
				}

				if (split[1] === 'restart' && countdowns.indexOf(counter) >= 0) {
					counters[counter].count = Number(counters[counter].startingCount);
					counterElements[counter].numberElement.textElement.textContent = counters[counter].count;
				}
				if (split[1] === 'stop') {
					if (countdowns.indexOf(counter) >= 0) countdowns.splice(countdowns.indexOf(counter), 1);
				}
			}
		}
	}
};
window.messageListener = messageListener;
client.addListener('message', messageListener);


const countdowns = [];
setInterval(() => {
	for (let index = 0; index < countdowns.length; index++) {
		const countdownKey = countdowns[index];
		if (countdownKey && counters[countdownKey]) {
			counters[countdownKey].count--;
			counterElements[countdownKey].numberElement.textElement.textContent = counters[countdownKey].count;
		}
	}
}, 1000)

const animations = [
	'none',
	'animate__hinge',
	'animate__jackInTheBox',
	'animate__animated',
	'animate__bounce',
	'animate__headShake',
	'animate__heartBeat',
	'animate__jello',
	'animate__rubberBand',
	'animate__shake',
	'animate__shakeX',
	'animate__shakeY',
	'animate__swing',
	'animate__tada',
	'animate__wobble',
	'animate__flip',
]
let lastAnimation = animations[0];

client.connect();
