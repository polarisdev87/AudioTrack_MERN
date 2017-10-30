import React  from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { NotificationManager } from 'react-notifications';
const ContentEditable = require("react-contenteditable");
import $ from 'jquery';

class ResumeEditLink extends React.Component {
	state = {
		user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		resume: null,
		editable: false,
		resume_link: ''
	};

	componentWillMount() {
    const { resume_id } = this.props.params;
    firebase.database().ref('/resumes/'+resume_id).once('value', (snapshot) => {
    	const resume = snapshot.val();
    	this.setState({ resume: {...resume, resume_id}, resume_link: resume.link });
    })
	}

  handleChange = (e) => {
    this.setState({resume_link: e.target.value});
  }

  handleKeyPress = (e) => {
  	if(e.which === 13) {
  		$(".resume-link").blur();
  		e.preventDefault();
  	}
  }

  validateResume = () => {
    const { resume, resume_link } = this.state;
    return new Promise((resolve, reject) => {
      firebase.database().ref().child('resumes').once('value', (snapshot) => {
        let resumes = [];
        snapshot.forEach((childSnapshot) => {
          resumes.push({...childSnapshot.val(), resume_id: childSnapshot.key});
        });
        resumes.every((r) => {
          if(r.resume_id !== resume.resume_id && r.published===true) {
            if(resume_link === r.link) {
              reject();
              return false;
            }
          }
          return true;
        });
        resolve();
      });
    });
  }

	updateLink = () => {
		if(!this.state.resume_link.trim()) {
			this.setState({ resume_link: this.state.resume.link});
		} else {
			if(this.state.resume_link !== this.state.resume.link) {
				this.validateResume().then(() => {
					let updates = {};
					updates['/resumes/' + this.state.resume.resume_id + '/link'] = this.state.resume_link || this.state.resume.link;
					updates['/resumes/' + this.state.resume.resume_id + '/link_modified'] = true
					updates['/users/' + this.state.user.uid + '/resumes/' + this.state.resume.resume_id + '/link'] = this.state.resume_link || this.state.resume.link;
					updates['/users/' + this.state.user.uid + '/resumes/' + this.state.resume.resume_id + '/link_modified'] = true;
					firebase.database().ref().update(updates).then(() => {
						this.setState({ resume: {...this.state.resume, link: this.state.resume_link}});
				  	NotificationManager.success('Resume Link successfully updated', '');
					});
				}).catch((e) => {
      		NotificationManager.error('Duplicate Link exists...', 'Cannot publish this resume.');
					this.setState({ resume_link: this.state.resume.link});
				});
			}
		}
	}

	render() {
		const { resume, editable, resume_link } = this.state;
		if(!resume) return null;
		return (
			<div className="resume-edit-link-container">
				<span>www.cezan.co/r/</span><ContentEditable className="resume-link" html={resume_link} disabled={editable} onKeyPress={(e) => {this.handleKeyPress(e)}} onChange={(e) => {this.handleChange(e)}} onBlur={this.updateLink} />
			</div>
		);
	}
}

export default connect()(ResumeEditLink);
