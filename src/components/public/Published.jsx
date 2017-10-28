import React  from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Document, Page } from 'react-pdf';
import * as Icon from 'react-feather';
import { NotificationManager } from 'react-notifications';
import { resetNext } from '../../actions/auth';
import { push } from 'react-router-redux';

class Published extends React.Component {
  state = {
    user: {...this.props.user, uid: firebase.auth().currentUser.uid},
    numPages: null,
    resume: null,
  }

	componentWillMount() {
    const { resume_id } = this.props.params;
    this.setState({ resume_id });
    firebase.database().ref('/resumes/'+resume_id).once('value', (snapshot) => {
    	this.setState({ resume: {...snapshot.val(), resume_id}})
    })
	}

  onDocumentLoad = ({ numPages }) => {
    this.setState({ numPages });
  }

  onDeleteResume = () => {
    if(confirm("Do you really wanna delete this resume?")) {
      const { resume } = this.state;
      let updates = {};
      updates['/resumes/' + resume.resume_id] = null;
      updates['/users/' + this.state.user.uid + '/resumes/' + resume.resume_id] = null;
      NotificationManager.success('Resume successfully deleted', '');
      firebase.database().ref().update(updates).then(() => {
        this.props.dispatch(push(this.props.next || '/dashboard'));
        this.props.dispatch(resetNext());
      });
    }
  }

  onPreviewResume = () => {

  }

  onEditResume = () => {
    
  }

	render() {
		const { numPages, resume } = this.state;
		return (
			<div className={classnames('container', 'resume-container')}>
        { resume && (
          <div className="resume-builder">
            <div className="resume-builder-icons">
              <div onClick={this.onDeleteResume}><i className="icon-img icon-trash" style={{backgroundColor: '#f54056' }}><Icon.Trash size={20} color="white" /></i></div>
              <div onClick={this.onPreviewResume}><i className="icon-img icon-preview" style={{backgroundColor: '#0097ff' }}><Icon.Eye size={20} color="white" /></i></div>
              <div onClick={this.onEditResume}><i className="icon-img icon-preview" style={{backgroundColor: '#4a4a4a' }}><Icon.Edit2 size={20} color="white" /></i></div>
            </div>
          </div>
        ) }
				{ resume && (
					<div className="resume-wrapper">
		        <Document file={resume.file} onLoadSuccess={this.onDocumentLoad} className="resume-pages-wrapper" >
              {
                Array.from(
                  new Array(numPages),
                  (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      onRenderSuccess={this.onPageRenderSuccess}
                      width={Math.min(600, document.body.clientWidth - 52)}
                      className="resume-page"
                    />
                  ),
                )
              }
		        </Document>
					</div>
				)}
			</div>
		);
	}
}

export default connect(state=>({
	user: state.auth.user
}))(Published);
