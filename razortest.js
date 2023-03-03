const Razorpay = require('razorpay');





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
 
  };



 async function generatePaymentLink() {
  // Create an order
  const order = await razorpay.orders.create({
    amount: 50000, // Amount in paise (Rs. 500)
    currency: 'INR',
    payment_capture: 1,
  });

  // Generate a payment link for the order
  const paymentLink = `https://checkout.razorpay.com/v1/payment?order_id=${order.id}`;

  console.log(`Payment link: ${paymentLink}`);
}

// Call the async function to generate the payment link
generatePaymentLink();


