import React  from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

let aplayer;

class AudioPreviewTrackElement extends React.Component {
	state = {
		// user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		resume: this.props.resume,
		type: this.props.type,
		pageNumber: this.props.type,
		track: this.props.track,
    isPlaying: false,
    curTime: 0,
    length: 0,
    playTimerID: null,
    initiated: false
	};

	componentWillMount() {
		this.setState({ length: this.state.track.length });
	}

  onPlayerStartClicked = () => {
		aplayer = new window.Audio();
		aplayer.src = this.state.track.file;
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
  	// aplayer = null;
  }

  getTimeString = (t) => {
  	return parseInt(t/60, 10) + ':' + ("0" + t%60).slice(-2);
  }

	render() {
		const { track, isPlaying } = this.state;
		const pos = { left: track.pos.x<0.5?'auto':'100%', right: track.pos.x>=0.5?'auto':'100%', top: track.pos.y*100+'%' };
		return (
			<div className={classnames('audio-track-element', {'pin-right': track.pos.x>=0.5, 'pin-left': track.pos.x<0.5})} style={pos}>
				<div className={classnames('audio-track-element-trigger', {'audio-track-element-trigger-activated': this.state.popoverOpen})}>
        	{ 
        		!isPlaying && <div className="audio-track-element-player-action-play" onClick={this.onPlayerStartClicked}><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-button-play.svg'} alt="icon-record" /></div>
        	}
        	{
        		isPlaying && <div className="audio-track-element-player-action-pause" onClick={this.onPlayerStopClicked}><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-button-stop.svg'} alt="icon-record" /></div>
        	}
				</div>
			</div>
		);
	}
}

export default connect(state=>({
		user: state.auth.user,
	})
)(AudioPreviewTrackElement);
