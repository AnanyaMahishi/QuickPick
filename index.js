// Import required modules
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const MongoClient = require('mongodb').MongoClient;

// MongoDB connection URL and database name
const mongoUrl = 'mongodb+srv://quickPick:quickPick@quickpick.kqhqbdn.mongodb.net/test';
const dbName = 'foodOrders';



// Create a new MongoDB client
const mongoClient = new MongoClient(mongoUrl, { useUnifiedTopology: true });

// Create a new WhatsApp client
const client = new Client();

// When the client is ready, generate and display a QR code to authenticate
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// When the client is authenticated, start listening for messages
client.on('ready', () => {
    console.log("before connect")
    startBot();
});

// Start the chatbot
async function startBot() {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('Connected to MongoDB');

    // Select the database
    const db = mongoClient.db(dbName);

    // Listen for new messages
    client.on('message', async (message) => 
    {
        if (message.body === 'menu') 
        {
            // Send the user a list of restaurant options
            await message.reply('Please select a restaurant: \n1. Restaurant A \n2. Restaurant B');
        }
        else{
            client.on('message',async (message)=>{

                if (message.body === '1') 
                {
                await message.reply('What do you want?1:Masala Dosa\n2:Chole Bhature');
                client.on('message',async (message)=>
                {
                    if(message.body==='a')
                    {
                        // Store the user's order for Restaurant A in the database
                        const order = { restaurant: 'Restaurant A', order:"Masala Dosa" };
                        await db.collection('orders').insertOne(order);
                        await message.reply('Your order has been received. Thank you!');
                    }
                    if(message.body==='b')
                    {
                        // Store the user's order for Restaurant A in the database
                        const order = { restaurant: 'Restaurant A', order:"Chole Bhature" };
                        await db.collection('orders').insertOne(order);
                        await message.reply('Your order has been received. Thank you!');
                    }
                })
            }
                if (message.body === '2')
                {
                    await message.reply('What do you want? \n 1. Fried Rice\n2. Hakka Noodles');
                    client.on('message', async(message)=>
                    {
                        if(message.body==='a')
                        {
                            // Store the user's order for Restaurant A in the database
                            const order = { restaurant: 'Restaurant A', order:"Fried Rice" };
                            await db.collection('orders').insertOne(order);
                            await message.reply('Your order has been received. Thank you!');
                        }
                        if(message.body==='b')
                        {
                            // Store the user's order for Restaurant A in the database
                            const order = { restaurant: 'Restaurant A', order:"Hakka Noodles" };
                            await db.collection('orders').insertOne(order);
                            await message.reply('Your order has been received. Thank you!');
                        }
                    })
                }  
        })
        }
    })
}

// Start the WhatsApp client
client.initialize();