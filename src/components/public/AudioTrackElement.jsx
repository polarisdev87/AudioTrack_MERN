import React  from 'react';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import { Popover } from 'reactstrap';
import { Recorder } from 'react-recorder-redux';
import { recorderStart } from 'react-recorder-redux/actions';
import { recorderStop } from 'react-recorder-redux/actions';
import classnames from 'classnames';
import { NotificationManager } from 'react-notifications';

let aplayer;

class AudioTrackElement extends React.Component {
	state = {
		// user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		resume: this.props.resume,
		type: this.props.type,
		pageNumber: this.props.type,
		track: this.props.track,
    popoverOpen: this.props.defaultOpen || false,
    isPlaying: false,
    isRecording: false,
    curTime: 0,
    length: 0,
    autoTimerID: null,
    playTimerID: null,
    final_output: null,
    initiated: false,
    readyToAcceptBlog: false
	};

	componentWillMount() {
		const { track, resume } = this.state;
		if(track.file === '') {
			let updates = {};

			updates['/resumes/' + resume.resume_id + '/tracks/' + track.track_id + '/step'] = 0;
			updates['/users/' + resume.uid + '/resumes/' + resume.resume_id + '/tracks/' + track.track_id + '/step'] = 0;
	 		firebase.database().ref().update(updates).then(() => {
	 		});
		} 
		if(track.step > 2) {
			this.setState({ length: this.state.track.length });
		}
	}

	componentWillUnmount() {
		if(this.state.autoTimerID) {
			clearInterval(this.state.autoTimerID);
		}
		if(this.state.playTimerID) {
			clearInterval(this.state.playTimerID);
		}
	}

	componentWillReceiveProps(nextProps) {
		// if(nextProps.defaultOpen === true) {
		// 	this.setState({ popoverOpen: this.state.popoverOpen && true });
		// } else {
		// 	this.setState({ popoverOpen: false});
		// }
		// console.log(nextProps.defaultOpen ,  this.state.initiated );
		if(nextProps.defaultOpen === true && this.state.initiated === false) {
			this.setState({ popoverOpen: true, initiated: true });
		}
		if(nextProps.blobs.length > 0 && this.state.track.step === 2 && this.state.final_output === null && this.state.readyToAcceptBlog === true) {
			let blob = nextProps.blobs[nextProps.blobs.length-1];
			this.setState({ final_output: blob, readyToAcceptBlog: false });
			aplayer = null;
			aplayer = new window.Audio();
			aplayer.src = window.URL.createObjectURL(blob);
		}
		// this.setState({ track: { ...this.state.track, ...nextProps.track}});
	}

  toggle = () => {
  	// console.log('toggle', this.state.popoverOpen, this.node);
    // attach/remove event handler
    if (this.state.popoverOpen) {
      document.addEventListener('click', this.handleOutsideClick, false);
    } else {
      document.removeEventListener('click', this.handleOutsideClick, false);
    }
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
    // console.log(aplayer);
    if(!this.state.popoverOpen) {
    	aplayer = null;
    	aplayer = new window.Audio();
    	// console.log('before',this.state.final_output);
			if(this.state.track.step > 2) {
				if(this.state.track.file) {
					aplayer.src = this.state.track.file;
				} else {
					aplayer.src = window.URL.createObjectURL(this.state.final_output);
				}
			} else if(this.state.track.step === 2 && this.state.final_output) {
				// console.log('after',this.state.final_output);
				aplayer.src = window.URL.createObjectURL(this.state.final_output);
			}
		} else {
			if(this.state.isPlaying) {
				this.onPlayerStopClicked();
			}
			if(this.state.isRecording) {
				this.onRecorderStopClicked();
			}
		}
    // console.log(aplayer);
  }

  handleOutsideClick = (e) => {

    // ignore clicks on the component itself
    if (this.node.contains(e.target)) {
      return;
    }

		if(this.state.isPlaying) {
			this.onPlayerStopClicked();
		}
		if(this.state.isRecording) {
			this.onRecorderStopClicked();
		}

		// this.toggle();

  }

  cancelTrack = () => {
  	const { resume, track } = this.state;

		if(this.state.isPlaying) {
			this.onPlayerStopClicked();
		}
		if(this.state.isRecording) {
			this.onRecorderStopClicked();
		}

		let updates = {};
		updates['/resumes/' + resume.resume_id + '/tracks/' + track.track_id] = null;
		updates['/users/' + resume.uid + '/resumes/' + resume.resume_id + '/tracks/' + track.track_id] = null;
		if(track.file !== '') {
      firebase.storage().ref().child('resumes/' + resume.uid + '/' + resume.resume_id + '/' + track.track_id + '.wav').delete().then(() => {
      })
		}

	  NotificationManager.success('Audio track has been deleted.', 'Resume Updated');

 		firebase.database().ref().update(updates).then(() => {
 		});
  }

  onRecorderStartClicked = () => {
  	this.setState({ isRecording: true, track: {...this.state.track, step: 1}});
  	this.props.onRecorderStart();

  	let autoTimerID = setInterval(() => {
  		this.setState({length: this.state.length+1})
  		if(this.state.length>=60) {
  			this.onRecorderStopClicked();
  		}
  	}, 1000);
	  this.setState({ autoTimerID });
  }
  onRecorderStopClicked = () => {
	  clearInterval(this.state.autoTimerID);
	  try {
  		this.props.onRecorderStop();
  	} catch(err) {
  		// console.log(err);
  	}
	  this.setState({ isRecording: false, track: {...this.state.track, step: 2}, readyToAcceptBlog: true});
  }

  saveTrack = () => {
  	const { track, resume } = this.state;
  	let uploadTask = firebase.storage().ref().child('resumes/' + track.uid + '/' + track.resume_id + '/' + track.track_id + '.wav').put(this.state.final_output);
		uploadTask.then((snapshot) => {
			let updates = {};
			updates['/resumes/' + resume.resume_id + '/tracks/' + track.track_id + '/length'] = this.state.length;
			updates['/users/' + resume.uid + '/resumes/' + resume.resume_id + '/tracks/' + track.track_id + '/length'] = this.state.length;
			updates['/resumes/' + resume.resume_id + '/tracks/' + track.track_id + '/file'] = uploadTask.snapshot.downloadURL;
			updates['/users/' + resume.uid + '/resumes/' + resume.resume_id + '/tracks/' + track.track_id + '/file'] = uploadTask.snapshot.downloadURL;
			updates['/resumes/' + resume.resume_id + '/tracks/' + track.track_id + '/step'] = 3;
			updates['/users/' + resume.uid + '/resumes/' + resume.resume_id + '/tracks/' + track.track_id + '/step'] = 3;

	  	NotificationManager.success('Audio track has been saved.', 'Resume Updated');	  

	 		firebase.database().ref().update(updates).then(() => {
	 		});
		});
	  this.setState({ track: {...this.state.track, step: 3}});
	}
  deleteTrack = () => {
  	this.cancelTrack();
  }

  onPlayerStartClicked = () => {

  	aplayer = null;
  	aplayer = new window.Audio();
  	// console.log('before',this.state.final_output);
		if(this.state.track.step > 2) {
			if(this.state.track.file) {
				aplayer.src = this.state.track.file;
			} else {
				aplayer.src = window.URL.createObjectURL(this.state.final_output);
			}
		} else if(this.state.track.step === 2 && this.state.final_output) {
			// console.log('after',this.state.final_output);
			aplayer.src = window.URL.createObjectURL(this.state.final_output);
		}

  	aplayer.play();
  	this.setState({ isPlaying: true, curTime: 0 });
  	let playTimerID = setInterval(() => {
	  	this.setState({curTime: this.state.curTime+1})
  		if(this.state.curTime > this.state.length) {
  			this.onPlayerStopClicked();
  		}
  	}, 1000);
  	this.setState({ playTimerID });
  }
  onPlayerStopClicked = () => {
  	aplayer.pause();
  	aplayer.currentTime = 0;
  	clearInterval(this.state.playTimerID);
  	this.setState({ isPlaying: false, curTime: 0 });
  }

  getTimeString = (t) => {
  	return parseInt(t/60, 10) + ':' + ("0" + t%60).slice(-2);
  }

	render() {
		const { track, isPlaying, curTime, length } = this.state;
		const pos = { left: track.pos.x*100+'%', top: track.pos.y*100+'%' };
		return (
			<div className="audio-track-element" style={pos} ref={node => { this.node = node; }}>
				<div className={classnames('audio-track-element-trigger', {'audio-track-element-trigger-activated': this.state.popoverOpen})} onClick={this.toggle} id={'popover-'+track.track_id}>
					<img src={process.env.PUBLIC_URL + '/assets/img/icons/' + (!this.state.popoverOpen?'icon-circle-normal.svg':'icon-circle-active.svg')} alt="icon-record" />
				</div>
				<Recorder />
        <Popover placement="top" isOpen={this.state.popoverOpen} target={'popover-'+track.track_id} toggle={this.toggle} className="audio-track-element-popup-wrapper">
					<div  className="audio-track-element-popup">
	          <div className="audio-track-element-player">
	          	<div className="audio-track-element-player-action">
	          	{
	          		track.step === 0 && <div className="audio-track-element-player-action-record" onClick={this.onRecorderStartClicked}><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-record.svg'} alt="icon-record" /></div>
	          	}
	          	{
	          		track.step === 1 && <div className="audio-track-element-player-action-stop" onClick={this.onRecorderStopClicked}><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-pause.svg'} alt="icon-record" /></div>
	          	}
	          	{ 
	          		track.step > 1 && !isPlaying && <div className="audio-track-element-player-action-play" onClick={this.onPlayerStartClicked}><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-play.svg'} alt="icon-record" /></div>
	          	}
	          	{
	          		track.step > 1 && isPlaying && <div className="audio-track-element-player-action-pause" onClick={this.onPlayerStopClicked}><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-pause.svg'} alt="icon-record" /></div>
	          	}
	          	</div>
	          	<div className="audio-track-element-player-bar-container">
	          		<div className="audio-track-element-player-bar-wrapper">
	          			<div className="audio-track-element-player-bar" style={{width: (length>0?curTime/length*100:0) + '%'}}></div>
	          		</div>
	          		{ track.step > 0  && <div className="audio-track-element-player-bar-length">{this.getTimeString(curTime || length)}</div> }
	          	</div>
	          </div>
	          <div className="audio-track-element-actions">
	          	{
	          		track.step === 0 && <div className="audio-track-element-action-cancel" onClick={this.cancelTrack}>Cancel</div>
	            }
	          	{
	          		track.step === 1 && null
	            }
	          	{
	          		track.step === 2 && [
	          			<div className="audio-track-element-action-save" key={'action-save'} onClick={this.saveTrack}>Save</div>,
	          			<div className="audio-track-element-action-delete" key={'action-delete'} onClick={this.deleteTrack}>Delete</div>,
	          		]
	            }
	          	{
	          		track.step === 3 && <div className="audio-track-element-action-delete" onClick={this.deleteTrack}>Delete</div>
	            }
	          </div>
          </div>
        </Popover>
			</div>
		);
	}
}

export default connect(state=>({
		user: state.auth.user,
		blobs: state.recorder.blobs,
		active: state.recorder.active,
		command: state.recorder.commnad,
		stream: state.recorder.stream
	}), dispatch => ({
		onRecorderStart: () => {
			dispatch(recorderStart());
		},
		onRecorderStop: () => {
			dispatch(recorderStop());
		}
	})
)(AudioTrackElement);
