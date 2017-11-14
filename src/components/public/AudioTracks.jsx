import React  from 'react';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import AudioTrackElement from './AudioTrackElement';
import { NotificationManager } from 'react-notifications';

// let last_created = null;

class AudioTracks extends React.Component {
	state = {
		// user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		resume: this.props.resume,
		type: this.props.type,
		pageNumber: this.props.pageNumber,
		tracks: [],
		last_created: null
	};

	componentWillMount() {
		firebase.database().ref('/resumes/'+this.state.resume.resume_id+'/tracks').on('value', (snapshot) => {
			let tracks = [];
		  snapshot.forEach((childSnapshot) => {
		    const childKey = childSnapshot.key;
		    const childData = childSnapshot.val();
		    if(childData.pageNumber === this.state.pageNumber) {
		    	tracks.push({...childData, track_id: childKey});
		    }
		  });
			this.setState({ loaded: true, tracks });
		});
	}

	componentWillUnmount() {
		firebase.database().ref('/resumes/'+this.state.resume.resume_id+'/tracks').off();
	}

	handleAddNewPoint(e) {
		const { resume, pageNumber } = this.state;
		const pos = { x: e.nativeEvent.offsetX/e.currentTarget.clientWidth, y: e.nativeEvent.offsetY/e.currentTarget.clientHeight };

		const newTrackKey = firebase.database().ref().child('resumes/'+resume.resume_id+'/tracks').push().key;

		let updates = {};
		const trackData = {
			uid: resume.uid,
			resume_id: resume.resume_id,
			pageNumber: pageNumber,
			file: '',
			length: 0,
			pos: pos,
			step: 0,
			created: new Date(),
			updated: new Date()
		};
		updates['/resumes/' + resume.resume_id + '/tracks/' + newTrackKey] = trackData;
		updates['/users/' + resume.uid + '/resumes/' + resume.resume_id + '/tracks/' + newTrackKey] = trackData;

	 	this.setState({ last_created: null });

	  NotificationManager.success('New audio track has been added.', 'Resume Updated');

 		firebase.database().ref().update(updates).then(() => {
	 		this.setState({ last_created: newTrackKey });
 		});
	}

	render() {
		const { loaded, tracks, last_created } = this.state;
		return (
			<div className="audio-track-container">
				<div className="audio-track-overlay" onClick={(e) => {this.handleAddNewPoint(e)}}></div>
				{ loaded && tracks.map((track, idx) => <AudioTrackElement track={track} key={track.track_id} defaultOpen={track.track_id === last_created} {...this.props} />) }
			</div>
		);
	}
}

export default connect(state=>({
	user: state.auth.user
}))(AudioTracks);
