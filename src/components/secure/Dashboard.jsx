import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import classnames from 'classnames';
import { Progress } from 'reactstrap';
import { resetNext } from '../../actions/auth';
import { push } from 'react-router-redux';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import ResumeThumbnail from './ResumeThumbnail';

let dropzoneRef, uploadTask;

class Dashboard extends React.Component {
	state = {
		user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		accept: 'application/pdf', //, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    files: [],
    resumes: [],
    dropzoneActive: false,
    loaded: false,
    upload: {
    	status: 0,
    	progress: 0
    }
	};

	componentWillMount() {
		firebase.database().ref('/users/'+this.state.user.uid+'/resumes').on('value', (snapshot) => {
			let resumes = [];
		  snapshot.forEach((childSnapshot) => {
		    const childKey = childSnapshot.key;
		    const childData = childSnapshot.val();
		    resumes.push({...childData, resume_id: childKey});
		  });
			this.setState({ loaded: true, resumes});
		});
	}

	componentWillUnmount() {
		firebase.database().ref('/users/'+this.state.user.uid+'/resumes').off();
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ user: { ...this.state.user, ...nextProps.user}});
	}


  onDragEnter = () => {
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave = () => {
    this.setState({
      dropzoneActive: false
    });
  }

  onDrop = (files) => {
  	const { uid } = this.state.user;
		const newResumeKey = firebase.database().ref().child('resumes').push().key;

    files.forEach(file => {
			const storageRef = firebase.storage().ref();
			uploadTask = storageRef.child('resumes/' + uid + '/' + newResumeKey + '/source.pdf').put(file);


			this.setState({ upload: {...this.state.upload, status: 1}});

	  	NotificationManager.success('Upload started...', '', 3000);
			uploadTask.on('state_changed', (snapshot) => {
			  // Observe state change events such as progress, pause, and resume
			  // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
			  let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			  this.setState({ upload: {...this.state.upload, progress}});
			  // console.log('Upload is ' + progress + '% done');
			  // switch (snapshot.state) {
			  //   case firebase.storage.TaskState.PAUSED: // or 'paused'
			  //     console.log('Upload is paused');
			  //     break;
			  //   case firebase.storage.TaskState.RUNNING: // or 'running'
			  //     console.log('Upload is running');
			  //     break;
			  // }
			}, (error) => {
			  // Handle unsuccessful uploads
			  this.setState({
		      files: [],
		      dropzoneActive: false,
		      upload: { status: 0, progress: 0}
		    });
			}, () => {
			  // Handle successful uploads on complete
			  this.setState({ upload: {...this.state.upload, progress: 100, status: 2}});
			});

			uploadTask.then((snapshot) => {
			  // Upload completed successfully, now we can get the download URL
			  const downloadURL = uploadTask.snapshot.downloadURL;

        // firebase.database().ref('/users/' + uid).update({ credits: this.state.user.credits - 1 }).then(() => {
        // });

				let updates = {};
				const resumeData = {
					uid: uid,
					file: downloadURL,
					views: 0,
					downloads: 0,
					uploaded: new Date(),
					modified: new Date(),
					title: 'Resume ' + this.state.user.lifetime,
					published: false,
					link: ''
				};
				updates['/resumes/' + newResumeKey] = resumeData;
				updates['/users/' + uid + '/resumes/' + newResumeKey] = resumeData;


				firebase.database().ref('/users/' + uid).update({ lifetime: this.state.user.lifetime+1 }).then(() => {
				});

	  		NotificationManager.success('Resume registered successfully', '', 3000);
				firebase.database().ref().update(updates).then(() => {

			    this.setState({
			      files,
			      dropzoneActive: false,
			      upload: {...this.state.upload, progress: 0, status: 0}
			    });

					this.props.dispatch(push(this.props.next || '/resume/'+newResumeKey));
					this.props.dispatch(resetNext());
				});

			});

    });
  }

  onOpenFileDialog = () => {
  	if(this.state.user.credits > 0) {
	  	dropzoneRef.open();
	    this.setState({
	      dropzoneActive: true
	    });
	  }
  }

  onFileDialogCancel = () => {
    this.setState({
      dropzoneActive: false
    });
  }

  resumeCancelUpload = () => {
  	uploadTask.cancel();
	  NotificationManager.error('Upload cancelled by user...', '', 3000);
  }



	render() {
		const { user, loaded, resumes, accept, dropzoneActive, upload } = this.state;

		return (
      <Dropzone
      	ref={(node) => { dropzoneRef = node; }}
      	className={classnames('dashboard-zone-area', {'empty': resumes.length === 0})}
        disableClick
        multiple={false}
        style={{position: "relative"}}
        accept={accept}
        onDrop={this.onDrop}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        onFileDialogCancel={this.onFileDialogCancel}
        disabled={user.credits === 0}
      >
				<div className="container dashboard-container">
					<div className="dashboard-toolbar">
						<a className="btn-upload-resume" onClick={this.onOpenFileDialog}><span>Upload Resume</span></a>
					</div>
					{ loaded &&
						<div className={classnames('resumes-container', {'empty': resumes.length === 0})}>

							{ resumes.length === 0 && <div className="resumes-empty">
								<div className="resume-empty-state-icon"><img src={process.env.PUBLIC_URL + '/assets/img/icons/resume-empty-state-icon.svg'} alt="empty" /></div>
								<div className="empty-resumes-title">My Resumes</div>
								<div className="empty-resumes-label">All of your resumes will be located here. Drag and drop your resume to get started!</div>
							</div> }
							{ resumes && <div className="resumes-list">
								{
									resumes.map((resume, idx) => <ResumeThumbnail resume={resume} key={idx} {...this.props} />)
								}
							</div> }
						</div>
					}
				</div>
        { dropzoneActive && (
        	<div className="resume-uploading-overlay d-flex align-items-center justify-content-center">
        		<div className="container">
      			{ upload.status>0 && (
      				<div className="resume-uploading-container">
      					<Progress animated color="danger" value={upload.progress} />
      					<div className="resume-uploading-actions">
      						<button className="btn-cancel-upload" onClick={this.resumeCancelUpload}>Cancel</button>
      					</div>
      				</div>
      			) }
      			</div>
					</div>
				) }
        <NotificationContainer/>
      </Dropzone>
		)
	}
}

export default connect(state=>({
	user: state.auth.user
}))(Dashboard);
