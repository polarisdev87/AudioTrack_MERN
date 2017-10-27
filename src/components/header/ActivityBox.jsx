import React from 'react';
// import * as firebase from 'firebase';
import { connect } from 'react-redux';
import * as Icon from 'react-feather';
import { Popover, PopoverBody } from 'reactstrap';
import classnames from 'classnames';

class ActivityBox extends React.Component {
	state = {
		type: this.props.type,
		popoverOpen: false,
		loaded: true,
		activities: []
	};

	componentWillMount() {
		// firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/activities').on('value', (snapshot) => {
		// 	this.setState({ loaded: true });
		// });
	}
	componentWillUnmount() {
		// firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/activities').off();
	}

  toggle = () => {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
  }

  onClearLogs = () => {

  }

	render() {
		const { type, loaded, activities } = this.state;
		return (
			<div className="activity-container">
				<div className="activity-trigger" id={'popover-'+type} onClick={this.toggle}>
					{ type==='all' && <Icon.Zap /> }
					{ type==='view' && (
						<div className="activity-trigger-view"><Icon.Eye size={28} /><span>{activities.length}</span></div>
					) }
					{ type==='download' && (
						<div className="activity-trigger-download"><Icon.Download size={22} /><span>{activities.length}</span></div>
					) }
				</div>
        <Popover placement="bottom" isOpen={this.state.popoverOpen} target={'popover-'+type} toggle={this.toggle} className="activity-popover">
          <PopoverBody>
          	<div className="activity-logs-container">
	          	<div className="activity-logs-header">
	          		<span className="activity-logs-type">{
			          	(() => {
			          		switch(type) {
			          			case 'all': return 'Activity';
			          			case 'view': return 'Views';
			          			case 'download': return 'Downloads';
			          			default: return null;
			          		}
			          	})()
								}</span>
								{
									type === 'all' ? (
										<div className="activity-logs-action">
											<span className="action-clear" onClick={this.onClearLogs}>Clear</span>
										</div>
									) : null
								}
	          	</div>
	          	<div className={classnames('activity-logs-content', {'empty': activities.length===0 })}>
		          	{ loaded ? (
		          		activities.length>0 ? (
		          			activities.map((activity) => <span>1</span>)
		          		) : (
		          			<div className="no-logs">
		          				<Icon.Zap size={32} />
		          				<div>You have no activity</div>
		          			</div>
		          		)
		          	) :  null}
	          	</div>
	          </div>
          </PopoverBody>
        </Popover>
			</div>
		)
	}
}

export default connect(state=>({
  user: state.auth.user
}))(ActivityBox);
