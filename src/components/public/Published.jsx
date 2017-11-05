import React  from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Document, Page } from 'react-pdf';
import * as Icon from 'react-feather';
import { Link } from 'react-router';
import axios from 'axios';

class Published extends React.Component {
  state = {
    numPages: null,
    resume: null,
  }

	componentWillMount() {
    const { resume_link } = this.props.params;
    this.setState({ resume_link });

    let authPromise = new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.setState({ user: { uid: user.uid }});
        } else {
          this.setState({ user: null });
        }
        resolve();
      });
    });

    let resumePromise = new Promise((resolve, reject) => {
      firebase.database().ref().child('resumes').once('value', (snapshot) => {
        let resume_data = snapshot.val();
        Object.keys(resume_data).every((resume_id) => {
          let resume = resume_data[resume_id];
          if(!resume.published) return true;
          if(resume.link !== resume_link) return true;
          this.setState({ resume: {...resume, resume_id} });
          return false;
        });
        resolve();
      });
    });

    Promise.all([authPromise, resumePromise]).then(() => {
      if(!this.state.user || this.state.user.uid !== this.state.resume.uid) {
        axios.get('https://geoip-db.com/json/').then((res) => {
          const location_data = res.data;

          let updates = {};

          const newActivityKey = firebase.database().ref().child('resumes').push().key;
          const activityData = {
            type: 'view',
            location: {
              city: location_data.city,
              state: location_data.state
            },
            at: new Date(),
            title: this.state.resume.title
          };

          updates['/activities/' + this.state.resume.uid + '/' + newActivityKey] = activityData;
          updates['/resumes/' + this.state.resume.resume_id + '/activities/' + newActivityKey] = activityData;
          updates['/users/' + this.state.resume.uid + '/resumes/' + this.state.resume.resume_id + '/activities/' + newActivityKey] = activityData;
          updates['/resumes/' + this.state.resume.resume_id + '/views'] = this.state.resume.views + 1;
          updates['/users/' + this.state.resume.uid + '/resumes/' + this.state.resume.resume_id + '/views'] = this.state.resume.views + 1;
          firebase.database().ref().update(updates).then(() => {
          });
        })
      }
    })
	}

  componentDidMount() {
  }

  onDocumentLoad = ({ numPages }) => {
    this.setState({ numPages });
  }

  downloadResume = (resume) => {
    let url = resume.file;
    let filename = 'resume.pdf';
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => {
      let a = document.createElement('a');
      a.href = window.URL.createObjectURL(xhr.response);
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      if(!this.state.user || this.state.user.uid!== this.state.resume.uid) {
        axios.get('https://geoip-db.com/json/').then((res) => {
          const location_data = res.data;

          let updates = {};

          const newActivityKey = firebase.database().ref().child('resumes').push().key;
          const activityData = {
            type: 'download',
            location: {
              city: location_data.city,
              state: location_data.state
            },
            at: new Date(),
            title: this.state.resume.title
          };

          updates['/activities/' + this.state.resume.uid + '/' + newActivityKey] = activityData;
          updates['/resumes/' + this.state.resume.resume_id + '/activities/' + newActivityKey] = activityData;
          updates['/users/' + this.state.resume.uid + '/resumes/' + this.state.resume.resume_id + '/activities/' + newActivityKey] = activityData;
          updates['/resumes/' + this.state.resume.resume_id + '/downloads'] = this.state.resume.downloads + 1;
          updates['/users/' + this.state.resume.uid + '/resumes/' + this.state.resume.resume_id + '/downloads'] = this.state.resume.downloads + 1;
          firebase.database().ref().update(updates).then(() => {
            this.setState({resume: {...resume, downloads: this.state.resume.downloads+1}});
          });
        })
      }

    };
    xhr.open('GET', url);
    xhr.send();
  }

	render() {
		const { numPages, resume } = this.state;
		return (
			<div className={classnames('container', 'resume-container', 'resume-published-view')}>
        <div className="btn-download-resume" onClick={() => {this.downloadResume(resume)}}><Icon.Download /><span>Download Resume</span></div>
        <Link className="logo-powered" to="/" target="_blank">
          <div className="font-15 weight-600 letter-spacing-6 grey-text">Powered by</div>
          <div className="font-30 weight-900 letter-spacing-7 grey-text">CEZAN</div>
        </Link>
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
