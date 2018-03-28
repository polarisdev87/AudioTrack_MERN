import React from 'react';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { login, logout, resetNext } from '../actions/auth';
import { push } from 'react-router-redux';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer } from 'react-notifications';

import HeaderNav from './HeaderNav';

class App extends React.Component {
	state = {
		loaded: false,
		user: null
	};

	styles = {
		app: {
			fontFamily: [
				'HelveticaNeue-Light',
				'Helvetica Neue Light',
				'Helvetica Neue',
				'Helvetica',
				'Arial',
				'Lucida Grande',
				'sans-serif'
			],
			fontWeight: 300
		}
	};

	componentWillMount() {
		if(this.props.location.pathname === '/privacy-policy' || this.props.location.pathname === '/terms') {
			if (!this.state.loaded) {
				this.setState({ loaded: true });
			}
			return;
		}
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				this.userListener && (this.userListener)();
				this.resumesListener && (this.resumesListener)();
				this.activitiesListener && (this.activitiesListener)();

				this.userListener = firebase.firestore().collection('users').doc(user.uid).onSnapshot((snapshot) => {
					const currentUser = snapshot.data();
					currentUser['resumes'] = {};
					currentUser['activities'] = {};
					Promise.all([
						firebase.firestore().collection('users').doc(user.uid).collection('resumes').get(),
						firebase.firestore().collection('users').doc(user.uid).collection('activities').get()
					]).then((data) => {
						data[0].forEach((resumeDoc) => {
							currentUser.resumes[resumeDoc.id] = resumeDoc.data();
							currentUser.resumes[resumeDoc.id].id = resumeDoc.id;
						});
						data[1].forEach((activityDoc) => {
							currentUser.activities[activityDoc.id] = activityDoc.data();
							currentUser.activities[activityDoc.id].id = activityDoc.id;
						});
						return Promise.resolve();
					}).then(() => {
						const was_profile = this.props.location.pathname === '/profile';
	    			const was_resumeEdit = this.props.location.pathname.indexOf('/edit/') === 0;
						this.setState({ user: { ...this.state.user, ...currentUser }});
				    let paymentVerified = (currentUser && currentUser.paymentVerified) || false;
				    if(paymentVerified) {
							if(!user.emailVerified) {
								this.props.onLogin({ ...this.state.user, ...currentUser });
								this.props.onRedirect(this.props.next || '/confirm');
								this.props.onResetNext();
							} else {
								this.props.onLogin({ ...this.state.user, ...currentUser });
								if(was_profile) {
									this.props.onRedirect(this.props.next || '/profile');
								} else if(was_resumeEdit) {
									this.props.onRedirect(this.props.next || this.props.location.pathname);
								} else {
									this.props.onRedirect(this.props.next || '/dashboard');
								}
								this.props.onResetNext();
							}
				    } else {
							this.props.onLogin({ ...this.state.user, ...currentUser });
				  		this.props.onRedirect(this.props.next || '/payment');
							this.props.onResetNext();
				    }
						if (!this.state.loaded) {
							this.setState({ loaded: true });
						}
					});
				});

				this.resumesListener = firebase.firestore().collection('users').doc(user.uid).collection('resumes').onSnapshot((snapshot) => {
					const resumes = {};
					snapshot.forEach((resumeDoc) => {
						resumes[resumeDoc.id] = resumeDoc.data();
						resumes[resumeDoc.id].id = resumeDoc.id;
					});
					const user = {...this.state.user, resumes};
					this.props.onLogin(user);
					this.setState({user});
				});
				this.activitiesListener = firebase.firestore().collection('users').doc(user.uid).collection('activities').onSnapshot((snapshot) => {
					const activities = {};
					snapshot.forEach((activityDoc) => {
						activities[activityDoc.id] = activityDoc.data();
						activities[activityDoc.id].id = activityDoc.id;
					});
					const user = {...this.state.user, activities};
					this.props.onLogin(user);
					this.setState({user});
				});
			} else {
				if (this.props.user) {
					this.props.onRedirect('/');
					this.props.onResetNext();
				} else {
					this.props.onLogout();
				}
				if (!this.state.loaded) {
					this.setState({ loaded: true });
				}
			}
		});

		window.$crisp=[];
		window.CRISP_WEBSITE_ID="253e51e3-7297-4df6-9194-674e9bcbee95";
		(function(){
			let d=document;
			let s=d.createElement("script");
			s.src="https://client.crisp.chat/l.js";
			s.async=1;
			d.getElementsByTagName("head")[0].appendChild(s);
		})();


		/*
		// Global site tag (gtag.js) - Google Analytics

		(function(){
			let d=document;
			let s=d.createElement("script");
			s.src="https://www.googletagmanager.com/gtag/js?id=UA-109685174-1";
			s.async=1;
			d.getElementsByTagName("head")[0].appendChild(s);
		})();

	  window.dataLayer = window.dataLayer || [];
	  function gtag(){window.dataLayer.push(arguments);}
	  gtag('js', new Date());
		gtag('config', 'UA-109685174-1');
		*/

	}
	componentWillUnmount() {
		this.userListener && (this.userListener)();
		this.resumesListener && (this.resumesListener)();
		this.activitiesListener && (this.activitiesListener)();
	}

	render() {
		return (
			<div className="wrapper">
				<HeaderNav {...this.props} loaded={this.state.loaded} user={this.state.user} />
				<div className="content">
					{ this.state.loaded ? this.props.children : null}
				</div>
        <NotificationContainer />
			</div>
		)
	}
}

export default connect(state => ({ next: state.auth.next, user: state.auth.user }), dispatch => ({
	onLogin: user => {
		dispatch(login(user));
	},
	onLogout: () => {
		dispatch(logout());
	},
	onRedirect: (path) => {
		dispatch(push(path));
	},
	onResetNext: () => {
		dispatch(resetNext());
	}
}))(App);
