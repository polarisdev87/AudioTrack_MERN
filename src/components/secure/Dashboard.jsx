import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Dropzone from 'react-dropzone';
import classnames from 'classnames';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import * as Icon from 'react-feather';
const moment = require('moment');

let dropzoneRef;

class Dashboard extends React.Component {
	state = {
		user: this.props.user,
		accept: 'application/msword, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    files: [],
    resumes: [],
    dropzoneActive: false,
    loaded: false
	};

	componentWillMount() {
		firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/resumes').on('value', (snapshot) => {

			let resumes = [];
		  snapshot.forEach((childSnapshot) => {
		    const childKey = childSnapshot.key;
		    const childData = childSnapshot.val();
		    resumes.push({...childData, resume_id: childKey});
		  });
			this.setState({ loaded: true, resumes});
		});
		// firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/resumes').once('value', (snapshot) => {
		//   snapshot.forEach((childSnapshot) => {
		//     var childKey = childSnapshot.key;
		//     var childData = childSnapshot.val();
		//     console.log(childKey, childData);
		//   });
		// })
	}

	componentWillUnmount() {
		firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/resumes').off();
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
  	console.log(files);
  	const uid = firebase.auth().currentUser.uid;

    files.forEach(file => {
			const storageRef = firebase.storage().ref();
			const uploadTask = storageRef.child('resumes/' + this.state.user.displayName + '_' + (new Date().getTime()) + '_' + file.name).put(file);

			uploadTask.then((snapshot) => {
			  // Upload completed successfully, now we can get the download URL
			  const downloadURL = uploadTask.snapshot.downloadURL;

        firebase.database().ref('/users/' + uid).update({ credits: this.state.user.credits - 1 }).then(() => {
        });

				const newResumeKey = firebase.database().ref().child('resumes').push().key;
				let updates = {};
				const resumeData = {
					uid: uid,
					file: downloadURL,
					views: 0,
					downloads: 0,
					uploaded: new Date(),
					modified: new Date(),
					title: 'New Resume',
					published: false,
					link: ''
				};
				updates['/resumes/' + newResumeKey] = resumeData;
				updates['/users/' + uid + '/resumes/' + newResumeKey] = resumeData;

				firebase.database().ref().update(updates).then(() => {

			    this.setState({
			      files,
			      dropzoneActive: false
			    });  					
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

  resumeDelete = () => {
  	if(confirm("Do you really wanna delete this resume?")) {

  	}
  }

  onResumeDetail = () => {
  	console.log('here');
  }



	render() {
		const { user, loaded, resumes, accept, files, dropzoneActive } = this.state;
    const overlayStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      padding: '2.5em 0',
      background: 'rgba(0,0,0,0.15)'
    };

		return (
      <Dropzone
      	ref={(node) => { dropzoneRef = node; }}
      	className="dashboard-zone-area"
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
        { dropzoneActive && <div style={overlayStyle}></div> }
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
									resumes.map((resume, idx) => <div className="resume-wrapper" key={idx}>
										<div className="resume">
									    <UncontrolledDropdown className="float-right action-delete">
									      <DropdownToggle tag="span"><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-more.svg'} alt="more-delete" /></DropdownToggle>
									      <DropdownMenu>
									        <DropdownItem onClick={this.resumeDelete}>Delete</DropdownItem>
									      </DropdownMenu>
									    </UncontrolledDropdown>
											<div className="resume-info">
												<div className="resume-title-wrapper">
													<div className="resume-title">{resume.title}</div>
													<div className="resume-modified">Modified {moment(resume.modified).format('DD/MM/YYYY')}</div>
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
									</div>)
								}
							</div> }
						</div>
					}
				</div>
      </Dropzone>
		)
	}
}

export default connect(state=>({
	user: state.auth.user
}))(Dashboard);
