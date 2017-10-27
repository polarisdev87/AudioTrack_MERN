import React  from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Document, Page } from 'react-pdf';
import * as Icon from 'react-feather';
import { NotificationManager } from 'react-notifications';
import { resetNext } from '../../actions/auth';
import { push } from 'react-router-redux';

class PreviewResume extends React.Component {
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

	render() {
		const { numPages, resume } = this.state;
		return (
			<div className={classnames('container', 'resume-container')}>
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
}))(PreviewResume);
