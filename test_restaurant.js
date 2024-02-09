const admin = require("firebase-admin");
const serviceAccount = require("./ServiceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const rest_data = {
  menu: [
    {
      name: 'shawarma',
      price: 60
    },
    {
      name: 'burger',
      price: 120
    },
    {
      name: 'momos',
      price: 70
    }
  ],
  name: 'Burger Queen',
  upiId: 'burgerqueen@upi'

}
db.collection("restaurant").doc().set(rest_data).then(() => {
    console.log("Document successfully sent!");
}).catch((error) => {
    console.error("Error writing document: ", error);
});


