import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { FormGroup, Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import Dropzone from 'react-dropzone';
import { resetNext } from '../../actions/auth';
import { push } from 'react-router-redux';

let dropzoneRef, uploadTask;

class Profile extends React.Component {
	state = {
		...this.props.user,
		uid: firebase.auth().currentUser.uid,
		password: ''
	};

	componentWillReceiveProps(nextProps) {
		this.setState({...nextProps.user});
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

				firebase.database().ref('/users/' + uid).update({ photoUrl: downloadURL }).then(() => {
					this.props.dispatch(push(this.props.next || '/profile'));
				
				});

			});

    });
  }

  onChangePassword = () => {
  // 	const { password } = this.state;
  // 	const user = firebase.auth().currentUser;
		// user.updatePassword(password).then(function() {
	 //  	NotificationManager.success('Password changed successfully', '');
		// }).catch(function(error) {
	 //  	NotificationManager.error('Error occured while changing password', '');
		// });
		// const { email } = this.state;
		// const user = firebase.auth().currentUser;
		// const credential = firebase.auth.EmailAuthProvider.credential(
		//   email, 
		//   'test'
		// );

		// // Prompt the user to re-provide their sign-in credentials

		// user.reauthenticateWithCredential(credential).then(function() {
		//   // User re-authenticated.
		// }).catch(function(error) {
		//   // An error happened.
		// });
  }

  onDeleteAccount = () => {
  	if(confirm("Do you really wanna abandon your account?")) {
  		const { uid } = this.state;
  		const resumes = this.props.user.resumes || [];

			const storageRef = firebase.storage().ref();

			let promise_list = [];

			for (let resume_id in resumes) {
		    if (!resumes.hasOwnProperty(resume_id)) continue;

		    let resume = resumes[resume_id];

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
		const { signInMethod, email, password, displayName, photoUrl } = this.state;
		const { old_user } = this.props;
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
			          <Input type="password" name="password" placeholder="Enter your Password..." value={password} onChange={this.onInputChange.bind(this, 'password')} required disabled={signInMethod !== 'email'} />
			          { password && <div className="mt-5"><span className="btn-change-password" onClick={this.onChangePassword}>Save</span></div> }
			        </FormGroup>
						</div>
						<div className="col-sm-5">
			        <FormGroup>
			          <Label>Email</Label>
			          <Input type="email" name="email" placeholder="Enter your Email Address..." value={email} onChange={this.onInputChange.bind(this, 'email')} required disabled={signInMethod !== 'email'} />
			        </FormGroup>
			        { (email!=old_user.email || displayName!=old_user.displayName) && <div className="mt-5"><span className="btn-update-profile" onClick={this.onUpdateProfile}>Update</span></div> }
						</div>
					</div>
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
