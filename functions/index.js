const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const stripe = require("stripe")(
  "sk_test_2wl6eN9DurfaKXN8yuAtoAtl"
);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
// //
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.checkout = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
		stripe.charges.create( req.body.params , function(err, charge) {
		  // asynchronously called
		  if(err) {
		  	console.log(err);
		  	res.json({
		  		type: 'fail',
		  		message: 'checkout failed'
		  	})
		  }
			res.json({
				type: 'success',
				message: 'checkout succeeded'
			})
		})
  })
})