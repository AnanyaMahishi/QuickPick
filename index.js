const qrcode = require('qrcode-terminal');
const fs = require('fs');
const bigmenu = require('./menu.json');
const MongoClient = require("mongodb").MongoClient;

// MongoDB connection URL and database name
const mongoUrl = 'mongodb+srv://quickPick:quickPick@quickpick.kqhqbdn.mongodb.net/test';
const dbName = 'foodOrders';



// Create a new MongoDB client
const mongoClient = new MongoClient(mongoUrl, { useUnifiedTopology: true });

const { Client } = require('whatsapp-web.js');

const client = new Client();

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
