import React from 'react';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
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
				firebase.database().ref('/users/' + user.uid).on('value', (snapshot) => {
					const currentUser = snapshot.val();
					const was_profile = this.props.location.pathname === '/profile';
    			const was_resumeEdit = this.props.location.pathname.indexOf('/edit/') === 0;
					this.setState({ user: { ...currentUser }});
				  let paymentVerified = (currentUser && currentUser.paymentVerified) || false;
				  if(paymentVerified) {
						if(!user.emailVerified) {
							this.props.onLogin(currentUser);
							this.props.onRedirect(this.props.next || '/confirm');
							this.props.onResetNext();
						} else {
							this.props.onLogin(currentUser);
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
						this.props.onLogin(currentUser);
				  	this.props.onRedirect(this.props.next || '/payment');
						this.props.onResetNext();
				  }
					if (!this.state.loaded) {
						this.setState({ loaded: true });
					}
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
	}
	componentWillUnmount() {
		firebase.database().ref('/users/' + firebase.auth().currentUser.uid).off();
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
