import React  from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

// let aplayer;

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
    initiated: false,
    canPlay: false,
    aplayer: null
	};

	componentWillMount() {
		this.setState({ length: this.state.track.length });
    // document.addEventListener('click', this.handleOutsideClick, false);
	}

	componentWillUnmount() {
    // document.removeEventListener('click', this.handleOutsideClick, false);
  }

  componentWillReceiveProps(newProps) {
  	if(!newProps.isPlayingTrack) {
  		this.onPlayerControlClicked();
  	}
  }

  onPlayerStartClicked = () => {
		this.state.aplayer = new window.Audio();
		this.state.aplayer.src = this.state.track.file;
  	this.state.aplayer.play();
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
  	this.state.aplayer.pause();
  	this.state.aplayer.currentTime = 0;
  	clearInterval(this.state.playTimerID);
  	this.setState({ isPlaying: false, curTime: 0 });
  	// aplayer = null;
  }

  onPlayerControlClicked = () => {

    // if (!this.state.isPlaying) {
    // 	console.log('listening');
    //   document.addEventListener('click', this.handleOutsideClick, false);
    // } else {
    // 	console.log('removing');
    //   document.removeEventListener('click', this.handleOutsideClick, false);
    // }

  	this.setState({ isPlaying: !this.state.isPlaying, curTime: 0 });

  	if(!this.state.isPlaying) {
			this.state.aplayer = new window.Audio();
			this.state.aplayer.src = this.state.track.file;
	  	this.state.aplayer.play();
	  	let playTimerID = setInterval(() => {
		  	this.setState({curTime: this.state.curTime+1})
	  		if(this.state.curTime > this.state.length) {
	  			this.onPlayerStopClicked();
	  		}
	  	}, 1000);
	  	this.setState({ playTimerID });

	  	this.props.iamPlaying(this.state.track.track_id);
  	} else {
	  	this.state.aplayer.pause();
	  	this.state.aplayer.currentTime = 0;
	  	clearInterval(this.state.playTimerID);
  	}
  }

  handleOutsideClick = (e) => {
    // ignore clicks on the component itself
    // console.log(this.node, e.target);
    // if (this.node.contains(e.target)) {
    // 	this.onPlayerStartClicked();
    // } else {
    // 	this.onPlayerStopClicked();
    // }

    // console.log('passed');

    // this.onPlayerControlClicked();
  }

  getTimeString = (t) => {
  	return parseInt(t/60, 10) + ':' + ("0" + t%60).slice(-2);
  }

	render() {
		const { track, isPlaying } = this.state;
		const pos = { left: track.pos.x<0.5?'auto':'100%', right: track.pos.x>=0.5?'auto':'100%', top: track.pos.y*100+'%' };
		return (
			<div className={classnames('audio-track-element', {'pin-right': track.pos.x>=0.5, 'pin-left': track.pos.x<0.5})} style={pos} ref={node => { this.node = node; }}>
				<div className={classnames('audio-track-element-trigger', {'audio-track-element-trigger-activated': this.state.popoverOpen})}>
      		<div className="audio-track-element-player-action-control" onClick={this.onPlayerControlClicked}><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-button-' + (!isPlaying?'play':'stop') + '.svg'} alt="icon-control" /></div>
				</div>
			</div>
		);
	}
}

export default connect(state=>({
		user: state.auth.user,
	})
)(AudioPreviewTrackElement);