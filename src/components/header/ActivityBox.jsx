import React from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import * as Icon from 'react-feather';
import { Popover, PopoverBody } from 'reactstrap';
import classnames from 'classnames';
import Moment from 'react-moment';

const EmojiIcons = [ {
		name: 'Penguin',
		icon: '🐧',
		color: '#FFA793'
	},
	{
		name: 'Frog',
		icon: '🐸',
		color: '#F74C61'
	},
	{
		name: 'Chick',
		icon: '🐥',
		color: '#4A90E2'
	},
	{
		name: 'Tiger',
		icon: '🐯',
		color: '#FF9CF7'
	},
	{
		name: 'Bear',
		icon: '🐻',
		color: '#3B9C86'
	},
	{
		name: 'Monkey',
		icon: '🐵',
		color: '#B89CFF'
	},
	{
		name: 'Dog',
		icon: '🐶',
		color: '#FFD548'
	},
	{
		name: 'Cat',
		icon: '🐱',
		color: '#73C6FF'
	},
	{
		name: 'Koala',
		icon: '🐨',
		color: '#FF8695'
	},
	{
		name: 'Wolf',
		icon: '🐺',
		color: '#05CCA0'
	},
	{
		name: 'Whale',
		icon: '🐋',
		color: '#FFE797'
	},
];

class ActivityLog extends React.Component {
	state = {
		...this.props.data
	};

	componentWillMount() {
		this.setState({emoji: EmojiIcons[Math.floor(Math.random()*EmojiIcons.length)]});
	}

	render() {
		const { type, title, location, at, emoji, log_type } = this.state;
		return (
			<div className="notification activity-log">
				<div className="profile">
					<div className="profile-img" style={{backgroundColor: emoji.color}}>{emoji.icon}</div>
				</div>
				<div className="description">
					<div className="description-content">Anonymus {emoji.name} {type}ed your {log_type === 'all' ? title : 'resume'} from {location.city}, {location.state}</div>
					<div className="description-time"><Moment fromNow>{at}</Moment></div>
				</div>
				<div className="action">
					<i className="icon-img icon-download">{ type === 'view' ? <Icon.Eye color="black" /> : <Icon.Download color="black" /> }</i>
				</div>
			</div>
		)
	}
}

class ActivityBox extends React.Component {
	state = {
		user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		type: this.props.type,
		popoverOpen: false,
		loaded: true,
		activities: []
	};

	componentWillMount() {
		const { type } = this.state;
    const { resume_id } = this.props.params;
    firebase.database().ref('/resumes/'+resume_id).once('value', (snapshot) => {
    	const resume = snapshot.val();
    	this.setState({ resume: {...resume, resume_id} });
    })
		switch(type) {
			case 'all':
				firebase.database().ref('/activities/' + this.state.user.uid).on('value', (snapshot) => {
					let activities = snapshot.val() || {};
					let list = [];
					Object.keys(activities).every((activity_id) => {
						list.push({...activities[activity_id], activity_id});
						return true;
					});
					list.sort((a, b) => {
						return new Date(b.at) - new Date(a.at);
					});
					this.setState({ activities: [...list]});
				});
				break;
			case 'view':
				firebase.database().ref('/resumes/' + resume_id + '/activities').on('value', (snapshot) => {
					let activities = snapshot.val() || {};
					let list = [];
					Object.keys(activities).every((activity_id) => {
						if(activities[activity_id].type === 'view') {
							list.push({...activities[activity_id], activity_id});
						}
						return true;
					});
					list.sort((a, b) => {
						return new Date(b.at) - new Date(a.at);
					});
					this.setState({ activities: [...list]});
				});
				break;
			case 'download':
				firebase.database().ref('/resumes/' + resume_id + '/activities').on('value', (snapshot) => {
					let activities = snapshot.val() || {};
					let list = [];
					Object.keys(activities).every((activity_id) => {
						if(activities[activity_id].type === 'download') {
							list.push({...activities[activity_id], activity_id});
						}
						return true;
					});
					list.sort((a, b) => {
						return new Date(b.at) - new Date(a.at);
					});
					this.setState({ activities: [...list]});
				});
				break;
			default:
				break;
		}
	}
	componentWillUnmount() {
		const { type } = this.state;
		switch(type) {
			case 'all':
				firebase.database().ref('/activities/' + firebase.auth().currentUser.uid).off();
				break;
			case 'view':
				firebase.database().ref('/resumes/' + this.state.resume.resume_id + '/activities').off();
				break;
			case 'download':
				firebase.database().ref('/resumes/' + this.state.resume.resume_id + '/activities').off();
				break;
			default:
				break;
		}
	}

  toggle = () => {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
  }

  onClearLogs = () => {
  	let updates = {};
    updates['/activities/' + firebase.auth().currentUser.uid] = null;
  	firebase.database().ref().update(updates);
  }

	render() {
		const { type, loaded, activities } = this.state;
		return (
			<div className="activity-container">
				<div className="activity-trigger" id={'popover-'+type} onClick={this.toggle}>
					{ type==='all' && (
						<div className="activity-trigger-all"><Icon.Zap />{ activities.length>0 && <span>{activities.length}</span>}</div>
					) }
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
		          			activities.map((activity, ind) => <ActivityLog data={activity} log_type={type} key={ind} />)
		          		) : (
	          				<div className="no-logs">
		          				{
		          					type==='all' && [
				          				<Icon.Zap size={32} key="icon" />,
				          				<div key="label">You have no activity</div>
				          			]
		          				}
		          				{
			          				type==='view' && [
				          				<Icon.Eye size={32} key="icon" />,
				          				<div key="label">No Views</div>
					          		]
		          				}
		          				{
			          				type==='download' && [
				          				<Icon.Download size={32} key="icon" />,
				          				<div key="label">No Downloads</div>
					          		]
		          				}
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
