import React  from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import * as firebase from 'firebase';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import * as Icon from 'react-feather';
import { push } from 'react-router-redux';
import {NotificationManager} from 'react-notifications';
const moment = require('moment');

class ResumeThumbnail extends React.Component {
	state = {
		user: {...this.props.user, uid: firebase.auth().currentUser.uid}
	};

  resumeDelete = (resume) => {
  	if(confirm("Do you really wanna delete this resume?")) {
  		let updates = {};
			updates['/resumes/' + resume.resume_id] = null;
			updates['/users/' + this.state.user.uid + '/resumes/' + resume.resume_id] = null;
			firebase.database().ref().update(updates).then(() => {
	  		NotificationManager.success('Resume successfully deleted', '', 3000);
			});
  	}
  }

  onResumeDetail = (resume) => {
		this.props.dispatch(push(this.props.next || '/resume/'+resume.resume_id));
  }

	onClickEdit = () => {

	}

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
							<div className="resume-title" onClick={this.onClickEdit}>{resume.title}</div>
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

