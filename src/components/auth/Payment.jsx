import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { CardElement, Elements, injectStripe } from 'react-stripe-elements';
import axios from 'axios';
import { serverUrl } from '../../../config';
import { Link } from 'react-router';
import $ from 'jquery';
import { login, resetNext } from '../../actions/auth';
import { push } from 'react-router-redux';

class _CardForm extends React.Component<{stripe: StripeProps}> {
  handleSubmit = ev => {
    ev.preventDefault();
    this.props.stripe.createToken().then(payload => {
    	if(payload.error) {
    		return false;
    	}
    	axios.post(serverUrl + '/checkout', {
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
  	this.props.stepBack();
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

class Payment extends React.Component {
	state = {
		fullname: '',
		error: null,
		quantity: 1
	};

	componentWillMount() {
		this.setState({ fullname: firebase.auth().currentUser.displayName });
		firebase.database().ref('/users/' + firebase.auth().currentUser.uid).on('value', (snapshot) => {
			this.setState({ fullname: (snapshot.val() && snapshot.val().name) || '' });
		})
	}

	componentWillUnmount() {
		firebase.database().ref('/users/' + firebase.auth().currentUser.uid).off();
	}

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
	}

	stepBack = () => {
		this.props.dispatch(login(firebase.auth().currentUser));
		this.props.dispatch(push(this.props.next || '/signup'));
		this.props.dispatch(resetNext());
	}

	quantityUp() {
		this.setState({ quantity: this.state.quantity+1 })
	}

	quantityDown() {
		this.setState({ quantity: Math.max(this.state.quantity-1, 1) })
	}

	completeSignUp = () => {
		firebase.database().ref('/users/' + firebase.auth().currentUser.uid).update({ paymentVerified: true }).then(() => {
			this.props.dispatch(login(firebase.auth().currentUser));
			this.props.dispatch(push(this.props.next || '/dashboard'));
			this.props.dispatch(resetNext());
		});
	}

	render() {
		// var errors = this.state.error ? <p> {this.state.error} </p> : '';
		const { quantity, fullname } = this.state;
		const firstname = fullname.split(' ')[0];
		return (
			<div className="container" style={{minHeight: 'calc(100vh - 72px)'}}>
				<div className="row pb-5">
					<div className="col-md-6 p-5 d-flex justify-content-center">
						<div className="auth-form">
							<div className={classnames('form-wizard-step', 'form-wizard-step-payment')}>
								<div className="text-center form-title col-md-9 m-auto mb-5">How many resumes would you like to start off with {firstname}?
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

export default connect()(Payment);