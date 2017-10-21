import * as firebase from 'firebase';
import { FIREBASE_CONFIG } from '../../config';
import { setNext } from '../actions/auth';

firebase.initializeApp(FIREBASE_CONFIG);

export function requireAuth(store) {
	return function (nextState, replace) {
		if (firebase.auth().currentUser === null) {
			store.dispatch(setNext(nextState.location.pathname));
			replace({
				pathname: '/login',
			})
		}
	}
}
