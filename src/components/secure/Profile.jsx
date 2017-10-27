import React from 'react';
import { connect } from 'react-redux';
import { FormGroup, Label, Input } from 'reactstrap';

class Profile extends React.Component {
	state = {
		...this.props.user,
		password: 'thisisapassword'
	};

	onInputChange(name, event) {
		var change = {};
		change[name] = event.target.value;
		this.setState(change);
	}

	render() {
		return (
			<div className="container profile-container">

				<div className="profile-section">
					<h2 className="mt-5 mb-5">Account Information</h2>
					<div className="row justify-content-between mt-5 mb-5">
						<div className="col-sm-5 d-flex align-items-center">
							<div className="profile-img-upload">
								<div className="profile-img">
									<img src={this.state.photoUrl} alt='profile' />
								</div>
								<div className="profile-img-upload-link">
			          	<a className="upload-profile-link"><span>upload new picture</span><Input type="file" name="file" /></a>
			          </div>
			        </div>
						</div>
						<div className="col-sm-5">
			        <FormGroup>
			          <Label>Full Name</Label>
			          <Input type="text" name="fullname" placeholder="Enter your Full Name..." value={this.state.displayName} onChange={this.onInputChange.bind(this, 'displayName')} required />
			        </FormGroup>
						</div>
					</div>
					<div className="row justify-content-between mt-5 mb-5">
						<div className="col-sm-5">
			        <FormGroup>
			          <Label>Password</Label>
			          <Input type="password" name="password" placeholder="Enter your Password..." value={this.state.password} onChange={this.onInputChange.bind(this, 'password')} required />
			        </FormGroup>
						</div>
						<div className="col-sm-5">
			        <FormGroup>
			          <Label>Email</Label>
			          <Input type="email" name="email" placeholder="Enter your Email Address..." value={this.state.email} onChange={this.onInputChange.bind(this, 'email')} required />
			        </FormGroup>
						</div>
					</div>
				</div>

				<hr className="dotted-line mt-5 mb-5" />

				<div className="profile-section">
					<h2 className="mt-5 mb-5">Delete Account</h2>
					<div className="d-flex align-items-end justify-content-between account-delete-container">
						<span>All contact info, resumes and links will all be deleted!</span>
						<button className="btn btn-delete-account">DELETE</button>
					</div>
				</div>

			</div>
		)
	}
}

export default connect(state=>({
	user: state.auth.user
}))(Profile);
