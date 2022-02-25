import './main.css';
import tmi from 'tmi.js'

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

conditions.push('mod');

const adminPerms = ['mod', 'moderator'];

const update = () => {
	document.body.textContent = Number(count).toLocaleString();
}

let count = 0;
update();
client.addListener('message', (channel, user, message, self) => {

	let permission = false;
	for (let index = 0; index < conditions.length; index++) {
		if (user[conditions[index]] || (user.badges && user.badges[conditions[index]])) {
			permission = true;
			break;
		}
	}

	if (permission) {
		if (message.match(/!add/i) || message.match(/^\+1/i)) {
			count++;
			update();
		} else if (message.match(/!sub/i) || message.match(/^\-1/i)) {
			count--;
			update();
		}
	}

	let adminPermission = false;
	for (let index = 0; index < adminPerms.length; index++) {
		if (user[adminPerms[index]] || (user.badges && user.badges[adminPerms[index]])) {
			adminPermission = true;
			break;
		}
	}

	if (user['display-name'].toLowerCase() === 'antimattertape' || user['display-name'].toLowerCase() === 'moonmoon' || adminPermission) {
		if (message === "!refresh") {
			window.location.reload();
		}
		if (message.match(/^!set/)) {
			let newCount = message.split(' ')[1];
			if (newCount && !isNaN(Number(newCount))) {
				count = Number(newCount);
				update();
			}
		}
	}
});

client.connect();