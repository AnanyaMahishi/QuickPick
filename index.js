const qrcode = require('qrcode-terminal');
const fs = require('fs');
const bigmenu = require('./menu.json');


const { Client } = require('whatsapp-web.js');

const client = new Client();

const SESSION_FILE_PATH = './session.json';

//const { MongoStore } = require('wwebjs-mongo');
//const mongoose = require('mongoose');




client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});


client.initialize();

function findObjectByName(arr, name) {
	for (let i = 0; i < arr.length; i++) {
	  if (arr[i].name === name) {
		return arr[i];
	  }
	}
	return null;
  }

client.on('message', message => {
	if(message.body === 'hi') {
		message.reply('Hello, which vendor would you like to order from today? (type name) \n\nGJB\nPircube\nJuice Point');
		client.on('message', message => {
			
			let namesString = '';
			vendor = findObjectByName(bigmenu.vendors, message.body);
			
			for (let i = 0; i < vendor.menu.length; i++) {
				namesString += vendor.menu[i].name + '\n';
			  }
			client.sendMessage(message.from, namesString);

		});
	}
});
