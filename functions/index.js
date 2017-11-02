const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const https = require("https");
const request = require('request');
const stripe = require("stripe")(
  "sk_test_2wl6eN9DurfaKXN8yuAtoAtl"
);

app.get("/download", (req, res) => {
	const file_url = req.url.replace('/download?file=','');
  https.get(file_url, function(response) {
	  res.setHeader('Content-disposition', 'attachment; filename=' + 'resume.pdf');
	  res.setHeader('Content-type', 'application/octet-stream');
    response.pipe(res);
  });
})

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
		  	res.json({
		  		type: 'fail',
		  		message: err.message
		  	})
		  } else {
				res.json({
					type: 'success',
					message: 'checkout succeeded'
				})	
		  }
		});
  })
})

exports.download = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
		const file_url = req.url.replace('/download?file=','');
	  https.get(file_url, function(response) {
		  res.setHeader('Content-disposition', 'attachment; filename=' + 'resume.pdf');
		  res.setHeader('Content-type', 'application/octet-stream');
	    response.pipe(res);
	  });
  })
})
