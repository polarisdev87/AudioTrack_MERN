import React  from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Document, Page } from 'react-pdf';

class Resume extends React.Component {
  state = {
    numPages: null,
    resume: null
  }

	componentWillMount() {
    const { resume_id } = this.props.params;
    this.setState({ resume_id });
    firebase.database().ref('/resumes/'+resume_id).once('value', (snapshot) => {
    	this.setState({ resume: snapshot.val()})
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
		        <Document
		          file={resume.file}
		          onLoadSuccess={this.onDocumentLoad}
              className="resume-pages-wrapper"
		        >
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
}))(Resume);
