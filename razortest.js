const Razorpay = require('razorpay');





var instance = new Razorpay({
    key_id: 'rzp_test_lwRQUtpiJFKv77',
    key_secret: 'SVdjEp6cQjDIead0Ann7ClIR',
  })



  var options = {
    
    amount: 200,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11"
  };

  instance.orders.create(options, function(err, order) {
    console.log(order);
  });


  //End of payment code