import React from 'react';
import * as firebase from 'firebase';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';


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
  			NotificationManager.success('Loading...', '', 3000);
			})
			.catch((error) => {
  			NotificationManager.error(error.message, '', 3000);
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
    	firebase.database().ref('/users/' + user.uid).once('value').then((snapshot) => {
				let email = (snapshot.val() && snapshot.val().email) || '';
				if(!email) {
					// add User Data to database
					firebase.database().ref('/users/' + user.uid).set({
						displayName: user.displayName,
						email: user.email,
						photoUrl: user.photoURL,
						singInMethod: 'google',
						paymentVerified: false,
						credits: 0,
						activities: [],
						resumes: [],
						lifetime: 1
					})
				} else {
					firebase.database().ref('/users/' + user.uid).update({
						displayName: user.displayName,
						email: user.email,
						photoUrl: user.photoURL,
						singInMethod: 'google'
					})
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
						<img src={process.env.PUBLIC_URL + '/assets/img/resume-unique.png'} alt="resume unique" />
					</div>
				</div>
        <NotificationContainer/>
			</div>
		);
	}
}

export default connect(state=>({
	user: state.auth.user
}))(Login);
