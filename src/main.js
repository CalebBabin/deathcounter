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

const wrapper = document.createElement('div');
wrapper.classList.add('animate__animated');
const numberElement = document.createElement('span');

document.addEventListener('DOMContentLoaded', () => {
	document.body.appendChild(wrapper);
	wrapper.appendChild(numberElement);
	numberElement.style.position = 'absolute';
	update({});
});

const update = (props) => {
	console.log('updating', props)
	for (const key in props) {
		if (Object.hasOwnProperty.call(props, key)) {
			settings[key] = props[key];
		}
	}
	localStorage.setItem('settings', JSON.stringify(settings));
	numberElement.textContent = Number(settings.count).toLocaleString();
	wrapper.style.left = settings.x + 'px';
	wrapper.style.top = settings.y + 'px';
	numberElement.style.fontSize = settings.fontSize + 'px';
	numberElement.style.color = settings.color;
	numberElement.style.opacity = settings.opacity;
	console.log(settings)
}


const defaultSettings = {
	x: 60,
	y: 25,
	count: 38,
	fontSize: 50,
	opacity: 1,
	color: '#BBB3A3',
	flashColor: '#ff0000',
}
let settings = { ...defaultSettings };

try {
	const storedSettings = JSON.parse(localStorage.getItem('settings'));
	if (storedSettings) {
		settings = { ...settings, ...storedSettings };
	}
} catch (e) {
	console.log(e);
}
update({});


const transitionDuration = 3000;
const flashDuration = 500;
wrapper.style.transition = `all ${transitionDuration}ms ease`;
numberElement.style.transition = `all ${transitionDuration}ms ease`;

let flashing = false;
const flash = () => {
	if (flashing) return;
	numberElement.style.transition = `all ${flashDuration}ms ease-out`;
	flashing = true;
	window.requestAnimationFrame(() => {
		numberElement.style.color = settings.flashColor;
	})
	setTimeout(() => {
		flashing = false;
		numberElement.style.transition = `all ${transitionDuration}ms ease`;
		window.requestAnimationFrame(() => {
			numberElement.style.color = settings.color;
		})
	}, flashDuration);
}

client.addListener('message', (channel, user, message, self) => {
	const split = message.split(' ');

	let permission = false;
	for (let index = 0; index < conditions.length; index++) {
		if (user[conditions[index]] || (user.badges && user.badges[conditions[index]])) {
			permission = true;
			break;
		}
	}

	if (permission) {
		if (message.match(/!add/i) || message.match(/^\+1/i)) {
			flash();
			update({ count: settings.count + 1 });
		} else if (message.match(/!sub/i) || message.match(/^\-1/i)) {
			flash();
			update({ count: settings.count - 1 });
		}
	}

	let adminPermission = false;
	for (let index = 0; index < adminPerms.length; index++) {
		if (user[adminPerms[index]] || (user.badges && user.badges[adminPerms[index]])) {
			adminPermission = true;
			break;
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
				update({ count: Number(newCount) });
			}
		}

		if (split[0] === "!move") {
			if (split.length >= 3) {
				const direction = split[1].toLowerCase();
				let distance = split[2];
				if (distance && !isNaN(Number(distance))) {
					switch (direction) {
						case 'up':
							update({ y: settings.y - Number(distance) });
							break;
						case 'down':
							update({ y: settings.y + Number(distance) });
							break;
						case 'left':
							update({ x: settings.x - Number(distance) });
							break;
						case 'right':
							update({ x: settings.x + Number(distance) });
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
					update({ x: Number(x), y: Number(y) });
				}
			}
		}

		if (split[0] === '!color' && split.length >= 2) {
			update({ color: split[1] });
		}
		if (split[0] === '!flashColor' && split.length >= 2) {
			update({ flashColor: split[1] });
		}
		if (split[0] === '!size' && split.length >= 2) {
			const size = split[1];
			if (size && !isNaN(Number(size))) {
				update({ fontSize: Number(size) });
			}
		}
		if (split[0] === '!hide') {
			update({ opacity: 0 });
		}
		if (split[0] === '!show') {
			update({ opacity: 1 });
		}
		if (split[0] === '!reset') {
			update({ ...defaultSettings, count: settings.count });
			wrapper.setAttribute('class', 'animate__animated');
		}

		if (split[0] === '!animate') {
			wrapper.classList.remove(lastAnimation);
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
			wrapper.classList.add(animation);
			lastAnimation = animation;
		}
	}
});


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
]
let lastAnimation = animations[0];

client.connect();