const qrcode = require("qrcode-terminal");
const express = require('express')
const { MongoClient, ObjectId } = require("mongodb");
const Razorpay = require("razorpay");
const bodyParser = require('body-parser');
const app = express();
const port = 3002;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// MongoDB connection URL and database name
const mongoUrl =
    "mongodb+srv://quickPick:quickPick@quickpick.kqhqbdn.mongodb.net/test";
const dbName = "foodOrders";

userStore = {};
const razorpay = new Razorpay({
    key_id: "rzp_test_lwRQUtpiJFKv77",
    key_secret: "SVdjEp6cQjDIead0Ann7ClIR",
});

// Create a new MongoDB client
const mongoClient = new MongoClient(mongoUrl, { useUnifiedTopology: true });

const { Client } = require("whatsapp-web.js");

const client = new Client();



//const { MongoStore } = require('wwebjs-mongo');
//const mongoose = require('mongoose');

client.on("qr", (qr) => {
    //startBot();
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Client is ready!");
    startBot();
});

client.on("error", (err) => {
    console.log("Client error!", err);
});

async function startBot() {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log("Connected to MongoDB");

    // Select the database
    const db = mongoClient.db(dbName);
    menu = db.collection("menu");
    /* const bigmenu = await menu.findOne({});
    console.log(allRestaurants); */

    const documents = await menu.find({}, { projection: { restaurants: 1, _id: 0 } }).toArray();
    const allRestaurants = documents.reduce((accumulator, currentDocument) => {
        return accumulator.concat(currentDocument.restaurants);
    }, []);
    allRestaurants.shift();
    console.log(allRestaurants)

    function findObjectByName(arr, name) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].name === name) {
                return arr[i];
            }
        }
        return null;
    }
    

    app.post('/', async (req, res) => {
        //console.log(foodReceipt)
        const event = req.body.event;
        const data = req.body.payload;
        //console.log(typeof(data.payment.entity.notes.id))
        //console.log("this is server endpoint",data.payment.entity.notes.id,String(foodReceipt._id))
    
        if (event === 'payment_link.paid') {
            console.log("food:", data.payment.entity.notes.food)
            console.log("in post",JSON.parse(data.payment.entity.notes.food))
            await db.collection("orders").insertOne(JSON.parse(data.payment.entity.notes.food));
            await client.sendMessage(
                data.payment.entity.notes.user,
                "Your order has been confirmed! Thank you for choosing QuickPick."
            );
            let chatId=data.payment.entity.notes.user
            delete userStore[chatId]
        }
    
        res.sendStatus(200);
    })

    client.on("message", async (message) => {
        if (message.body === "Hi") {
            message.reply(
                `Pick a vendor :\n\n${allRestaurants
                    .map((single, index) => `${index + 1}. ${single.name}`)
                    .join(
                        "\n"
                    )}\n Use the command /pick followed by a number to pick the restaurant (eg. /pick 1,2,3)`
            );
        } 
        
        else if (message.body.startsWith("/pick")) {
            const orderRes = Number(message.body.slice(5).trim() - 1);
            const restaurant = allRestaurants[orderRes].name;
            const chatId = message.from;
            userStore[chatId] = restaurant;
            const vendor = findObjectByName(allRestaurants, restaurant);
            await client.sendMessage(
                message.from,
                `Here's our menu:\n\n${vendor.menu
                    .map((item, index) => `${index + 1}. ${item.name} - ₹${item.price}`)
                    .join(
                        "\n"
                    )}\n\nPlease reply with /confirm followed by the numbers of the items you want to order separated by commas (e.g. 1,3,4).`
            );

            client.sendMessage(
                message.from,
                "Your restaurant has been selected, type /confirm to start ordering now."
            );
        } 
        
        
        else if (message.body.startsWith("/confirm")) {
            const orderItems = message.body
                .slice(8)
                .split(",")
                .map((item) => Number(item.trim()) - 1);
            const chatId = message.from;
            const vendor = findObjectByName(allRestaurants, userStore[chatId]);
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
                amount: total*100,
                currency: "INR",
                description: 'Payment for vendor ',
                notes: {
                    id:foodReceipt._id,
                    food:JSON.stringify(foodReceipt),
                    user:message.from,
                },
                customer: {
                    name: 'John Doe',
                    email: 'johndoe@example.com',
                },
            };
            console.log(paymentOptions.notes.food)
            await client.sendMessage(
                message.from,
                `Great, you have ordered:\n\n${items
                    .map((item) => `${item.name} - ₹${item.price}`)
                    .join("\n")}\n\nYour total is ₹${total}..`
            );
            razorpay.paymentLink.create(paymentOptions, (err, linkobj) => {

                link = linkobj.short_url;
                //console.log(linkobj)
                //console.log(link)
                client.sendMessage(message.from, link)
            });
            //console.log("receipt that is uploaded to db", foodReceipt);
            //console.log("user state object", userStore);
        }

    });
}
client.initialize();
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});