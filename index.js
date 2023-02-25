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
		message.reply('Hello, which vendor would you like to order from today? (pick number) \n\n(1) GJB');
		client.on('message', message => {
			if(message.body === '1') {
				message.reply('Thank you for ordering from GJB today, here is our menu\n(1) Masala dosa\n(2) Idli\n(3) Chole Bhature');
				client.on('message', message => {

					// Client enters numerical values, push the respective items to db and ask for srn and push that too
				})
			}
		});
	}
});
