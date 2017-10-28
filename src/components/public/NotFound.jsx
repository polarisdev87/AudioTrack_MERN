import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class NotFound extends React.Component {
	render() {
		return (
			<div className="not-found">
				<div className="status-404">
					<div className="logo-404"><span>4</span><div className="icon-404"><img src={process.env.PUBLIC_URL + '/assets/img/icons/resume-404-icon.svg'} alt="empty" /></div><span>4</span></div>
					<div className="label-404">Oops. The page you’re looking for doesn’t exist.</div>
					<Link to="/" className="button-404">Back Home</Link>
				</div>
			</div>
		)
	}
}

export default connect()(NotFound);
