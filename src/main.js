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

let count = 0;
document.body.textContent = Number(count).toLocaleString();
client.addListener('message', (channel, user, message, self) => {
	console.log(user.subscriber, message);
	if (user.subscriber) {
		if (message.match(/!add/i)) {
			count++;
			document.body.textContent = Number(count).toLocaleString();
		} else if (message.match(/!sub/i)) {
			count--;
			document.body.textContent = Number(count).toLocaleString();
		}
	}

	if (user['display-name'].toLowerCase() === 'antimattertape' || user['display-name'].toLowerCase() === 'moonmoon' || user.mod) {
		if (message === "!refresh") {
			window.location.reload();
		}
		if (message.match(/^!set/)) {
			let newCount = message.split(' ')[1];
			if (newCount) {
				count = newCount;
				document.body.textContent = Number(count).toLocaleString();
			}
		}
	}
});

client.connect();