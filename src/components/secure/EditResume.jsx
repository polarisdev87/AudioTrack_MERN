import React  from 'react';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Document, Page } from 'react-pdf';
import * as Icon from 'react-feather';
import { NotificationManager } from 'react-notifications';
import { resetNext } from '../../actions/auth';
import { push } from 'react-router-redux';
import { Link } from 'react-router';
import { Modal } from 'reactstrap';
import Stagger from 'react-css-stagger';
import AudioTracks from '../public/AudioTracks';
import $ from 'jquery';

class EditResume extends React.Component {
  state = {
    user: {...this.props.user, uid: firebase.auth().currentUser.uid},
    numPages: null,
    resume: null,
    modal_confirm_publish: false,
    confirm_publish: '',
    modal_confirm_delete: false
  }

	componentWillMount() {
    const { resume_id } = this.props.params;
    if(!this.props.user['resumes'] || !this.props.user.resumes[resume_id]) {
      this.props.dispatch(push(this.props.next || '/404'));
      this.props.dispatch(resetNext());
    }
    this.setState({ resume: {...this.props.user.resumes[resume_id], resume_id}});
	}

  componentWillReceiveProps() {
    const { resume_id } = this.state.resume;
    if(!this.props.user['resumes'] || !this.props.user.resumes[resume_id]) {
      this.props.dispatch(push(this.props.next || '/404'));
      this.props.dispatch(resetNext());
    }
    this.setState({ resume: {...this.props.user.resumes[resume_id], resume_id}});
  }

  onDocumentLoad = ({ numPages }) => {
    this.setState({ numPages });
  }

  onDeleteResume = () => {
    const { resume } = this.state;
    let batch = firebase.firestore().batch();
    batch.delete(firebase.firestore().doc('/resumes/' + resume.resume_id));
    batch.delete(firebase.firestore().doc('/users/' + this.state.user.uid + '/resumes/' + resume.resume_id));
    // Promise.all([
    //   firebase.firestore().collection('resumes').doc(resume.resume_id).collection('tracks').get(),
    //   firebase.firestore().collection('users').doc(this.state.user.uid).collection('resumes').doc(resume.resume_id).collection('tracks').get(),
    // ]).then((data) => {
    //   data[0].forEach((snapshot) => {
    //     batch.delete(firebase.firestore().doc('/resumes/' + resume.resume_id + '/tracks' + snapshot.id));
    //   });
    //   data[1].forEach((snapshot) => {
    //     batch.delete(firebase.firestore().doc('/users/' + this.state.user.uid + '/resumes/' + resume.resume_id + '/tracks' + snapshot.id));
    //   })
    //   return Promise.resolve();
    // }).then(() => {
      batch.commit().then(() => {
        firebase.storage().ref().child('resumes/' + this.state.user.uid + '/' + resume.resume_id + '/source.pdf').delete().then(() => {
          this.props.dispatch(push(this.props.next || '/dashboard'));
          this.props.dispatch(resetNext());
        })
      })
      NotificationManager.success('Resume successfully deleted', '');
    // })
  }

  validateResume = () => {
    const { resume } = this.state;
    return new Promise((resolve, reject) => {
      if(resume.link_modified === true) {
        return resolve();
      } else {
        firebase.firestore().collection('resumes').get().then((snapshot) => {
          let resumes = [];
          snapshot.forEach((childSnapshot) => {
            resumes.push({...childSnapshot.data(), resume_id: childSnapshot.id});
          });
          resumes.every((r) => {
            if(r.resume_id !== resume.resume_id && r.published===true) {
              if(resume.link === r.link) {
                reject();
                return false;
              }
            }
            return true;
          });
          resolve();
        });
      }
    });
  }

  onPublishResume = () => {
    this.validateResume().then(() => {
      const { resume } = this.state;
      let cancelled = false;
      const resumeData = {
        ...resume,
        published: true,
        modified: new Date()
      };


      if(this.state.user.credits <= 0) {
       cancelled = true;
       NotificationManager.error('You have no credits left to upload resume.', '');
       $('.btn-buy-credit').click();
      }

      if(!cancelled) {

        let batch = firebase.firestore().batch();
        batch.set(firebase.firestore().doc('/resumes/' + resume.resume_id), resumeData, {merge: true});
        batch.set(firebase.firestore().doc('/users/' + this.state.user.uid + '/resumes/' + this.state.resume.resume_id), resumeData, {merge: true});
        batch.set(firebase.firestore().doc('/users/' + this.state.user.uid), {
          credits: this.state.user.credits - 1,
        }, {merge: true});

        batch.commit().then(() => {
          NotificationManager.success('Resume published successfully', '');
          this.props.dispatch(push(this.props.next || '/dashboard'));
          this.props.dispatch(resetNext());
        })
                
      }
    }).catch((e) => {
      console.log('efefe222222');
      NotificationManager.error('Duplicate Link exists...', 'Cannot publish this resume.');
    });
  }

  toggleConfirmPublish = () => {
    this.setState({
      modal_confirm_publish: !this.state.modal_confirm_publish
    });
  }

  confirmPublish = () => {
    this.toggleConfirmPublish();
    this.onPublishResume();
  }

  toggleConfirmDelete = () => {
    this.setState({
      modal_confirm_delete: !this.state.modal_confirm_delete
    });
  }

  confirmDelete = () => {
    this.onDeleteResume();
  }

	render() {
		const { numPages, resume } = this.state;
		return (
			<div className={classnames('container', 'resume-container')}>
        { resume && (
          <div className="resume-builder">
            <Stagger transition="floatfromleft" delay={150} className="resume-builder-icons">
              <div onClick={this.toggleConfirmDelete}><i className="icon-img icon-trash" style={{backgroundColor: '#f54056' }}><Icon.Trash size={20} color="white" /></i></div>
              <Link to={'/preview/' + resume.resume_id} target="_blank"><i className="icon-img icon-preview" style={{backgroundColor: '#0097ff' }}><Icon.Eye size={20} color="white" /></i></Link>
              <div onClick={this.toggleConfirmPublish} style={{display: resume.published?'none':'block'}}><i className="icon-img icon-rocket" style={{backgroundColor: '#00c695' }}><img src={process.env.PUBLIC_URL + '/assets/img/icons/icon-rocket.svg'} alt="rocket" /></i></div>
            </Stagger>
            <Modal isOpen={this.state.modal_confirm_delete} toggle={this.toggleConfirmDelete} className={classnames(this.props.className, 'modal-confirm-delete-resume')}>
              <div className="modal-confirm-delete-content">
                <div className="d-flex flex-column align-items-center">
                  <div className="font-18 weight-600 letter-spacing-4 black-text">Heads Up!</div>
                  <div className="font-15 weight-300 letter-spacing-3 black-text mt-5">By deleting your resume all data pretained to it and your link will no longer be avaliable. </div>
                </div>
                <button className="btn btn-confirm-delete mt-5" onClick={this.confirmDelete}>Delete Forever</button>
              </div>
            </Modal>
            <Modal isOpen={this.state.modal_confirm_publish} toggle={this.toggleConfirmPublish} className={classnames(this.props.className, 'modal-confirm-publish')}>
              <div className="modal-confirm-publish-content">
                <div className="d-flex flex-column align-items-center">
                  <Icon.ThumbsUp color="#04cda0" />
                  <div className="font-18 letter-spacing-0 black-text mt-2">Ready to Publish?</div>
                  <div className="font-15 letter-spacing-0 grey-text">Be sure to double check your resume for typos!</div>
                </div>
                <button className="btn btn-confirm-publish mt-5" onClick={this.confirmPublish}>PUBLISH 🚀</button>
              </div>
            </Modal>
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
                      width={Math.min(600, document.body.clientWidth - 30)} /*width={600}*/
                      className="resume-page"
                    >
                      <AudioTracks resume={resume} pageNumber={index + 1} type="edit" />
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
}))(EditResume);
