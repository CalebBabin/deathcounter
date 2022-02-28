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

const adminPerms = ['mod', 'moderator'];
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

	counterElements[counter].numberElement.textElement.textContent = Number(counters[counter].count).toLocaleString();
	counterElements[counter].wrapper.style.left = counters[counter].x + 'px';
	counterElements[counter].wrapper.style.top = counters[counter].y + 'px';
	if (String(counters[counter].count).length >= 3) {
		counterElements[counter].numberElement.style.fontSize = (counters[counter].fontSize * 0.7) + 'px';
	} else {
		counterElements[counter].numberElement.style.fontSize = counters[counter].fontSize + 'px';
	}
	counterElements[counter].numberElement.style.color = counters[counter].color;
	counterElements[counter].numberElement.style.opacity = counters[counter].opacity;

	counterElements[counter].subtitleElement.textElement.textContent = counters[counter].smallText;
	counterElements[counter].subtitleElement.style.fontSize = (counters[counter].smallTextSize) + 'px';
	counterElements[counter].wrapper.style.fontFamily = counters[counter].font;
	counterElements[counter].wrapper.style.fontWeight = counters[counter].fontWeight;


	counters[counter].name = counter.toLowerCase();
	console.log(counters[counter])

	localStorage.setItem('counter-' + counters[counter].name, JSON.stringify(counters[counter]));
}


const defaultSettings = {
	x: 92,
	y: 69,
	count: 0,
	fontSize: 50,
	opacity: 1,
	color: '#BBB3A3',
	flashColor: '#ff0000',
	smallText: 'deaths',
	smallTextSize: 25,
	font: "'Redressed', cursive",
	fontWeight: 'normal',
}


const counters = {};
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
	document.body.removeChild(counterElements[key].wrapper);
	counterList.splice(counterList.indexOf(key), 1);
	localStorage.setItem('counters', JSON.stringify(counterList));
	delete counters[key];
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
	})
	setTimeout(() => {
		flashing = false;
		counterElements[counter].numberElement.style.transition = `all ${transitionDuration}ms ease`;
		window.requestAnimationFrame(() => {
			counterElements[counter].numberElement.style.color = counters[counter].color;
		})
	}, flashDuration);
}

const messageListener = (channel, user, message, self) => {
	const split = message.split(' ');

	let counter = 'default';
	if (split.length > 1) {
		let temp = split[0].toLowerCase();
		if (Object.hasOwnProperty.call(counters, temp)) {
			counter = temp;
			split.splice(0, 1);
			console.log('detected counter', counter);
		}
	}

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

	if (permission || adminPermission || whitelistedUsers[user['display-name'].toLowerCase()]) {
		if (split[0].match(/^!add/i) || split[0].match(/^\+1/i)) {
			flash(counter);
			update({ count: counters[counter].count + 1 }, counter);
		} else if (split[0].match(/^!sub/i) || split[0].match(/^\-1/i)) {
			flash(counter);
			update({ count: counters[counter].count - 1 }, counter);
		}
	}

	if (whitelistedUsers[user['display-name'].toLowerCase()] || adminPermission) {
		if (message === "!refresh") {
			window.location.reload();
		}
		if (split[0] === "!set") {
			let newCount = split[1];
			if (newCount && !isNaN(Number(newCount))) {
				flash();
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
			update({ opacity: 0 }, counter);
		}
		if (split[0] === '!show') {
			update({ opacity: 1 }, counter);
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
	}
};
window.messageListener = messageListener;
client.addListener('message', messageListener);


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