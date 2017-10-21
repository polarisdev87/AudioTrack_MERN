import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { CardElement, Elements, injectStripe } from 'react-stripe-elements';
import axios from 'axios';
import { serverUrl } from '../../../config';
import $ from 'jquery';
// var stripe = require('stripe');//("pk_test_c6y3yAJNkhXrA84sbNINBHqZ");

class _CardForm extends React.Component<{stripe: StripeProps}> {
  handleSubmit = ev => {
    ev.preventDefault();
    this.props.stripe.createToken().then(payload => {
    	if(payload.error) {
    		return false;
    	}
    	axios.post(serverUrl + '/checkout-test', {
    			params: {
					  amount: 300 * this.props.quantity,
					  currency: 'usd',
					  description: 'Test payment.',
					  source: payload.token.id,
					}
				}).then((res) => {
					console.log(res.data);
					this.props.completeSignUp();
				})
    });
  };

  stepBack = () => {
  	this.props.stepBack()
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <CardElement className="stripe-form" />
				<div className="d-flex justify-content-between align-items-center mt-5">
					<a className="btn btn-login white-text" onClick={this.stepBack}>Back</a>
        	<button className="btn btn-login white-text">Pay ${3*this.props.quantity}</button>
				</div>
      </form>
    );
  }
}
const CardForm = injectStripe(_CardForm);

class Signup extends React.Component {
	state = {
		fullname: '',
		email: '',
		password: '',
		error: null,
		advanced: false,
		quantity: 1
	};

	handleSubmit(event) {
		event.preventDefault();

		if(this.state.advanced) {
		} else {
			$('.stripe-form-container').width('98%');
			setTimeout(() => {
				$('.stripe-form-container').width('100%');
			}, 10);
			this.setState({ advanced: true})
		}
	}

	onInputChange(name, event) {
		var change = {};
		change[name] = event.target.value;
		this.setState(change);
	}

	loginWithGoogle() {
		return false;
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((user) => {
		}).catch((error) => {
			this.setState({ error: error});
		});
	}

	stepBack = () => {
		this.setState({ advanced: false });
	}

	quantityUp() {
		this.setState({ quantity: this.state.quantity+1 })
	}

	quantityDown() {
		this.setState({ quantity: Math.max(this.state.quantity-1, 1) })
	}

	completeSignUp = () => {
		console.log(this.state);
		firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
			.then((user) => {
				user.updateProfile({
					displayName: this.state.fullname
				}).then(() => {
					user.sendEmailVerification().then(function() {
					  // Email sent.
					  console.log('email sent');
					}).catch(function(error) {
					  // An error happened.
					  console.log('email sending failure');
					});
				}).catch((error) => {
					console.log('profile update failed', error)
				})
			})
			.catch((error) => {
				this.setState({ error: error });
			});
	}

	render() {
		// var errors = this.state.error ? <p> {this.state.error} </p> : '';
		const { advanced, quantity } = this.state;
		return (
			<div className="container" style={{minHeight: 'calc(100vh - 72px)'}}>
				<div className="row pb-5">
					<div className="col-md-6 p-5 d-flex justify-content-center">
						<div className="login-form">
							<div className={classnames('form-wizard-step', 'form-wizard-step-auth', {'form-wizard-passed': advanced})}>
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
							<div className={classnames('form-wizard-step', 'form-wizard-step-payment', {'form-wizard-passed': !advanced})}>
								<div className="text-center form-title col-md-9 m-auto mb-5">How many resumes would you like to start off with John?
									<div style={{color: '#9b9b9b', fontSize: '12px'}} className="text-center letter-spacing-3 mt-2 mb-5">You can always add more later!</div>
								</div>
								<div className="price-box mb-5 mt-5">
									<div className="price-label"><span className="price-unit">$3</span><span className="price-separator">/</span><span className="price-unit-label">per resume</span></div>
									<div className="price-control">
										<span className="fa fa-chevron-down control control-down p-1" onClick={this.quantityDown.bind(this)}></span>
										<span className="quantity">{quantity}</span>
										<span className="fa fa-chevron-up control control-up" onClick={this.quantityUp.bind(this)}></span>
									</div>
								</div>
								<div className="stripe-form-container">
					        <Elements stripe={this.props.stripeInstance}>
					          <CardForm stepBack={this.stepBack} quantity={quantity} completeSignUp={this.completeSignUp} />
					        </Elements>
					      </div>
							</div>
							<p className="text-center mt-5 font-normal grey-text letter-spacing-4">By signing up you agree with Cezan’s<br/><b>Privacy Policy and Terms of Service</b></p>
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