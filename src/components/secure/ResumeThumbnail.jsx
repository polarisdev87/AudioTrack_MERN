import React  from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import * as firebase from 'firebase';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal } from 'reactstrap';
import * as Icon from 'react-feather';
import { push } from 'react-router-redux';
import { resetNext } from '../../actions/auth';
import { NotificationManager } from 'react-notifications';
import classnames from 'classnames';
const moment = require('moment');
const ContentEditable = require("react-contenteditable");
import $ from 'jquery';

class ResumeThumbnail extends React.Component {
	state = {
		user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		resume_title: this.props.resume.title,
    modal_confirm_delete: false
	};

  onDeleteResume = () => {
		const { resume } = this.props;
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

  toggleConfirmDelete = () => {
    this.setState({
      modal_confirm_delete: !this.state.modal_confirm_delete
    });
  }

  confirmDelete = () => {
    this.onDeleteResume();
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
				let modifiedTime = new Date();
				updates['/resumes/' + this.props.resume.resume_id + '/title'] = this.state.resume_title || this.props.resume.title;
				updates['/users/' + this.state.user.uid + '/resumes/' + this.props.resume.resume_id + '/title'] = this.state.resume_title || this.props.resume.title;
				updates['/resumes/' + this.props.resume.resume_id + '/modified'] = modifiedTime;
				updates['/users/' + this.props.resume.uid + '/resumes/' + this.props.resume.resume_id + '/modified'] = modifiedTime;
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
		return (
			<div className="resume-wrapper">
				<div className="resume">
			    <div className="resume-overlay" onClick={() => {this.onResumeDetail(resume)}} />
			    <UncontrolledDropdown className="float-right action-delete">
			      <DropdownToggle tag="span"><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-more.svg'} alt="more-delete" /></DropdownToggle>
			      <DropdownMenu>
			        <DropdownItem onClick={this.toggleConfirmDelete}>Delete</DropdownItem>
			      </DropdownMenu>
			    </UncontrolledDropdown>
          <Modal isOpen={this.state.modal_confirm_delete} toggle={this.toggleConfirmDelete} className={classnames(this.props.className, 'modal-confirm-delete-resume')}>
            <div className="modal-confirm-delete-content">
              <div className="d-flex flex-column align-items-center">
                <div className="font-18 weight-600 letter-spacing-4 black-text">Heads Up!</div>
                <div className="font-15 weight-300 letter-spacing-3 black-text mt-5">By deleting your resume all data pretained to it and your link will no longer be avaliable. </div>
              </div>
              <button className="btn btn-confirm-delete mt-5" onClick={this.confirmDelete}>Delete Forever</button>
            </div>
          </Modal>
					<div className="resume-info">
						<div className="resume-title-wrapper">
							<ContentEditable className="resume-title" html={resume_title} onKeyPress={(e) => {this.handleKeyPress(e)}} onChange={(e) => {this.handleChange(e)}} onBlur={this.updateTitle} />
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
	next: state.auth.next,
	user: state.auth.user
}))(ResumeThumbnail);
