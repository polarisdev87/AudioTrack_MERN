import React  from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { NotificationManager } from 'react-notifications';
const ContentEditable = require("react-contenteditable");
import $ from 'jquery';

class ResumeEditTitle extends React.Component {
	state = {
		user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		resume: null,
		editable: false,
		resume_title: ''
	};

	componentWillMount() {
    const { resume_id } = this.props.params;
    this.setState({ resume_id });
    firebase.database().ref('/resumes/'+resume_id).once('value', (snapshot) => {
    	const resume = snapshot.val();
    	this.setState({ resume: {...resume, resume_id}, resume_title: resume.title });
    })
	}

  handleChange = (e) => {
    this.setState({resume_title: e.target.value});
  }

  handleKeyPress = (e) => {
  	if(e.which === 13) {
  		$(".resume-title").blur();
  		e.preventDefault();
  	}
  }

	updateTitle = () => {
		if(!this.state.resume_title.trim()) {
			this.setState({ resume_title: this.state.resume.title});
		} else {
			if(this.state.resume_title !== this.state.resume.title) {
				let updates = {};
				updates['/resumes/' + this.state.resume.resume_id + '/title'] = this.state.resume_title || this.state.resume.title;
				updates['/users/' + this.state.user.uid + '/resumes/' + this.state.resume.resume_id + '/title'] = this.state.resume_title || this.state.resume.title;
				firebase.database().ref().update(updates).then(() => {
					this.setState({ resume: {...this.state.resume, title: this.state.resume_title}});
			  	NotificationManager.success('Resume Title successfully updated', '');
				});
			}
		}
	}

	render() {
		const { resume, editable, resume_title } = this.state;
		if(!resume) return null;
		return (
			<div className="resume-edit-title-container">
				<span>Title: </span><ContentEditable className="resume-title" html={resume_title} disabled={editable} onKeyPress={(e) => {this.handleKeyPress(e)}} onChange={(e) => {this.handleChange(e)}} onBlur={this.updateTitle} />
			</div>
		);
	}
}

export default connect()(ResumeEditTitle);


