import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Link } from 'react-router';

class Signup extends React.Component {
	state = {
		fullname: '',
		email: '',
		password: '',
		error: null
	};

	handleSubmit(event) {
		event.preventDefault();

		firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
			.then((user) => {

				// update Full Name
				user.updateProfile({
					displayName: this.state.fullname
				}).then(() => {
				}).catch((error) => {
					console.log('profile update failed', error)
				})

				// add User Data to database
				firebase.database().ref('/users/' + user.uid).set({
					name: this.state.fullname,
					email: user.email,
					photoUrl: user.photoURL,
					singInMethod: 'email',
					paymentVerified: false
				})

				// send Verification Email
				user.sendEmailVerification().then(function() {
				  // Email sent.
				  console.log('email sent');
				}).catch(function(error) {
				  // An error happened.
				  console.log('email sending failure');
				});

			})
			.catch((error) => {
				this.setState({ error: error });
			});
	}

	onInputChange(name, event) {
		var change = {};
		change[name] = event.target.value;
		this.setState(change);
	}

	loginWithGoogle() {
		const provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then((user) => {
			// add User Data to database
			firebase.database().ref('/users/' + user.uid).set({
				name: user.displayName,
				email: user.email,
				photoUrl: user.photoURL,
				singInMethod: 'google',
				paymentVerified: false
			})
		}).catch((error) => {
			this.setState({ error: error});
		});
	}


	render() {
		// var errors = this.state.error ? <p> {this.state.error} </p> : '';
		return (
			<div className="container" style={{minHeight: 'calc(100vh - 72px)'}}>
				<div className="row pb-5">
					<div className="col-md-6 p-5 d-flex justify-content-center">
						<div className="auth-form">
							<div className={classnames('form-wizard-step', 'form-wizard-step-auth')}>
								<form onSubmit={this.handleSubmit.bind(this)} className="pt-5">
								<p className="text-center form-title">Let's get started!</p>
								<div className="form-group mb-4">
									<input type="text" className="form-control login-control" placeholder="Enter Full Name" value={this.state.fullname} onChange={this.onInputChange.bind(this, 'fullname')} required />
								</div>
								<div className="form-group mb-4">
									<input type="email" className="form-control login-control" placeholder="Enter Email" value={this.state.email} onChange={this.onInputChange.bind(this, 'email')} required />
								</div>
								<div className="form-group mb-5">
									<input type="password" className="form-control login-control" placeholder="Enter Password" value={this.state.password} onChange={this.onInputChange.bind(this, 'password')} required pattern=".{6,}" />
								</div>
								<div className="d-flex justify-content-between align-items-center">
									<button className="btn btn-login white-text">Next</button>
								</div>
								<a className="btn btn-signin-google mt-5 white-text" onClick={this.loginWithGoogle.bind(this)}><i className="fa fa-google"></i>Sign Up with Google</a>
								</form>
							</div>
							<p className="text-center mt-5 font-normal grey-text letter-spacing-4 privacy-terms-links">By signing up you agree with Cezan’s<br/><b><Link to="/privacy-policy" target="_blank">Privacy Policy</Link> and <Link to="/terms" target="_blank">Terms</Link></b></p>
						</div>
					</div>
					<div className="col-separator"></div>
					<div className="col-md-6 p-5">
						<div className="p-5"></div>
						<img src={process.env.PUBLIC_URL + '/assets/img/resume-unique.png'} alt="resume unique" />
					</div>
				</div>
			</div>
		);
	}
}

export default connect()(Signup);