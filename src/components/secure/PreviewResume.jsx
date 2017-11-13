import React  from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Document, Page } from 'react-pdf';
import { resetNext } from '../../actions/auth';
import { push } from 'react-router-redux';
import AudioPreviewTracks from '../public/AudioPreviewTracks';

class PreviewResume extends React.Component {
  state = {
    user: {...this.props.user, uid: firebase.auth().currentUser.uid},
    numPages: null,
    resume: null,
  }

	componentWillMount() {
    const { resume_id } = this.props.params;
    this.setState({ resume_id });
    if(!this.props.user['resumes'] || !this.props.user.resumes[resume_id]) {
      this.props.dispatch(push(this.props.next || '/404'));
      this.props.dispatch(resetNext());
    }
    this.setState({ resume: {...this.props.user.resumes[resume_id], resume_id}});
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
                      /*width={Math.min(600, document.body.clientWidth - 52)}*/ width={600}
                      className="resume-page"
                    >
                      <AudioPreviewTracks resume={resume} pageNumber={index + 1} type="preview" />
                    </Page>
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
  next: state.auth.next,
	user: state.auth.user
}))(PreviewResume);
