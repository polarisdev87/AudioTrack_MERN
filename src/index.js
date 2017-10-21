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
import Logout from './components/auth/Logout'
import Dashboard from './components/secure/Dashboard'
import Profile from './components/secure/Profile'

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
					<Route path='logout' component={Logout}/>
					<Route path='dashboard' component={Dashboard} onEnter={secure}/>
					<Route path='profile' component={Profile} onEnter={secure}/>
				</Route>
			</Router>
    </StripeProvider>
	</Provider>,
	document.getElementById('root')
);