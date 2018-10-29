import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {Route} from 'react-router-dom';
import {ConnectedRouter} from 'connected-react-router'
import {isMobile, isTablet} from "react-device-detect";
import App from './containers/app'
import 'sanitize.css/sanitize.css'
import './index.css'
import ErrorBoundary from './utils/errors/ErrorBoundary';
import registerServiceWorker from './utils/errors/registerServiceWorker';
import configureStore from './store';
import {PersistGate} from 'redux-persist/integration/react';
import ReactLoading from 'react-loading';

const target = document.querySelector('#root');

let store = configureStore();
// store.persistor.purge();

render(
    <ErrorBoundary persistor={store.persistor}>
        <Provider store={store.store}>
            <PersistGate loading={<ReactLoading
                className={'center-block loader-pad'}
                type={'spin'}
                color='#921090'
                height={'15%'}
                width={'15%'}/>}
                persistor={store.persistor}>

                <ConnectedRouter history={store.history} onLocationChanged={(historyEvent) => {}}>
                    {(!isMobile || isTablet) ?
                        <Route path="/messages" component={App}/> :
                        <Route path="/m/messages" component={App}/>
                    }
                </ConnectedRouter>

            </PersistGate>
        </Provider>
    </ErrorBoundary>
    ,
    target
);

registerServiceWorker();

