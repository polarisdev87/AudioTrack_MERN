import React from 'react';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { connect } from 'react-redux';
import { FormGroup, Label, Input, Modal } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import Dropzone from 'react-dropzone';
import { resetNext } from '../../actions/auth';
import { push } from 'react-router-redux';
import classnames from 'classnames';
import * as Icon from 'react-feather';

let dropzoneRef, uploadTask;

class Profile extends React.Component {
	state = {
		...this.props.user,
		uid: firebase.auth().currentUser.uid,
		password: '',
		verify_password: '',
		old_user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		modal_verify_credentials: false,
		modal_confirm_delete: false,
		confirm_delete: '',
		mode: ''
	};

	componentWillReceiveProps(nextProps) {
		this.setState({...nextProps.user});
	}

  toggleVerifyCredentials = () => {
    this.setState({
      modal_verify_credentials: !this.state.modal_verify_credentials
    });
    if(!this.state.modal_verify_credentials) {
    	this.setState({ verify_password: '' });
    }
  }

  toggleConfirmDelete = () => {
    this.setState({
      modal_confirm_delete: !this.state.modal_confirm_delete
    });
    if(!this.state.modal_confirm_delete) {
    	this.setState({ confirm_delete: '' });
    }
  }

	onInputChange(name, event) {
		var change = {};
		change[name] = event.target.value;
		this.setState(change);
	}

  onDrop = (files) => {

  	const { uid } = this.state;

    files.forEach(file => {
			const storageRef = firebase.storage().ref();
			uploadTask = storageRef.child('profile/' + uid + '.png').put(file);

	  	NotificationManager.success('Upload started...', '');

			uploadTask.then((snapshot) => {
			  // Upload completed successfully, now we can get the download URL
			  const downloadURL = uploadTask.snapshot.downloadURL;

	  		NotificationManager.success('Updating Profile...', '');

	  		let promise_list = [];
	  		promise_list.push(firebase.auth().currentUser.updateProfile({ photoURL: downloadURL }));
				promise_list.push(firebase.firestore().doc('/users/' + uid).set({ photoUrl: downloadURL }, {merge: true}))

				Promise.all([...promise_list]).then(() => {
	  			NotificationManager.success('Profile updated successfully', '');
					this.props.dispatch(push(this.props.next || '/profile'));
				});

			});

    });
  }

  onChangePassword = () => {
  	this.toggleVerifyCredentials();
  	this.setState({ mode: 'password'});
  }

  onUpdateProfile = () => {
  	this.toggleVerifyCredentials();
  	this.setState({ mode: 'email'});
  }

  verifyCredentials = () => {
		const { email, verify_password, password, mode, displayName, old_user, uid } = this.state;
		const user = firebase.auth().currentUser;
		let credential;
		credential = firebase.auth.EmailAuthProvider.credential(old_user.email, verify_password);
		user.reauthenticateWithCredential(credential).then(() => {
		  // User re-authenticated.

		  if(mode === 'password') {
				user.updatePassword(password).then(() => {
			  	NotificationManager.success('Password changed successfully', '');
			  	this.setState({ password: '' });
			  	this.toggleVerifyCredentials();
				}).catch((error) => {
			  	NotificationManager.error('Error occured while changing password', '');
			  	this.setState({ password: '' });
			  	this.toggleVerifyCredentials();
				});
			} else if(mode === 'email') {
		  	let promise_list = [];
		  	let batch = firebase.firestore().batch();
		  	// let updates = {};
				if(old_user.displayName !== displayName) {
					// updates['/users/' + uid + '/displayName'] = displayName;
					batch.set(firebase.firestore().doc('/users/' + uid), {
						displayName: displayName
					}, {merge: true});
					promise_list.push(user.updateProfile({ displayName }));
				}
				if(old_user.email !== email) {
					// updates['/users/' + uid + '/email'] = email;
					batch.set(firebase.firestore().doc('/users/' + uid), {
						email: email,
					}, {merge: true});
					promise_list.push(user.updateEmail(email));
				}
				promise_list.push(batch.commit());
				Promise.all([...promise_list]).then(() => {
			  	NotificationManager.success('Profile updated successfully', '');
			  	this.toggleVerifyCredentials();
				}).catch(() => {
			  	NotificationManager.error('Error occured while updating profile.', '');
			  	this.toggleVerifyCredentials();
				});
			} else {
				this.onDeleteAccount();
			}
		}).catch((error) => {
		  // An error happened.
	  	NotificationManager.error('Password is wrong, please try again ...', '');
		});
  }

  onDeleteAccount = () => {
		const { uid } = this.state;
		const resumes = this.props.user.resumes || [];

		const storageRef = firebase.storage().ref();

		let promise_list = [];

		for (let resume_id in resumes) {
	    if (!resumes.hasOwnProperty(resume_id)) continue;

			let resumeRef = storageRef.child('resumes/' + uid + '/' + resume_id + '/source.pdf');
			promise_list.push(resumeRef.delete());

      // let updates = {};
      // updates['/resumes/' + resume_id] = null;
      let batch = firebase.firestore().batch();
      batch.delete(firebase.firestore().doc('/resumes/' + resume_id));
      promise_list.push(batch.commit());
		}

		let profileRef = storageRef.child('profile/' + uid + '.png');
		profileRef.delete().then(() => {}).catch((e) => {});

		promise_list.push(firebase.auth().currentUser.delete());

    // let updates = {};
    // updates['/users/' + uid] = null;
    let batch = firebase.firestore().batch();
    batch.delete(firebase.firestore().doc('/users/' + uid));
    promise_list.push(batch.commit());

    Promise.all([...promise_list]).then(() => {
  		NotificationManager.success('Account deleted...', '');
			this.props.dispatch(push(this.props.next || '/'));
			this.props.dispatch(resetNext());
    });
  }

	confirmDelete = () => {
		if(this.state.signInMethod === 'google') {
			let provider = new firebase.auth.GoogleAuthProvider();
			provider.addScope('profile');
			provider.addScope('email');
			this.toggleConfirmDelete();
	  	NotificationManager.success('Checking with Google Provider...', '');
			firebase.auth().signInWithPopup(provider).then((result) => {
				const user = result.user;
				user.reauthenticateWithCredential(result.credential).then(() => {
	  			NotificationManager.success('Deleting Account...', '');
					this.onDeleteAccount();
				});
			});
		} else {
			this.toggleConfirmDelete();
	  	this.toggleVerifyCredentials();
	  	this.setState({ mode: 'delete'});
		}
	}

	render() {
		const { signInMethod, email, password, displayName, photoUrl, old_user, verify_password, confirm_delete } = this.state;
		return (
			<div className="container profile-container">

				<div className="profile-section">
					<h2 className="mt-5 mb-5">Account Information</h2>
					<div className="row justify-content-between mt-5 mb-5">
						<div className="col-sm-5 d-flex align-items-center">
							<div className="profile-img-upload">
							  <Dropzone ref={(node) => { dropzoneRef = node; }} accept="image/*" onDrop={this.onDrop} className="profile-img" multiple={false} disabled={signInMethod !== 'email'}>
									<img src={photoUrl} alt='profile' />
							  </Dropzone>
								<div className="profile-img-upload-link" onClick={() => {dropzoneRef.open()}}>
			          	<a className="upload-profile-link"><span>upload new picture</span></a>
			          </div>
							</div>
						</div>
						<div className="col-sm-5">
			        <FormGroup>
			          <Label>Full Name</Label>
			          <Input type="text" name="fullname" placeholder="Enter your Full Name..." value={displayName} onChange={this.onInputChange.bind(this, 'displayName')} required disabled={signInMethod !== 'email'} />
			        </FormGroup>
						</div>
					</div>
					<div className="row justify-content-between mt-5 mb-5">
						<div className="col-sm-5">
			        <FormGroup>
			          <Label>Add New Password</Label>
			          <Input type="password" name="password" placeholder="Enter new Password..." value={password} onChange={this.onInputChange.bind(this, 'password')} required disabled={signInMethod !== 'email'} />
			          { (password && password.length>=6) && <div className="mt-5"><span className="btn-change-password" onClick={this.onChangePassword}>Save</span></div> }
			        </FormGroup>
						</div>
						<div className="col-sm-5">
			        <FormGroup>
			          <Label>Email</Label>
			          <Input type="email" name="email" placeholder="Enter your Email Address..." value={email} onChange={this.onInputChange.bind(this, 'email')} required disabled={signInMethod !== 'email'} />
			        </FormGroup>
			        { (email!==old_user.email || displayName!==old_user.displayName) && <div className="mt-5"><span className="btn-update-profile" onClick={this.onUpdateProfile}>Update</span></div> }
						</div>
					</div>
	        <Modal isOpen={this.state.modal_verify_credentials} toggle={this.toggleVerifyCredentials} className={classnames(this.props.className, 'modal-verify-credentials')}>
	        	<div className="modal-verify-credentials-content">
							<div className="modal-verify-credentials-title">Verify Yourself</div>
			        <Input type="password" name="verify_password" placeholder="Enter current password" className="input-verify-password" value={verify_password} onChange={this.onInputChange.bind(this, 'verify_password')} required />
			        <button className="btn btn-verify-credentials" onClick={this.verifyCredentials}>Verify</button>
						</div>
	        </Modal>
				</div>

				<hr className="dotted-line mt-5 mb-5" />

				<div className="profile-section">
					<h2 className="mt-5 mb-5">Delete Account</h2>
					<div className="d-flex align-items-end justify-content-between account-delete-container">
						<span>All contact info, resumes and links will all be deleted!</span>
						<button className="btn btn-delete-account" onClick={this.toggleConfirmDelete}>DELETE</button>
					</div>
	        <Modal isOpen={this.state.modal_confirm_delete} toggle={this.toggleConfirmDelete} className={classnames(this.props.className, 'modal-confirm-delete-account')}>
	        	<div className="modal-confirm-delete-content">
	        		<div className="d-flex flex-column align-items-center">
	        			<Icon.AlertTriangle color="#ff3636" />
	        			<div className="font-18 letter-spacing-0 black-text mt-2">Delete Account</div>
	        			<div className="font-13 letter-spacing-0 muted-text">Warning: this cannot be undone</div>
	        		</div>
			        <Input type="text" name="confirm_delete" placeholder="Type 'Delete' to confirm" className="input-confirm-delete" value={confirm_delete} onChange={this.onInputChange.bind(this, 'confirm_delete')} required />
			        <button className="btn btn-confirm-delete" onClick={this.confirmDelete} disabled={confirm_delete.toLowerCase()!=='delete'}>DELETE FOREVER</button>
						</div>
	        </Modal>
				</div>
			</div>
		)
	}
}

export default connect(state=>({
	next: state.auth.next,
	user: state.auth.user
}))(Profile);
