const Razorpay = require('razorpay');




/*
var razorpay = new Razorpay({
    key_id: 'rzp_test_lwRQUtpiJFKv77',
    key_secret: 'SVdjEp6cQjDIead0Ann7ClIR',
  })



  var options = {
    
      amount: 200,
      currency: "INR",
      receipt: "awiouvfgaw",
      payment_capture: 1,
      notes: {
          vendor_upi_id: "8095300313@paytm",
      },
 
  };*/

var instance = new Razorpay({ key_id: 'rzp_test_lwRQUtpiJFKv77', key_secret: 'SVdjEp6cQjDIead0Ann7ClIR' })

 const order = instance.paymentLink.create({
  amount: 500,
  currency: "INR",
  accept_partial: true,
  first_min_partial_amount: 100,
  description: "For XYZ purpose",
  customer: {
    name: "Gaurav Kumar",
    email: "gaurav.kumar@example.com",
    contact: "+919000090000"
  },
  notify: {
    sms: true,
    email: true
  },
  reminder_enable: true,
  notes: {
    policy_name: "Jeevan Bima"
  },
  callback_url: "https://example-callback-url.com/",
  callback_method: "get"
}
,(err, result)=>{
  if(err) console.log(err);
  console.log(result.short_url);
})




 /*async function generatePaymentLink() {

  const order = await razorpay.orders.create({
    amount: 50000,
    currency: 'INR',
    payment_capture: 1,
  });

  const paymentLink = `https://checkout.razorpay.com/v1/payment?order_id=${order.id}`;

  console.log(`Payment link: ${paymentLink}`);
}

generatePaymentLink();
*/



