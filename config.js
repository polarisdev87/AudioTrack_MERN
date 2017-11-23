module.exports =  {
	FIREBASE_CONFIG: {
		apiKey: "AIzaSyA1VuGQI_JqdcZY8-LQER0CRjvR76oI8do",
		authDomain: "cezan-1903a.firebaseapp.com",
		databaseURL: "https://cezan-1903a.firebaseio.com",
		projectId: "cezan-1903a",
		storageBucket: "cezan-1903a.appspot.com",
		messagingSenderId: "507918410853"
	},
	serverUrl: process.env.NODE_ENV=='production' ? 'https://us-central1-cezan-1903a.cloudfunctions.net' : 'http://localhost:3001',
	EmojiIcons: [ {
			name: 'Penguin',
			icon: '🐧',
			color: '#FFA793'
		},
		{
			name: 'Frog',
			icon: '🐸',
			color: '#F74C61'
		},
		{
			name: 'Chick',
			icon: '🐥',
			color: '#4A90E2'
		},
		{
			name: 'Tiger',
			icon: '🐯',
			color: '#FF9CF7'
		},
		{
			name: 'Bear',
			icon: '🐻',
			color: '#3B9C86'
		},
		{
			name: 'Monkey',
			icon: '🐵',
			color: '#B89CFF'
		},
		{
			name: 'Dog',
			icon: '🐶',
			color: '#FFD548'
		},
		{
			name: 'Cat',
			icon: '🐱',
			color: '#73C6FF'
		},
		{
			name: 'Koala',
			icon: '🐨',
			color: '#FF8695'
		},
		{
			name: 'Wolf',
			icon: '🐺',
			color: '#05CCA0'
		},
		{
			name: 'Whale',
			icon: '🐋',
			color: '#FFE797'
		}
	]
};
