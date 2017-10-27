import React  from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import * as Icon from 'react-feather';
const moment = require('moment');

class ResumeThumbnail extends React.Component {

	render() {
		const { resume } = this.props;
		return (
			<div className="resume-wrapper">
				<div className="resume">
			    <div className="resume-overlay" onClick={() => {this.onResumeDetail(resume)}} />
			    <UncontrolledDropdown className="float-right action-delete">
			      <DropdownToggle tag="span"><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-more.svg'} alt="more-delete" /></DropdownToggle>
			      <DropdownMenu>
			        <DropdownItem onClick={() => {this.resumeDelete(resume)}}>Delete</DropdownItem>
			      </DropdownMenu>
			    </UncontrolledDropdown>
					<div className="resume-info">
						<div className="resume-title-wrapper">
							<div className="resume-title">{resume.title}</div>
							<div className="resume-modified">Modified {moment(resume.modified).format('MM/DD/YYYY')}</div>
						</div>
						<div className="resume-actions">
							<div className="resume-state">
								<div className="resume-views">
									<Icon.Eye size={20} /><span>{resume.views}</span>
								</div>
								<div className="resume-downloads">
									<Icon.Download size={20} /><span>{resume.downloads}</span>
								</div>
							</div>
							{ resume.link && <Link className="resume-link" to={resume.link}><Icon.Link2 size={20} /></Link> }
						</div>
					</div>
				</div>
			</div>
		);
	}
}


export default connect(state=>({
	user: state.auth.user
}))(ResumeThumbnail);

