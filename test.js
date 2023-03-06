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


