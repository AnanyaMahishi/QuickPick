const qrcode = require('qrcode-terminal');
const fs = require('fs');


const { Client} = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LegacySessionAuth({
        session: sessionData
    })
});

const SESSION_FILE_PATH = './session.json';

//const { MongoStore } = require('wwebjs-mongo');
//const mongoose = require('mongoose');

let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}


client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});
 

client.initialize();

client.on('message', message => {
	if(message.body === 'hi') {
		message.reply('Hello, which vendor would you like to order from today? (pick number) \n\n(1) GJB');
		client.on('message', message => {
			if(message.body === '1') {
				message.reply('Thank you for ordering from GJB today, here is our menu\n(1) Masala dosa\n(2) Idli\n(3) Chole Bhature');
				client.on('message', message => {

					if(message.body.toLowerCase() === 'masala dosa')
					{
						message.reply('1 masala dosa confirmed');
					}

					if(message.body.toLowerCase() === 'idli')
					{
						message.reply('1 idli confirmed');
					}					

					if(message.body.toLowerCase() === 'chole bhature')
					{
						message.reply('1 chole bhature confirmed');
					}
				})
			}
		});
	}
});
