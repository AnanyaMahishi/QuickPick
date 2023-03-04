const Razorpay = require('razorpay');
const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const instance = new Razorpay({
    key_id: "rzp_test_lwRQUtpiJFKv77",
    key_secret: "SVdjEp6cQjDIead0Ann7ClIR",
});

// create payment link for a particular vendor

const options = {
    amount: 10000, // convert to paise
    currency: 'INR',
    description: 'Payment for vendor ',
    notes: {
        id:"12ar33",
    },
    customer: {
        name: 'John Doe',
        email: 'johndoe@example.com',
    },
    
};

instance.paymentLink.create(options, (err, linkobj) => {

    link = linkobj.short_url;
    let id = linkobj.id
    console.log(id)
    console.log(link)

});





app.post('/', async (req, res) => {
    const event = req.body.event;
    const data = req.body.payload;

    if (event === 'payment_link.paid') {
        console.log('Payment link has been paid!');
        console.log(data.payment.entity.notes);
        // You can fetch the details of the payment here
    }

    res.sendStatus(200);
})


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// handle payment success webhook event
/* instance.webhooks.on('payment.link.authorized', async (paymentLink) => {
    // payment link authorized event received, do something
    const paymentId = paymentLink.entity.id;
    const payment = await razorpay.payments.fetch(paymentId);
    // check if payment is successful
    if (payment.status === 'captured') {
        // payment is successful, do something
        const vendorId = paymentLink.entity.vendor.id;
        const amount = paymentLink.entity.amount / 100; // convert back to rupees
        console.log(`Payment of INR ${amount} for vendor ${vendorId} is successful.`);
        // do something with the payment
    } else {
        // payment failed, do something
        console.log(`Payment of INR ${amount} for vendor ${vendorId} has failed.`);
        // do something with the payment failure
    }
}); */
