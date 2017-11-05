import React  from 'react';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Document, Page } from 'react-pdf';
import * as Icon from 'react-feather';
import { NotificationManager } from 'react-notifications';
import { resetNext } from '../../actions/auth';
import { push } from 'react-router-redux';
import { Modal } from 'reactstrap';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Stagger from 'react-css-stagger';

class Resume extends React.Component {
  state = {
    user: {...this.props.user, uid: firebase.auth().currentUser.uid},
    numPages: null,
    resume: null,
    modal_confirm_delete: false
  }

	componentWillMount() {
    const { resume_id } = this.props.params;
    if(!this.props.user['resumes'] || !this.props.user.resumes[resume_id]) {
      this.props.dispatch(push(this.props.next || '/404'));
      this.props.dispatch(resetNext());
      location.href='/404';
    }
    this.setState({ resume: {...this.props.user.resumes[resume_id], resume_id}});
	}

  componentWillReceiveProps() {
    const { resume_id } = this.state.resume;
    if(!this.props.user['resumes'] || !this.props.user.resumes[resume_id]) {
      this.props.dispatch(push(this.props.next || '/404'));
      this.props.dispatch(resetNext());
      location.href='/404';
    }
    this.setState({ resume: {...this.props.user.resumes[resume_id], resume_id}});
  }

  onDocumentLoad = ({ numPages }) => {
    this.setState({ numPages });
  }

  onDeleteResume = () => {
    const { resume } = this.state;
    let updates = {};
    updates['/resumes/' + resume.resume_id] = null;
    updates['/users/' + this.state.user.uid + '/resumes/' + resume.resume_id] = null;
    NotificationManager.success('Resume successfully deleted', '');
    firebase.database().ref().update(updates).then(() => {
      firebase.storage().ref().child('resumes/' + this.state.user.uid + '/' + resume.resume_id + '/source.pdf').delete().then(() => {
        this.props.dispatch(push(this.props.next || '/dashboard'));
        this.props.dispatch(resetNext());
      })
    });
  }

  onPreviewResume = () => {
    this.props.dispatch(push(this.props.next || '/preview/'+this.state.resume.resume_id));
    this.props.dispatch(resetNext());
  }

  onEditResume = () => {
    this.props.dispatch(push(this.props.next || '/edit/'+this.state.resume.resume_id));
    this.props.dispatch(resetNext());
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
              <div onClick={this.onPreviewResume}><i className="icon-img icon-preview" style={{backgroundColor: '#0097ff' }}><Icon.Eye size={20} color="white" /></i></div>
              <div onClick={this.onEditResume}><i className="icon-img icon-preview" style={{backgroundColor: '#4a4a4a' }}><Icon.Edit2 size={20} color="white" /></i></div>
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
  next: state.auth.next, 
	user: state.auth.user
}))(Resume);
