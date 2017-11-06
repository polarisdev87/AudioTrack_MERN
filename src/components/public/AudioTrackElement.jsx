import React  from 'react';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import { Popover } from 'reactstrap';

class AudioTrackElement extends React.Component {
	state = {
		// user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		resume: this.props.resume,
		type: this.props.type,
		pageNumber: this.props.type,
		track: this.props.track,
    popoverOpen: this.props.defaultOpen || false,
    isPlaying: false,
    curTime: '1:00'
	};

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ popoverOpen: nextProps.defaultOpen });
	}

  toggle = () => {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
  }

  cancelTrack = () => {
  	const { resume, track } = this.state;
		let updates = {};
		updates['/resumes/' + resume.resume_id + '/tracks/' + track.track_id] = null;
		updates['/users/' + resume.uid + '/resumes/' + resume.resume_id + '/tracks/' + track.track_id] = null;

 		firebase.database().ref().update(updates).then(() => {
 		});
  }

	render() {
		const { track, isPlaying, curTime } = this.state;
		const pos = { left: track.pos.x*100+'%', top: track.pos.y*100+'%' };
		return (
			<div className="audio-track-element" style={pos}>
				<div className="audio-track-element-trigger" onClick={this.toggle} id={'popover-'+track.track_id}></div>
        <Popover placement="top" isOpen={this.state.popoverOpen} target={'popover-'+track.track_id} toggle={this.toggle} className="audio-track-element-popup">
          <div className="audio-track-element-player">
          	<div className="audio-track-element-player-action">
          	{
          		track.step === 0 && <div className="audio-track-element-player-action-record"><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-record.svg'} alt="icon-record" /></div>
          	}
          	{ 
          		track.step > 0 && !isPlaying && <div className="audio-track-element-player-action-play"><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-play.svg'} alt="icon-record" /></div>
          	}
          	{
          		track.step > 0 && isPlaying && <div className="audio-track-element-player-action-pause"><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-pause.svg'} alt="icon-record" /></div>
          	}
          	</div>
          	<div className="audio-track-element-player-bar-container">
          		<div className="audio-track-element-player-bar-wrapper">
          			<div className="audio-track-element-player-bar" style={{width: track.length>0?curTime/track.length*100:0 + '%'}}></div>
          		</div>
          		{ track.step > 0  && <div className="audio-track-element-player-bar-length">{curTime}</div> }
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
          			<div className="audio-track-element-action-save">Save</div>,
          			<div className="audio-track-element-action-delete">Delete</div>,
          		]
            }
          	{
          		track.step === 3 && <div className="audio-track-element-action-delete">Delete</div>
            }
          </div>
        </Popover>
			</div>
		);
	}
}

export default connect(state=>({
	user: state.auth.user
}))(AudioTrackElement);
