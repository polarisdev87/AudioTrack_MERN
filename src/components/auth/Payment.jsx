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
import { NotificationManager } from 'react-notifications';

class _CardForm extends React.Component<{stripe: StripeProps}> {
	state = {
		step: 0
	};

  handleSubmit = ev => {
    ev.preventDefault();
    this.setState({ step: 1 });
    this.props.stripe.createToken().then(payload => {
    	if(payload.error) {
    		this.setState({ step: 0 });
  			NotificationManager.error(payload.error.message, '');
    		return false;
    	}
    	this.setState({ step: 2 });
    	axios.post(serverUrl + '/checkout', {
    			params: {
					  amount: 300 * this.props.quantity,
					  currency: 'usd',
					  description: this.props.quantity + 'credits are succssfully delivered to you.',
  					receipt_email: this.props.customer,
					  source: payload.token.id,
					}
				}).then((res) => {
					if(res.data.type === 'fail') {
	  				NotificationManager.error(res.data.message, '');
						this.setState({ step: 0 });
					} else {
						this.setState({ step: 3 });
	  				NotificationManager.success('Redirecting...', '');
						setTimeout(() => {
							this.props.completeSignUp();
						}, 100)
					}
				})
    }).catch((err) => {
    	this.setState({ step: 0 });
    })
  };

  stepBack = () => {
  	this.props.stepBack();
  }

  render() {
  	const { step } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <CardElement className="stripe-form" />
				<div className="d-flex justify-content-between align-items-center mt-5">
					<a className="btn btn-login white-text" onClick={this.stepBack}>Back</a>
        	<button className="btn btn-login white-text" disabled={step>0}>
        		{
        			(() => {
        				switch(step) {
        					case 0: return `Pay $` + 3*this.props.quantity
        					case 1: return `Checking...`
        					case 2: return `Paying...`
        					case 3: return `Redirecting...`
        					default: return null;
        				}
        			})()
        		}
        	</button>
				</div>
      </form>
    );
  }
}
const CardForm = injectStripe(_CardForm);

class Payment extends React.Component {
	state = {
		error: null,
		quantity: 1,
		user: this.props.user
	};

	componentWillMount() {
		// firebase.database().ref('/users/' + firebase.auth().currentUser.uid).on('value', (snapshot) => {
		// 	this.setState({ fullname: (snapshot.val() && snapshot.val().name) || '' });
		// })
	}

	componentWillUnmount() {
		// firebase.database().ref('/users/' + firebase.auth().currentUser.uid).off();
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ user: { ...this.state.user, ...nextProps.user}});
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
		this.props.dispatch(login(this.state.user));
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
		this.setState({ user: { ...this.state.user, paymentVerified: true, credits: this.state.quantity }});
		firebase.database().ref('/users/' + firebase.auth().currentUser.uid).update({ paymentVerified: true, credits: this.state.quantity }).then(() => {
			this.props.dispatch(login(this.state.user));
			this.props.dispatch(push(this.props.next || '/dashboard'));
			this.props.dispatch(resetNext());
		});
	}

	render() {
		// var errors = this.state.error ? <p> {this.state.error} </p> : '';
		const { quantity, user } = this.state;
		const firstname = ((user && user.displayName) || '').split(' ')[0];
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
					          <CardForm stepBack={this.stepBack} quantity={quantity} customer={user.email} completeSignUp={this.completeSignUp} />
					        </Elements>
					      </div>
							</div>
							<p className="text-center mt-5 font-normal grey-text letter-spacing-4 privacy-terms-links">By signing up you agree with Cezan’s<br/><b><Link to="/privacy-policy" target="_blank">Privacy Policy</Link> and <Link to="/terms" target="_blank">Terms</Link></b></p>
						</div>
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
}))(Payment);
