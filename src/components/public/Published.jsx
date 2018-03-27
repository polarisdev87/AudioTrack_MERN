import React  from 'react';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Document, Page } from 'react-pdf';
import * as Icon from 'react-feather';
import { Link } from 'react-router';
import AudioPreviewTracks from '../public/AudioPreviewTracks';
import axios from 'axios';
import { serverUrl } from '../../../config';

class Published extends React.Component {
  state = {
    numPages: null,
    resume: null,
    finishGuide: false,
    author: null
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
      firebase.firestore().collection('resumes').get().then((querySnapshot) => {
        const resume_data = {};
        querySnapshot.forEach((snapshot) => {
          resume_data[snapshot.id] = snapshot.data();
        })
        // let resume_data = snapshot.data();
        let found = false;
        Object.keys(resume_data).every((resume_id) => {
          let resume = resume_data[resume_id];
          if(!resume.published) return true;
          if(resume.link !== resume_link) return true;
          this.setState({ resume: {...resume, resume_id} });
          found = true;
          return false;
        });
        if(found) {
          resolve();
        } else {
          reject();
        }
      });
    });

    Promise.all([authPromise, resumePromise]).then(() => {
      firebase.firestore().doc('/users/' + this.state.resume.uid).get().then((snapshot) => {
        this.setState({ author: {...snapshot.data()} });
      });
      if(!this.state.user || (this.state.user && this.state.user.uid !== this.state.resume.uid)) {
        // axios.get('https://geoip-db.com/json/').then((res) => {
        axios.get('https://freegeoip.net/json/').then((res) => {
          const location_data = res.data;

          const newActivityKey = firebase.firestore().collection('resumes').doc().id;
          const activityData = {
            type: 'view',
            location: {
              city: location_data.city,
              state: location_data.region_name
              // state: location_data.state
            },
            at: new Date(),
            title: this.state.resume.title
          };

          let batch = firebase.firestore().batch();

          batch.set(firebase.firestore().doc('/activities/' + this.state.resume.uid + '/activities/' + newActivityKey), activityData, {merge: true});
          batch.set(firebase.firestore().doc('/resumes/' + this.state.resume.resume_id + '/activities/' + newActivityKey), activityData, {merge: true});
          batch.set(firebase.firestore().doc('/users/' + this.state.resume.uid + '/resumes/' + this.state.resume.resume_id + '/activities/' + newActivityKey), activityData, {merge: true});
          batch.set(firebase.firestore().doc('/resumes/' + this.state.resume.resume_id), {
            views: this.state.resume.views + 1,
          }, {merge: true});
          batch.set(firebase.firestore().doc('/users/' + this.state.resume.uid + '/resumes/' + this.state.resume.resume_id), {
            views: this.state.resume.views + 1,
          }, {merge: true});

          batch.commit().then(() => {
            axios.post(serverUrl + '/sendmail', {
              content: {
                to: this.state.author.email,
                author: this.state.author,
                ...activityData
              }
            });
          });

        })
      }
    }).catch(() => {
      location.href='/404';
    })
	}

  componentDidMount() {
  }

  onDocumentLoad = ({ numPages }) => {
    this.setState({ numPages });
  }

  setFinishGuide = () => {
    this.setState({ finishGuide: true });
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
        // axios.get('https://geoip-db.com/json/').then((res) => {
        axios.get('https://freegeoip.net/json/').then((res) => {
          const location_data = res.data;

          const newActivityKey = firebase.firestore().collection('resumes').doc().id;
          const activityData = {
            type: 'download',
            location: {
              city: location_data.city,
              state: location_data.region_name
              // state: location_data.state
            },
            at: new Date(),
            title: this.state.resume.title
          };

          let batch = firebase.firestore().batch();

          batch.set(firebase.firestore().doc('/activities/' + this.state.resume.uid + '/activities/' + newActivityKey), activityData, {merge: true});
          batch.set(firebase.firestore().doc('/resumes/' + this.state.resume.resume_id + '/activities/' + newActivityKey), activityData, {merge: true});
          batch.set(firebase.firestore().doc('/users/' + this.state.resume.uid + '/resumes/' + this.state.resume.resume_id + '/activities/' + newActivityKey), activityData, {merge: true});
          batch.set(firebase.firestore().doc('/resumes/' + this.state.resume.resume_id), {
            downloads: this.state.resume.downloads + 1,
          }, {merge: true});
          batch.set(firebase.firestore().doc('/users/' + this.state.resume.uid + '/resumes/' + this.state.resume.resume_id), {
            downloads: this.state.resume.downloads + 1,
          }, {merge: true});

          batch.commit().then(() => {
            this.setState({resume: {...resume, downloads: this.state.resume.downloads+1}});

            axios.post(serverUrl + '/sendmail', {
              content: {
                to: this.state.author.email,
                author: this.state.author,
                ...activityData
              }
            });
          })

        })
      }

    };
    xhr.open('GET', url);
    xhr.send();
  }

	render() {
		const { numPages, resume, author, finishGuide } = this.state;
		return (
			<div className={classnames('container', 'resume-container', 'resume-published-view')}>
        { author && !finishGuide && (
          <div className="guide-tour">
            <div className="font-15 weight-bold letter-spacing-3">Hear {author.displayName} Speak!</div>
            <div className="font-12 letter-spacing-3 line-height-16" style={{ margin: '1rem 0' }}>Click the <img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-play-small.svg'} alt="icon-record" /> buttons to hear {author.displayName}'s story and experiences!</div>
            <div className="btn-okay-tour" onClick={this.setFinishGuide}>Okay!</div>
          </div>
        ) }
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
                      width={Math.min(600, document.body.clientWidth - 30)} /*width={600}*/
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
	user: state.auth.user
}))(Published);
