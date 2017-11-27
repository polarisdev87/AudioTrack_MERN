const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const https = require('https');
const app = express();
const request = require('request');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  pool: true,
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
	auth: {
		user: 'hicezan@gmail.com',
		pass: 'huskies5'
	}
});
const stripe = require('stripe')(
  'sk_test_2wl6eN9DurfaKXN8yuAtoAtl'
);
const EmojiIcons = require('./config').EmojiIcons;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('port', process.env.PORT || 3001);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}


/* CORS */
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Request-Methods', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
  next();
});

app.post('/checkout-test', (req, res) => {
  res.json(req.body);
});

app.post('/checkout', (req, res) => {

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

app.get('/download', (req, res) => {
	const file_url = req.url.replace('/download?file=','');
  https.get(file_url, function(response) {
	  res.setHeader('Content-disposition', 'attachment; filename=' + 'resume.pdf');
	  res.setHeader('Content-type', 'application/octet-stream');
    response.pipe(res);
  });
})

app.post('/sendmail', (req, res) => {
	let mailOption = {
		to: req.body.content.to,
		from: 'From Cezan <contact@cezan.co>',
		subject: req.body.content.type == 'download' ? 'Someone downloaded your resume' : 'Someone viewed your resume',
		html: ''
	};
	let emoji = EmojiIcons[Math.floor(Math.random()*EmojiIcons.length)];

	let html = `
		<body style="padding: 0; margin: 0; background: #f4f8f9;">
			<div style="width: 100%; min-height: 100%;">
				<div style="max-width: 555px; width: 100%; margin: 30px auto;">
					<h2 style="text-align: center; padding: 4rem 0;">CEZAN</h2>
					<div style="background: #fff; padding: 27px 47px;">
						<div style="text-align: center;"><div style="background-color: ${emoji.color}; border-radius: 50%; width: 67px; height: 67px; text-align: center; line-height: 67px; display: inline-block; font-size: 32px;">${emoji.icon}</div></div>
						<p style="margin-top: 30px;">Hi ${req.body.content.author.displayName}</p>
						<p style="margin-top: 40px;">Anonymus ${emoji.name} just ${req.body.content.type}ed your resume from ${req.body.content.location.city}, ${req.body.content.location.state}</p>
						<p style="margin-top: 40px; margin-bottom: 20px;">The Cezan Team</p>
					</div>
					<div style="text-align: center; margin: 80px 0 20px;">
						<a href="https://twitter.com/hicezan" style="margin: 0 43px;"><img src="https://image.flaticon.com/icons/png/24/463/463051.png" /></a>
						<a href="https://www.facebook.com/heycezan/" style="margin: 0 43px;"><img src="https://image.flaticon.com/icons/png/24/462/462972.png" /></a>
					</div>
					<div style="text-align: center; margin: 0 0 20px">
						<p>Sent with <img src="https://image.flaticon.com/icons/png/16/462/462982.png" style="vertical-align: bottom;" /> from San Francisco, CA</p>
					</div>
					<div style="text-align: center; margin: 0 0 50px;">
						<a href="mailto:contact@cezan.co" style="color: #000; margin: 0 54px;">Contact</a>
						<a href="https://cezan.co" style="color: #000; margin: 0 54px;">Cezan.co</a>
					</div>
				</div>
			</div>
		</div>
	`;

	mailOption.html = html;
	// res.send(mailOption);
	transporter.sendMail(mailOption, function(err, info) {
	  if (err) {
	    console.error(err);
	    res.json({
	    	type: 'fail',
	    	data: err
	    });
	  } else {
	    console.log(info);
	    res.json({
	    	type: 'success',
	    	data: info
	    });
	  }
	});
})

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});