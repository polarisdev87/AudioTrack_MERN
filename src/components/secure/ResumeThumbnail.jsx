import React  from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import * as firebase from 'firebase';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import * as Icon from 'react-feather';
import { push } from 'react-router-redux';
import { resetNext } from '../../actions/auth';
import { NotificationManager } from 'react-notifications';
const moment = require('moment');
const ContentEditable = require("react-contenteditable");
import $ from 'jquery';

class ResumeThumbnail extends React.Component {
	state = {
		user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		resume_title: this.props.resume.title
	};

  resumeDelete = (resume) => {
  	if(confirm("Do you really wanna delete this resume?")) {
  		let updates = {};
			updates['/resumes/' + resume.resume_id] = null;
			updates['/users/' + this.state.user.uid + '/resumes/' + resume.resume_id] = null;
      firebase.database().ref().update(updates).then(() => {
        firebase.storage().ref().child('resumes/' + this.state.user.uid + '/' + resume.resume_id + '/source.pdf').delete().then(() => {
          this.props.dispatch(push(this.props.next || '/dashboard'));
          this.props.dispatch(resetNext());
        })
      });
			firebase.database().ref().update(updates).then(() => {
	  		NotificationManager.success('Resume successfully deleted', '');
			});
  	}
  }

  handleKeyPress = (e) => {
  	if(e.which === 13) {
  		$(".resume-title").blur();
  		e.preventDefault();
  	}
  }

  handleChange = (e) => {
    this.setState({resume_title: e.target.value});
  }

  onResumeDetail = (resume) => {
		this.props.dispatch(push(this.props.next || '/resume/'+resume.resume_id));
  }

	updateTitle = () => {
		if(!this.state.resume_title.trim()) {
			this.setState({ resume_title: this.props.resume.title});
		} else {
			if(this.state.resume_title !== this.props.resume.title) {
				let updates = {};
				updates['/resumes/' + this.props.resume.resume_id + '/title'] = this.state.resume_title || this.props.resume.title;
				updates['/users/' + this.state.user.uid + '/resumes/' + this.props.resume.resume_id + '/title'] = this.state.resume_title || this.props.resume.title;
				firebase.database().ref().update(updates).then(() => {
					this.setState({ resume: {...this.state.resume, title: this.state.resume_title}});
			  	NotificationManager.success('Resume Title successfully updated', '');
				});
			}
		}
	}

	render() {
		const { resume } = this.props;
		const { resume_title } = this.state;
		// const titleProps = editable ? {
		// 	contentEditable: true,
		// 	onBlur: this.updateTitle
		// } : {
		// 	onClick: this.onClickEdit
		// };
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
							<ContentEditable className="resume-title" html={resume_title} onKeyPress={(e) => {this.handleKeyPress(e)}} onChange={(e) => {this.handleChange(e)}} onBlur={this.updateTitle} />
							{/*<div className="resume-title" {...titleProps}>{resume.title}</div>*/}
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
							{ resume.published && <Link className="resume-link" to={'/r/'+resume.link} target="_blank"><Icon.Link2 size={20} /></Link> }
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

