import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { NotificationManager } from 'react-notifications';


class Confirm extends React.Component {
	state = {
		sent: false,
		error: null
	};

	handleSubmit(event) {
		event.preventDefault();
		firebase.auth().currentUser.sendEmailVerification().then(() => {
			// Email sent.
			this.setState({ sent: true });
  		NotificationManager.success('Verification Email sent', '');
		}).catch((error) => {
			// An error happened.
  		NotificationManager.error(error.message, '');
		})
	}

	onInputChange(name, event) {
		var change = {};
		change[name] = event.target.value;
		this.setState(change);
	}

	render() {
		// var errors = this.state.error ? <p> {this.state.error} </p> : '';
		return (
			<div className="container" style={{minHeight: 'calc(100vh - 72px)'}}>
				<div className="row pb-5">
					<div className="col-sm-8 col-md-6 col-lg-4 p-5 m-auto d-flex justify-content-center">
						<form onSubmit={this.handleSubmit.bind(this)} className="auth-form pt-5 forgot-form">
							<p className="brand-letter text-center mb-5">C</p>
							<div className="logo-email m-auto"><i className="fa fa-envelope-o"></i></div>
							<p className="mt-5 font-normal letter-spacing-4 text-center grey-text">We just sent you a confirmation<br/>email. Please verify!</p>
							<div className="d-flex justify-content-center align-items-center mt-5">
								<button type="submit" className="btn btn-send-confirm">Resend</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(state=>({
	user: state.auth.user
}))(Confirm);
