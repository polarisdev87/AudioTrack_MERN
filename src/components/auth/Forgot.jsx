import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';


class Forgot extends React.Component {
	state = {
		email: '',
		sent: false,
		error: null
	};

	handleSubmit(event) {
		event.preventDefault();
		firebase.auth().sendPasswordResetEmail(this.state.email).then(() => {
		  // Email sent.
		  this.setState({ sent: true });
		}).catch((error) => {
			console.log(error);
			if(error.code === "auth/user-not-found") {
  			NotificationManager.error('woah, that’s weird. There isn’t an account with that email.', 'Sign up!', 3000);
			} else {
    		NotificationManager.error('Error', `Couldn't send password reset email`, 3000);
    	}
		});
	}

	onInputChange(name, event) {
		var change = {};
		change[name] = event.target.value;
		this.setState(change);
	}

	render() {
		// var errors = this.state.error ? <p> {this.state.error} </p> : '';
		const { sent } = this.state;
		return (
			<div className="container" style={{minHeight: 'calc(100vh - 72px)'}}>
				<div className="row pb-5">
					<div className="col-sm-8 col-md-6 col-lg-4 p-5 m-auto d-flex justify-content-center">
						<form onSubmit={this.handleSubmit.bind(this)} className="auth-form pt-5 forgot-form">
							<p className="brand-letter text-center mb-5">C</p>
							{ !sent ? (
								<div>
									<p className="text-center form-title mb-5">Forgot Password?</p>
									<div className="form-group mb-4">
										<input type="email" className="form-control login-control" placeholder="Enter Email" value={this.state.email} onChange={this.onInputChange.bind(this, 'email')} required />
									</div>
									<div className="d-flex justify-content-center align-items-center">
										<button type="submit" className="btn btn-login">Enter</button>
									</div>
								</div>
							) : (
								<div>
									<div className="logo-email m-auto"><i className="fa fa-envelope-o"></i></div>
									<p className="mt-5 font-normal letter-spacing-4 text-center grey-text">We just sent you and email<br/>to reset your password!</p>
								</div>
							)}
						</form>
					</div>
				</div>
        <NotificationContainer/>
			</div>
		);
	}
}

export default connect()(Forgot);