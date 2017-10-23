const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();

const stripe = require("stripe")(
  "sk_test_2wl6eN9DurfaKXN8yuAtoAtl"
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set("port", process.env.PORT || 3001);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, 'build')));
}


/* CORS */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Request-Methods", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  next();
});

app.post("/checkout-test", (req, res) => {
  res.json(req.body);
});

app.post("/checkout", (req, res) => {

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

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});