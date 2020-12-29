module.exports = class App {

	constructor(config) {
		this.token = config.BOT_TOKEN;
		this.prefix = config.BOT_PREFIX;
		this.username = config.BOT_USERNAME;
		this.avatar = config.BOT_AVATAR;
		this.channelID = config.BOT_CHANNEL;
		this.host = config.SOCKET_HOST;
		this.port = config.SOCKET_PORT;
		this.sockets = [];
		this.bot_data = [];
	}

	run() {
		this.setupDiscord();
		this.setupSocketServer();
	}

	setupDiscord() {
		const Discord = require("discord.js");
		this.client = new Discord.Client();
		this.client.login(this.token);
		const prefix = this.prefix;
		var that = this;

		this.client.on('ready', () => {
			console.log(`[discord] Logged in as ${this.client.user.tag}!`);
		});

		this.client.on("message", function (message) {

			if (message.author.bot) return;
			if (!message.content.startsWith(prefix)) return;

			const commandBody = message.content.slice(prefix.length);
			const args = commandBody.trim().split(/ +/g);
			const command = args[0].toLowerCase();

			let ID = args[1];
			if (typeof ID === 'undefined' || ID === null) ID = "all";

			let msg = "";
			switch (command) {
				case 'ping':
					const timeTaken = Date.now() - message.createdTimestamp;
					message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
					break;
				case 'info':
					let bot_data_list = that.getBotInfoList();

					if (typeof bot_data_list === 'undefined' || bot_data_list === null || bot_data_list.length <= 0) {
						msg += "Sorry, there is no Bot data Avaliable";
						message.reply(msg);
						return;
					}

					msg += '```\n';
					let sprintf = require("sprintf-js").sprintf;
					msg += sprintf('%-10s %-24s %-7s %-10s %-16s\n', 'AccountID', 'Name', 'lvl', 'zeny', 'location');
					for (let index = 0; index < bot_data_list.length; ++index) {
						msg += sprintf('%-10s %-24s %-7s %-10s %-16s\n', `${bot_data_list[index].accountID}`, `${bot_data_list[index].name}`, `${bot_data_list[index].lv}/${bot_data_list[index].lv_job}`, `${bot_data_list[index].zeny}z`, `${bot_data_list[index].location}`);
					}
					msg += '```\n';
					message.reply(msg)
					break;
				case 'quit':
					that.sendOpenkoreMessage(that.busMessage.serialize('DISCORD_QUIT', { ID: ID }));
					message.reply(`Quit Command Sended Successfully to: ${ID}`);
					break;
				case 'relog':
					let time = args[2];
					(typeof time === 'undefined' || time === null) ? time = 600 : time = time;
					that.sendOpenkoreMessage(that.busMessage.serialize('DISCORD_RELOG', { ID: ID, time: time }));
					message.reply(`Relog Command Sended Successfully to: ${ID} in ${time} seconds...`);
					break;
				case 'pm':
					if (typeof args[2] === 'undefined' || args[2] === null || typeof args[3] === 'undefined' || args[3] === null) {
						message.reply(`pm command error (from, to or message not defined)`);
						return;
					}
					that.sendOpenkoreMessage(that.busMessage.serialize('DISCORD_PM', { ID: ID, to: args[2], message: args[3] }));
					message.reply(`PM Command Sended Successfully to: ${ID}`);
					break;
				case 'channel':
					const fs = require('fs');
					const file = require('../conf/config.json');

					file.BOT_CHANNEL = message.channel.id;

					fs.writeFile('./conf/config.json', JSON.stringify(file, null, 4), function writeJSON(err) {
						if (err) return console.log(err);
					});

					message.reply(`Current Channel ID is: ${message.channel.id} and is defined by default to send messages`);
					break;
				case 'h':
					msg = "```Usage: \n !channel: Show the ID and define the current channel as default to send messages\n !info : Show information about all connected bots. \n !quit <all/username/accountID> : Send Quit command to specific bot, if not defined send to all. \n !relog <all/username/accountID> <time>: Send relog command to specific bot, if not defined send to all. \n !pm <from/all> <to> <message>: Send PM command to bot. \n```";
					message.reply(msg);
					break;
				default:
					message.reply(`Sorry, unknown command \`!${command}\``);
			}
		});
	}

	setupSocketServer() {
		const net = require('net');
		const server = net.createServer();
		const BusMessage = require("./Utils/BusMessage.js");
		this.busMessage = new BusMessage();

		var current_id = 0;

		server.listen(this.port, this.host, () => {
			console.log(`[socket] TCP server listening on %j`, server.address());
		})

		server.on('connection', (socket) => {
			let varclientAddress = `${socket.remoteAddress}:${socket.remotePort}`;

			console.log(`[socket] New client connected: ${varclientAddress} \t ID: ${current_id}`);

			socket.current_id = current_id;

			socket.write(this.busMessage.serialize('HELLO', { yourID: socket.current_id }));

			this.sockets.push(socket);
			current_id++;

			socket.on('data', (data) => {
				let message = JSON.parse(this.busMessage.unserialize(data));
				let discord_message;

				if (message.info.accountID) {
					this.addBotInfo(message);
					//console.log(`[socket] Received ${message.MID} from ${message.info.accountID}:${message.info.name}`);
				}

				switch (message.MID) {
					case 'BOT_DISCORD_PM':
						discord_message = `Received PM: \nFrom: \`${message.info.from}\` \t To: \`${message.info.to}\`\nMessage: \`${message.info.message}\`  `;
					case 'BOT_INFO':
						//discord_message = `Received Data from: ${message.info.accountID} : ${message.info.name}`;
						break;
					case 'BOT_BASE_LEVEL_CHANGED':
						discord_message = `${message.info.accountID} : ${message.info.name} is now at Base lvl: ${message.info.lv}`;
						break;
					case 'BOT_JOB_LEVEL_CHANGED':
						discord_message = `${message.info.accountID} : ${message.info.name} is now at Job lvl: ${message.info.lv_job}`;
						break;
					case 'BOT_DIED':
						discord_message = `${message.info.accountID} : ${message.info.name} DIED at ${message.info.location}`;
						break;
					case 'BOT_DISCONNECTED':
						discord_message = `${message.info.accountID} : ${message.info.name} DISCONNECTED from server`;
						break;
					case 'HELLO':
						break;
					default:
						console.log(`[socket] Unknown MID received (${message.MID})`);
				}
				if (typeof discord_message === 'undefined' || discord_message === null || discord_message.length <= 0) return;
				this.sendDiscordMessage(discord_message);
			})

			socket.on('close', (data) => {
				let index = this.sockets.findIndex((o) => {
					return o.remoteAddress === socket.remoteAddress && o.remotePort === socket.remotePort
				})
				if (index !== -1) {
					console.log(`[socket] client disconnect ${varclientAddress}`)
					this.sockets.splice(index, 1)
				}

			})

			socket.on('error', (err) => {
				console.log(`[socket] ${err}`);
			})
		})
	}

	addBotInfo(message) {
		for (let index = 0; index < this.bot_data.length; ++index) {
			if (message.info.accountID == this.bot_data[index].accountID) {
				this.bot_data[index] = message.info;
				return;
			}
		}
		this.bot_data.push(message.info);
	}

	getBotInfoList() {
		return this.bot_data;
	}

	sendDiscordMessage(message) {
		if (this.client) {
			this.client.channels.fetch(this.channelID)
				.then(channel => {
					channel.send(message);
				})
				.catch(err => {
					console.log(err.message);
				})
		}
	}

	sendOpenkoreMessage(message) {
		this.sockets.forEach((client) => {
			client.write(message);
		});
	}
}

