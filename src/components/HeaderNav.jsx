import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router';
import Scrollchor from 'react-scrollchor';

class HeaderNav extends React.Component {
	render() {
    const isHome = this.props.location.pathname === '/';
		return (
			<nav className="navbar navbar-expand-lg navbar-light bg-white rounded header-nav">
        <div className="container">
          <Link to="/" className="navbar-brand ml-5 mr-5">CEZAN</Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto ml-5">
              { isHome ? [
                <li className="nav-item" key='features'>
                  <Scrollchor to="#features" className="nav-link">Features</Scrollchor>
                </li>,
                <li className="nav-item" key='pricing'>
                  <Scrollchor to="#pricing" className="nav-link">Pricing</Scrollchor>
                </li>
              ] : '' }
            </ul>
            <div className="navbar-right">
            	<div className="inline-buttons">
  	          	<Link to="/login" className="nav-link btn btn-login">Login</Link>
  	          	<Link to="/signup" className="nav-link btn btn-signup">Sign Up</Link>
  	          </div>
            </div>
          </div>
        </div>
      </nav>
		)
	}
}

export default connect()(HeaderNav);
