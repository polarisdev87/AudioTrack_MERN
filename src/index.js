import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { StripeProvider } from 'react-stripe-elements';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux';
import { requireAuth } from './utils/secure';
import * as reducers from './reducers'

import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';

import './assets/styles/App.css';

import App from './components/App'
import Home from './components/public/Home'
import Terms from './components/public/Terms'
import Privacy from './components/public/Privacy'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Payment from './components/auth/Payment'
import Logout from './components/auth/Logout'
import Forgot from './components/auth/Forgot'
import Confirm from './components/auth/Confirm'
import Dashboard from './components/secure/Dashboard'
import Profile from './components/secure/Profile'
import Resume from './components/secure/Resume'
import PreviewResume from './components/secure/PreviewResume'
import EditResume from './components/secure/EditResume'
import Published from './components/secure/Published'

const reducer = combineReducers({
	...reducers,
	routing: routerReducer
});

//noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
	reducer,
	composeEnhancers(applyMiddleware(routerMiddleware(browserHistory)))
);

const history = syncHistoryWithStore(browserHistory, store);

const secure = requireAuth(store);

ReactDOM.render(
	<Provider store={store}>
    <StripeProvider apiKey="pk_test_GFZkKo51tFb2tpOiSxsIcAxQ">
			<Router history={history}>
				<Route path='/' component={App}>
					<IndexRoute component={Home}/>
					<Route path='terms' component={Terms}/>
					<Route path='privacy-policy' component={Privacy}/>
					<Route path='login' component={Login}/>
					<Route path='signup' component={Signup}/>
					<Route path='payment' component={Payment}/>
					<Route path='logout' component={Logout}/>
					<Route path='forgot' component={Forgot}/>
					<Route path='confirm' component={Confirm}/>
					<Route path='dashboard' component={Dashboard} onEnter={secure}/>
					<Route path='profile' component={Profile} onEnter={secure}/>
					<Route path='edit/:resume_id' component={EditResume} onEnter={secure}/>
					<Route path='preview/:resume_id' component={PreviewResume} onEnter={secure}/>
					<Route path='resume/:resume_id' component={Resume} onEnter={secure}/>
					<Route path='r/:resume_id' component={Published} onEnter={secure}/>
				</Route>
			</Router>
    </StripeProvider>
	</Provider>,
	document.getElementById('root')
);