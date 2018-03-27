import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

class ProfileBox extends React.Component {

	componentWillMount() {
	}
	componentWillUnmount() {
	}

	render() {
		const { user } = this.props;
		if (!user.email) {
			return <div/>;
		}
		return (
			<div className="profilebox-container">
		    <UncontrolledDropdown>
		      <DropdownToggle tag="span" className="profilebox-trigger">
		      	<img src={user.photoUrl} alt={user.displayName} />
		      </DropdownToggle>
		      <DropdownMenu className="profilebox-links">
		        <DropdownItem><Link to="/profile">My Account</Link></DropdownItem>
		        <DropdownItem divider />
		        <DropdownItem><Link to="/logout">Logout</Link></DropdownItem>
		      </DropdownMenu>
		    </UncontrolledDropdown>
		  </div>
		)
	}
}

export default connect(state=>({
	user: state.auth.user || {}
}))(ProfileBox);
