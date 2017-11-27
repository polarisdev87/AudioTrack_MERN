import * as firebase from 'firebase';
import { FIREBASE_CONFIG } from '../../config';
import { setNext } from '../actions/auth';

firebase.initializeApp(FIREBASE_CONFIG);

export function requireAuth(store) {
	return function (nextState, replace) {
		let user = store.getState().auth.user;
		if (user === null) {
			store.dispatch(setNext(nextState.location.pathname));
			replace({
				pathname: '/login',
			})
		} else {
			if(!firebase.auth().currentUser.emailVerified) {
				store.dispatch(setNext(nextState.location.pathname));
				replace({
					pathname: '/confirm',
				})
			} else {
				// firebase.database().ref('/users/' + firebase.auth().currentUser.uid).once('value').then((snapshot) => {
				  let paymentVerified = user.paymentVerified || false;
				  if(!paymentVerified) {
						store.dispatch(setNext(nextState.location.pathname));
						replace({
							pathname: '/payment',
						})
				  }
				// });
			}
		}
	}
}
