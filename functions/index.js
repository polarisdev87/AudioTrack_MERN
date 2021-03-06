const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const https = require("https");
const stripe = require('stripe')(require('./config').stripeSkKey);
const nodemailer = require('nodemailer');
const mandrillTransport = require('nodemailer-mandrill-transport');
const transporter = nodemailer.createTransport(mandrillTransport({
  auth: {
    apiKey: require('./config').mandrillKey
  }
}));
const EmojiIcons = require('./config').EmojiIcons;

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

exports.sendmail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
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
							<p style="margin-top: 30px;">Hi ${req.body.content.author.displayName},</p>
							<p style="margin-top: 40px;">Anonymus ${emoji.name} just ${req.body.content.type}ed your resume from ${req.body.content.location.city}, ${req.body.content.location.state}!</p>
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
})
