const qrcode = require('qrcode-terminal');
// const bigmenu = require('./menu.json');
const { MongoClient, ObjectId } = require('mongodb');
const Razorpay = require('razorpay');

// MongoDB connection URL and database name
const mongoUrl = 'mongodb+srv://quickPick:quickPick@quickpick.kqhqbdn.mongodb.net/test';
const dbName = 'foodOrders';

userStore = {};
const razorpay = new Razorpay({
	key_id: 'rzp_test_lwRQUtpiJFKv77',
	key_secret: 'SVdjEp6cQjDIead0Ann7ClIR',
});

// Create a new MongoDB client
const mongoClient = new MongoClient(mongoUrl, { useUnifiedTopology: true });

const { Client } = require('whatsapp-web.js');

const client = new Client();

//const { MongoStore } = require('wwebjs-mongo');
//const mongoose = require('mongoose');

client.on('qr', (qr) => {
	qrcode.generate(qr, { small: true });
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
	menu = db.collection('menu');
	const bigmenu = await menu.findOne({});

	function findObjectByName(arr, name) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].name === name) {
				return arr[i];
			}
		}
		return null;
	}
	// Listen for new messages

	client.on('message', async (message) => {
		if (message.body === 'Hi') {
			message.reply(
				`Pick a vendor :\n\n${bigmenu.vendors
					.map((single, index) => `${index + 1}. ${single.name}`)
					.join('\n')}\n Use the command /pick followed by a number to pick the restaurant (eg. /pick 1,2,3)`
			);
		} else if (message.body.startsWith('/pick')) {
			const orderRes = Number(message.body.slice(5).trim() - 1);
			const restaurant = bigmenu.vendors[orderRes].name;
			const chatId = message.from;
			userStore[chatId] = restaurant;
			const vendor = findObjectByName(bigmenu.vendors, restaurant);
			await client.sendMessage(
				message.from,
				`Here's our menu:\n\n${vendor.menu
					.map((item, index) => `${index + 1}. ${item.name} - ₹${item.price}`)
					.join(
						'\n'
					)}\n\nPlease reply with /confirm followed by the numbers of the items you want to order separated by commas (e.g. 1,3,4).`
			);

			client.sendMessage(message.from, 'Your restaurant has been selected, type /confirm to start ordering now.');
		} else if (message.body.startsWith('/confirm')) {
			const orderItems = message.body
				.slice(8)
				.split(',')
				.map((item) => Number(item.trim()) - 1);
			const chatId = message.from;
			const vendor = findObjectByName(bigmenu.vendors, userStore[chatId]);
			const items = orderItems.map((index) => vendor.menu[index]);
			const total = items.reduce((acc, curr) => acc + curr.price, 0);
			const date = new Date();
			const time = date.toLocaleTimeString();
			const foodReceipt = {
				_id: new ObjectId(),
				restaurant: userStore[chatId],
				fooditems: items,
				cost: total,
				ordertime: time,
			};
			const paymentOptions = {
				amount: total,
				currency: 'INR',
				receipt: foodReceipt._id,
				payment_capture: 1,
				notes: {
					vendor_upi_id: vendor.upi,
				},
			};
			razorpay.orders.create(paymentOptions, (err, order) => {
				const paymentLink = order.short_url;

				client.sendMessage(message.from, paymentLink);
				razorpay.payments.fetch(order.id, (err, orderState) => {
					if (err) throw err;

					if (orderState.currPay.error === undefined) {
						db.collection('orders').insertOne(foodReceipt);
						client.sendMessage(
							message.from,
							'Your order has been confirmed! Thank you for choosing QuickPick.'
						);
					}

					console.log('user state object', userStore);
					console.log('receipt that is uploaded to db', foodReceipt);
					client.sendMessage(
						message.from,
						`Great, you have ordered:\n\n${items
							.map((item) => `${item.name} - ₹${item.price}`)
							.join('\n')}\n\nYour total is ₹${total}..`
					);
				});
			});
		}
	});
}
client.initialize();
