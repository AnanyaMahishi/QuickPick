const qrcode = require("qrcode-terminal");
const express = require('express')
const Razorpay = require("razorpay");
const bodyParser = require('body-parser');
const app = express();
const port = 3002;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// FireStore Admin SDK
const admin = require("firebase-admin");
const serviceAccount = require("./ServiceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();


userStore = {};
const razorpay = new Razorpay({
    key_id: "rzp_test_TwKDUjk8RL0wvs",
    key_secret: "IIOFpUc3OcW0eTXQ8sUHoSrv",
});

// Create a new MongoDB client

const { Client } = require("whatsapp-web.js");

const client = new Client({
    puppeteer: {
        args: ["--no-sandbox"],
    }
});



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
    /* const bigmenu = await menu.findOne({});
    console.log(allRestaurants); */

    // const documents = await menu.find({}, { projection: { restaurants: 1, _id: 0 } }).toArray();
    let allRestaurants = await db.collection("restaurants").get();
    allRestaurants = allRestaurants.docs.map((doc) => doc.data());
    // const allRestaurants = documents.reduce((accumulator, currentDocument) => {
    //     return accumulator.concat(currentDocument.restaurants);
    // }, []);
    // allRestaurants.shift();
    console.log("allRestaurants:",allRestaurants)

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
            await db.collection("orders").doc().set(JSON.parse(data.payment.entity.notes.food));
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
            const items = {};
            orderItems.forEach((item) => {
                items[item] = vendor.menu[item];
                if(items[item]){
                    items[item]++;
                }
                else{
                    items[item]=1;
                }
            });
            console.log(items);
            const total = Object.keys(items).reduce((acc, curr) => {
                const itemPrice = vendor.menu.find(item => item === curr).price;
                return acc + itemPrice * items[curr];
            }, 0);
            const date = new Date();
            const time = date;
            const foodReceipt = {
                created_at: time,
                restaurant_id: userStore[chatId],
                items: items,
                status: "In-Progress",
                ready_at: "null",
                user_id: chatId,
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

            await db.collection("orders").doc().set(foodReceipt);
            await client.sendMessage(
                chatId,
                "Your order has been confirmed! Thank you for choosing QuickPick."
            );
            razorpay.paymentLink.create(paymentOptions, (_, linkobj) => {

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
