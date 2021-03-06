import React from 'react';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { NotificationManager } from 'react-notifications';


class Login extends React.Component {
	state = {
		email: '',
		password: '',
		error: null,
		step: 0
	};

	handleSubmit(event) {
		event.preventDefault();
		this.setState({ step: 1 });
		firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
			.then(() => {
				this.setState({ step: 2 });
  				NotificationManager.success('Loading...', '');
			})
			.catch((error) => {
  				NotificationManager.error(error.message, '');
				this.setState({ error: error, step: 0 });
			});
	}

	onInputChange(name, event) {
		var change = {};
		change[name] = event.target.value;
		this.setState(change);
	}

	loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
		const user = result.user;
    	firebase.firestore().doc('/users/' + user.uid).get().then((snapshot) => {
			if(!snapshot.exists) {
				// let email = (snapshot.data() && snapshot.data().email) || '';
				// add User Data to firestore
				firebase.firestore().doc('/users/' + user.uid).set({
					displayName: user.displayName,
					email: user.email,
					photoUrl: user.photoURL,
					signInMethod: 'google',
					paymentVerified: false,
					credits: 0,
					// activities: [],
					// resumes: [],
					lifetime: 1,
					created: new Date()
				}, {merge: true})
			} else {
				firebase.firestore().doc('/users/' + user.uid).set({
					...snapshot.data(),
					displayName: user.displayName,
					email: user.email,
					photoUrl: user.photoURL,
					signInMethod: 'google',
					updated: new Date()
				}, {merge: true})
			}
    	})
     }).catch((error) => {
	     this.setState({ error: error});
     });
	}

	render() {
		// var errors = this.state.error ? <p> {this.state.error} </p> : '';
		const { step } = this.state;
		return (
			<div className="container" style={{minHeight: 'calc(100vh - 72px)'}}>
				<div className="row pb-5">
					<div className="col-md-6 p-5 d-flex justify-content-center">
						<form onSubmit={this.handleSubmit.bind(this)} className="auth-form pt-5">
							<p className="text-center form-title">Welcome back!</p>
							<div className="form-group mb-4">
								<input type="email" className="form-control login-control" placeholder="Enter Email" value={this.state.email} onChange={this.onInputChange.bind(this, 'email')} required />
							</div>
							<div className="form-group mb-5">
								<input type="password" className="form-control login-control" placeholder="Enter Password" value={this.state.password} onChange={this.onInputChange.bind(this, 'password')} required />
							</div>
							<div className="d-flex justify-content-between align-items-center">
								<button type="submit" className="btn btn-login" disabled={step>0}>
									{
										(() => {
											switch(step) {
												case 1: return 'Checking...';
												case 2: return 'Redirecting...';
												default: return 'Login';
											}
										})()
									}
								</button>
								<Link to="/forgot" className="link-forgot">UGH..Forgot my password</Link>
							</div>
							<a className="btn btn-signin-google mt-5 white-text" onClick={this.loginWithGoogle.bind(this)}><i className="fa fa-google"></i>Sign In with Google</a>
						</form>
					</div>
					<div className="col-separator"></div>
					<div className="col-md-6 p-5">
						<div className="p-5"></div>
						<div className="login-marker-wrapper">
							<p>Resumes</p>
							<p>will never be</p>
							<div className="login-marker">
								<span>the same.</span>
								<img src={process.env.PUBLIC_URL + '/assets/img/landing-cursor2.svg'} alt="login cursor" className="login-cursor" />
								<img src={process.env.PUBLIC_URL + '/assets/img/player-playing.svg'} alt="login player" className="login-player" />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(state=>({
	user: state.auth.user
}))(Login);
