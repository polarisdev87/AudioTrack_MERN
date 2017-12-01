import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { Button, Modal } from 'reactstrap';
import classnames from 'classnames';
import { NotificationManager } from 'react-notifications';
import { CardElement, Elements, injectStripe } from 'react-stripe-elements';
import axios from 'axios';
import { serverUrl } from '../../../config';
import * as Icon from 'react-feather';

class _CardForm extends React.Component<{stripe: StripeProps}> {
  state = {
    step: 0,
    quantity: 1
  };

  componentWillMount() {
    this.setState({
      quantity: this.props.quantity || 1
    })
  }

  quantityUp() {
    this.setState({ quantity: this.state.quantity+1 })
  }

  quantityDown() {
    this.setState({ quantity: Math.max(this.state.quantity-1, 1) })
  }

  handleSubmit = ev => {
    ev.preventDefault();
    const { quantity } = this.state;
    const { user } = this.props;
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
            amount: 300 * quantity,
            currency: 'usd',
            description: 'We added ' + quantity + ' Resume Credit' + (quantity===1?'':'s') + ' to your account.',
            receipt_email: user.email,
            source: payload.token.id,
          }
        }).then((res) => {
          if(res.data.type === 'fail') {
            NotificationManager.error(res.data.message, '');
            this.setState({ step: 0 });
          } else {
            this.setState({ step: 3 });
            NotificationManager.success('Adding Credits...', '');
            firebase.database().ref('/users/' + firebase.auth().currentUser.uid).update({ credits: user.credits + quantity }).then(() => {
              NotificationManager.success(quantity + ' Credits added successfully.', '');
              this.props.onComplete();
            });
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
    const { step, quantity } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="modal-buy-credit-control-container">
          <div className="modal-buy-credit-label">Buy more credits!</div>
          <div className="price-control">
            <span className="control control-down p-1" onClick={this.quantityDown.bind(this)}><Icon.ChevronDown /></span>
            <span className="quantity">{quantity}</span>
            <span className="control control-up p-1" onClick={this.quantityUp.bind(this)}><Icon.ChevronUp /></span>
          </div>
          <CardElement className="stripe-form" />
        </div>
        <div className="d-flex justify-content-between align-items-center modal-buy-credit-button-container">
          <button className="btn btn-login white-text" disabled={step>0}>
            {
              (() => {
                switch(step) {
                  case 0: return `Pay $` + 3*quantity
                  case 1: return `Checking...`
                  case 2: return `Paying...`
                  case 3: return `Closing...`
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

class ButtonBuyCredit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    const { user } = this.props;
    return (
      <div className={classnames('buy-credit-container', {'display-none': !this.props.showBox })}>
        <Button className="btn-buy-credit" onClick={this.toggle}>{user.credits} Credits Left</Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={classnames(this.props.className, 'modal-buy-credit')}>
          <div className="modal-buy-credit-content">
            <div className="modal-buy-credit-form">
              <Elements stripe={this.props.stripeInstance}>
                <CardForm quantity={1} user={user} onComplete={this.toggle}/>
              </Elements>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default connect(state=>({
  user: state.auth.user
}))(ButtonBuyCredit);
