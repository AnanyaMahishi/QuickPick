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
    client.on('message', message => 
    {
		if(message.body === 'Hi') {
			message.reply('Hello, which vendor would you like to order from today? (type name) \n\nGJB\nPircube\nJuice Point');
			client.on('message', async(message) => 
			{
				
				//let namesString = '';
				vendor = findObjectByName(bigmenu.vendors, message.body);
				console.log(vendor.name);
				client.sendMessage(message.from, "Type /order to start ordering now, /confirm when you're done");
				
				// for (let i = 0; i < vendor.menu.length; i++) {
				// 	namesString += vendor.menu[i].name + '\n';
				//   }
				//client.sendMessage(message.from, namesString);
				client.on('message', async(message) => {

					if(message.body === '/order')
					{
						await client.sendMessage(message.from, `Here's our menu:\n\n${vendor.menu.map((item, index) => `${index + 1}. ${item.name} - $${item.price}`).join('\n')}\n\nPlease reply with the numbers of the items you want to order separated by commas (e.g. 1,3,4).`);
					}
					else if(message.body.startsWith('/confirm')){
						
						const orderItems = message.body.slice(8).split(',').map(item => Number(item.trim()) - 1);
						const items = orderItems.map(index => vendor.menu[index]);
						const total = items.reduce((acc, curr) => acc + curr.price, 0);
						await client.sendMessage(message.from, `Great, you have ordered:\n\n${items.map(item => `${item.name} - $${item.price}`).join('\n')}\n\nYour total is $${total}. Please confirm your order by typing "Yes".`);
						
					}else if (message.body.toLowerCase() === 'yes') {
						await client.sendMessage(message.from, 'Your order has been confirmed! Thank you for choosing the Food Company.');
					}
					
				})
			});
		}
	}
	)
}

client.initialize();
