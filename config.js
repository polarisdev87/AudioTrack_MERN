module.exports =  {
	FIREBASE_CONFIG: {
		apiKey: "AIzaSyA1VuGQI_JqdcZY8-LQER0CRjvR76oI8do",
		authDomain: "cezan-1903a.firebaseapp.com",
		databaseURL: "https://cezan-1903a.firebaseio.com",
		projectId: "cezan-1903a",
		storageBucket: "cezan-1903a.appspot.com",
		messagingSenderId: "507918410853"
	},
	serverUrl: process.env.NODE_ENV=='production' ? 'http://localhost:3001' : 'http://localhost:3001'
};
