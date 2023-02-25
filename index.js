const qrcode = require('qrcode-terminal');

const { Client, RemoteAuth } = require('whatsapp-web.js');
const client = new Client();

const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');



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

					cont = 1;
					foodOrder = new Array();
					
					while(cont)
					{
					
						if(message.body == '1')
						{
							foodOrder.push('Masala Dosa');
						}
						if(message.body == '2')
						{
							foodOrder.push('Idli');
						}
						if(message.body == '3')
						{
							foodOrder.push('Chole Bhature');
						}
						message.reply('Would you like to continue?(y/n)')
						client.on('message', message => {
							if(message.body != 'y')
								cont = 0;

					})
				}

				})
			}
		});
	}
});
