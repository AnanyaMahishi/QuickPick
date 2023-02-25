const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

client.on('message', message => {
	if(message.body === 'hi') {
		message.reply('Hello, which vendor would you like to order from today?\n(1).GJB');
	}
});

client.on('message', message => {
	if(message.body === '1') {
		message.reply('Thank you for ordering from GJB today, here is our menu\n(1)');
	}
});