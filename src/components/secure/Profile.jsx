import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { FormGroup, Label, Input, Modal } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import Dropzone from 'react-dropzone';
import { resetNext } from '../../actions/auth';
import { push } from 'react-router-redux';
import classnames from 'classnames';

let dropzoneRef, uploadTask;

class Profile extends React.Component {
	state = {
		...this.props.user,
		uid: firebase.auth().currentUser.uid,
		password: '',
		verify_password: '',
		old_user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		modal: false,
		mode: ''
	};

	componentWillReceiveProps(nextProps) {
		this.setState({...nextProps.user});
	}

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
    if(!this.state.modal) {
    	this.setState({ verify_password: '' });
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
				promise_list.push(firebase.database().ref('/users/' + uid).update({ photoUrl: downloadURL }))

				Promise.all([...promise_list]).then(() => {
	  			NotificationManager.success('Profile updated successfully', '');
					this.props.dispatch(push(this.props.next || '/profile'));
				});

			});

    });
  }

  onChangePassword = () => {
  	this.toggle();
  	this.setState({ mode: 'password'});
  }

  onUpdateProfile = () => {
  	this.toggle();
  	this.setState({ mode: 'email'});
  }

  verifyCredentials = () => {
		const { email, verify_password, password, mode, displayName, old_user, uid } = this.state;
		const user = firebase.auth().currentUser;
		const credential = firebase.auth.EmailAuthProvider.credential(old_user.email, verify_password);
		user.reauthenticateWithCredential(credential).then(() => {
		  // User re-authenticated.

		  if(mode === 'password') {
				user.updatePassword(password).then(() => {
			  	NotificationManager.success('Password changed successfully', '');
			  	this.setState({ password: '' });
			  	this.toggle();
				}).catch((error) => {
			  	NotificationManager.error('Error occured while changing password', '');
			  	this.setState({ password: '' });
			  	this.toggle();
				});
			} else {
		  	let promise_list = [];
		  	let updates = {};
				if(old_user.displayName !== displayName) {
					updates['/users/' + uid + '/displayName'] = displayName;
					promise_list.push(user.updateProfile({ displayName }));
				}
				if(old_user.email !== email) {
					updates['/users/' + uid + '/email'] = email;
					promise_list.push(user.updateEmail(email));
				}
				promise_list.push(firebase.database().ref().update(updates));
				Promise.all([...promise_list]).then(() => {
			  	NotificationManager.success('Profile updated successfully', '');
			  	this.toggle();
				}).catch(() => {
			  	NotificationManager.error('Error occured while updating profile.', '');
			  	this.toggle();
				});
			}
		}).catch((error) => {
		  // An error happened.
	  	NotificationManager.error('Password is wrong, please try again ...', '');
		});
  }

  onDeleteAccount = () => {
  	if(confirm("Do you really wanna abandon your account?")) {
  		const { uid } = this.state;
  		const resumes = this.props.user.resumes || [];

			const storageRef = firebase.storage().ref();

			let promise_list = [];

			for (let resume_id in resumes) {
		    if (!resumes.hasOwnProperty(resume_id)) continue;

				let resumeRef = storageRef.child('resumes/' + uid + '/' + resume_id + '/source.pdf');
				promise_list.push(resumeRef.delete());

	      let updates = {};
	      updates['/resumes/' + resume_id] = null;
	      promise_list.push(firebase.database().ref().update(updates));
			}

			let profileRef = storageRef.child('profile/' + uid + '.png');
			profileRef.delete().then(() => {}).catch((e) => {});

			promise_list.push(firebase.auth().currentUser.delete());

      let updates = {};
      updates['/users/' + uid] = null;
      promise_list.push(firebase.database().ref().update(updates));

      Promise.all([...promise_list]).then(() => {
	  		NotificationManager.success('Account deleted...', '');
				this.props.dispatch(push(this.props.next || '/'));
				this.props.dispatch(resetNext());
      });
  	}
  }

	render() {
		const { signInMethod, email, password, displayName, photoUrl, old_user, verify_password } = this.state;
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
	        <Modal isOpen={this.state.modal} toggle={this.toggle} className={classnames(this.props.className, 'modal-verify-credentials')}>
	        	<div className="modal-verify-credentials-content">
							<div className="modal-verify-credentials-title">Verify Yourself</div>
			        <Input type="password" name="password" placeholder="Enter your password to verify" className="input-verify-password" value={verify_password} onChange={this.onInputChange.bind(this, 'verify_password')} required disabled={signInMethod !== 'email'} />
			        <button className="btn btn-verify-credentials" onClick={this.verifyCredentials}>Verify</button>
						</div>
	        </Modal>
				</div>

				<hr className="dotted-line mt-5 mb-5" />

				<div className="profile-section">
					<h2 className="mt-5 mb-5">Delete Account</h2>
					<div className="d-flex align-items-end justify-content-between account-delete-container">
						<span>All contact info, resumes and links will all be deleted!</span>
						<button className="btn btn-delete-account" onClick={this.onDeleteAccount}>DELETE</button>
					</div>
				</div>

			</div>
		)
	}
}

export default connect(state=>({
	user: state.auth.user
}))(Profile);
