import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router';
import Scrollchor from 'react-scrollchor';

class HeaderNav extends React.Component {
	render() {
    const { loaded } = this.props;
    const isHome = this.props.location.pathname === '/';
    const isLogin = this.props.location.pathname === '/login';
    const isSignup = this.props.location.pathname === '/signup';
    const isForgot = this.props.location.pathname === '/forgot';
    const isConfirm = this.props.location.pathname === '/confirm';
    const isPayment = this.props.location.pathname === '/payment';
    const isAuthenticated = this.props.user !== null;
		return (
			<nav className="navbar navbar-expand-lg navbar-light bg-white rounded header-nav">
        <div className="container">
          <Link to={ isAuthenticated ? '/dashboard' : '/' } className="navbar-brand ml-5 mr-5">CEZAN</Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          { !loaded ?
            null
          : (
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav mr-auto ml-5 nav-links">
                { isHome ? [
                  <li className="nav-item" key='features'>
                    <Scrollchor to="#features" className="nav-link">Features</Scrollchor>
                  </li>,
                  <li className="nav-item" key='pricing'>
                    <Scrollchor to="#pricing" className="nav-link">Pricing</Scrollchor>
                  </li>
                ] : '' }
                { isLogin ? (
                  <li className="nav-item" key='login'>
                    <Link to="/login" className="nav-link active">Login</Link>
                  </li>
                ) : ''}
                { isSignup || isPayment ? (
                  <li className="nav-item" key='signup'>
                    <Link to="/signup" className="nav-link active">Sign Up</Link>
                  </li>
                ) : ''}
                { isForgot ? (
                  <li className="nav-item" key='forgot'>
                    <Link to="/forgot" className="nav-link active">Forgot Password</Link>
                  </li>
                ) : ''}
                { isConfirm ? (
                  <li className="nav-item" key='forgot'>
                    <Link to="/signup" className="nav-link active">Sign Up</Link>
                  </li>
                ) : ''}
              </ul>
              <div className="navbar-right nav-links">
                { isLogin ? (
                  <Link to='/signup' className="nav-link single-action">Don’t have an account? Sign up!</Link>
                ) : ''}
                { isSignup || isPayment ? (
                  <Link to='/login' className="nav-link single-action">Have an account? Sign in!</Link>
                ) : ''}
                { isForgot || isConfirm ? (
                  <Link to='/login' className="nav-link single-action">Login</Link>
                ) : ''}
                { isHome ? (
                  <div className="inline-buttons">
                    <Link to="/login" className="btn btn-login">Login</Link>
                    <Link to="/signup" className="btn btn-signup">Sign Up</Link>
                  </div>
                ) : ''}
              </div>
              </div>
          )}
        </div>
      </nav>
		)
	}
}

export default connect()(HeaderNav);
