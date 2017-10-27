import React  from 'react';
import * as Icon from 'react-feather';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class ResumeLink extends React.Component {
	componentDidMount() {
	}

	render() {
    const { resume_id } = this.props.params;
		return (
			<div className="resume-link-container">
        <Icon.ChevronLeft />
        <Link to={'/r/'+resume_id}><span className="resume-url-muted">www.cezan.co/r/</span><span className="resume-url-active">{resume_id}</span></Link>
			</div>
		);
	}
}

export default connect()(ResumeLink);
