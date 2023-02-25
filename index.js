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
	startBot();
});

async function startBot() {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('Connected to MongoDB');

    // Select the database
    const db = mongoClient.db(dbName);

	function findObjectByName(arr, name) {
		for (let i = 0; i < arr.length; i++) {
		  if (arr[i].name === name) {
			return arr[i];
		  }
		}
		return null;
	  }
    // Listen for new messages
    client.on('message', async (message) => 
    {
		if(message.body === 'Hi') {
			message.reply('Hello, which vendor would you like to order from today? (type name) \n\nGJB\nPircube\nJuice Point');
			client.on('message', async(message) => 
			{
				
				let namesString = '';
				vendor = findObjectByName(bigmenu.vendors, message.body);
				
				// for (let i = 0; i < vendor.menu.length; i++) {
				// 	namesString += vendor.menu[i].name + '\n';
				//   }

				await client.sendMessage(message.from, `Here's our menu:\n\n${vendor.menu.map((item, index) => `${index + 1}. ${item.name} - $${item.price}`).join('\n')}\n\nPlease reply with the numbers of the items you want to order separated by commas (e.g. 1,3,4).`);
				client.sendMessage(message.from, namesString);

				client.on('message', message =>
				{
					let order = {
						id : "",
						order : [],
						cost : ""
					}

					// Order multiple functionality
					// Include total cost
					// Ask for srn and put it into the id field after taking food orders


				}
			)
	
			});
		}
	}
	)
}

client.initialize();