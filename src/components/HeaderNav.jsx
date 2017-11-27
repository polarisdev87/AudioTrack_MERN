import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router';
import Scrollchor from 'react-scrollchor';
import { Collapse, NavbarToggler } from 'reactstrap';
import ButtonBuyCredit from './header/ButtonBuyCredit';
import ActivityBox from './header/ActivityBox';
import ProfileBox from './header/ProfileBox';
import ResumePreviewLink from './header/ResumePreviewLink';
import ResumeEditTitle from './header/ResumeEditTitle';
import ResumeEditLink from './header/ResumeEditLink';
import classnames from 'classnames';
import $ from 'jquery';

class HeaderNav extends React.Component {
  state = {
    isOpen: false
  };
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  componentDidMount() {
    $(document).on('click', (e) => {
      if($(e.target).hasClass('nav-link') || $(e.target).hasClass('btn-login') || $(e.target).hasClass('btn-signup')) {
        $('.header-collapse.show').removeClass('show');
      }
    })
  }

	render() {
    const { loaded, user } = this.props;
    const { pathname } = this.props.location;
    const isHome = pathname === '/';
    const isLogin = pathname === '/login';
    const isSignup = pathname === '/signup';
    const isForgot = pathname === '/forgot';
    const isConfirm = pathname === '/confirm';
    const isPayment = pathname === '/payment';
    const isDashboard = pathname === '/dashboard';
    const isProfile = pathname === '/profile';
    const isResume = pathname.indexOf('/resume/') === 0;
    const isResumeEdit = pathname.indexOf('/edit/') === 0;
    const isResumePreview = pathname.indexOf('/preview/') === 0;
    const isResumePublished = pathname.indexOf('/r/') === 0;
    const isAuthenticated = user !== null;

    if(isResumePreview) {
      return null;
    }
		return (
			<nav className="navbar navbar-expand-md navbar-light bg-white header-nav fixed-top">
        <div className="container">
          <Link to={ isAuthenticated ? '/dashboard' : '/' } className="navbar-brand ml-5 mr-5">CEZAN</Link>
          <NavbarToggler onClick={this.toggle.bind(this)} />

          { !loaded ?
            null
          : (
            <Collapse isOpen={this.state.isOpen} navbar className="header-collapse">
              <ul className={classnames('navbar-nav', 'ml-5', 'nav-links', {'mr-auto': !isResume}, {'m-auto': isResume})}>
                { isHome ? [
                  <li className="nav-item" key='features'>
                    <Scrollchor to="#features" className="nav-link">Features</Scrollchor>
                  </li>,
                  <li className="nav-item" key='pricing'>
                    <Scrollchor to="#pricing" className="nav-link">Pricing</Scrollchor>
                  </li>
                ] : null }
                { isLogin ? (
                  <li className="nav-item">
                    <Link to="/login" className="nav-link active">Login</Link>
                  </li>
                ) : null }
                { isSignup || isPayment || isConfirm ? (
                  <li className="nav-item">
                    <Link to="/signup" className="nav-link active">Sign Up</Link>
                  </li>
                ) : null }
                { isForgot ? (
                  <li className="nav-item">
                    <Link to="/forgot" className="nav-link active">Forgot Password</Link>
                  </li>
                ) : null }
                { isDashboard ? (
                  <li className="nav-item">
                    <Link to="/dashboard" className="nav-link active with-top-border">My Resumes</Link> 
                  </li>
                ) : null }
                { isResume ? <ResumePreviewLink {...this.props} /> : null }
                { isResumeEdit ? <ResumeEditTitle {...this.props} /> : null}
              </ul>
              { isResumeEdit ? <div className="header-center-container"><ResumeEditLink {...this.props} /></div> : null}
              <div className="navbar-right nav-links">
                { isLogin ? (
                  <Link to='/signup' className="nav-link single-action">Don’t have an account? Sign up!</Link>
                ) : null }
                { isSignup || isPayment ? (
                  <Link to='/login' className="nav-link single-action">Have an account? Sign in!</Link>
                ) : null }
                { isForgot || isConfirm ? (
                  <Link to='/login' className="nav-link single-action">Login</Link>
                ) : null }
                { isHome ? (
                  <div className="inline-buttons">
                    <Link to="/login" className="btn btn-login">Login</Link>
                    <Link to="/signup" className="btn btn-signup">Sign Up</Link>
                  </div>
                ) : null }
                { isDashboard || isProfile ? [
                  <ButtonBuyCredit { ...this.props } key="button-buy-credit" />,
                  <ActivityBox type="all" key="activity-box-all" { ...this.props } />
                ] : null }
                { isResume ? [
                  <ActivityBox type="view" key="activity-box-view" { ...this.props } />,
                  <ActivityBox type="download" key="activity-box-download" { ...this.props } />
                ] : null }
                { isDashboard || isProfile || isResume || isResumeEdit || isResumePreview || isResumePublished ? (
                  <ProfileBox key="profile-box" />
                ) : null }
              </div>
            </Collapse>
          )}
        </div>
      </nav>
		)
	}
}

export default connect(state=>({
  user: state.auth.user
}))(HeaderNav);
