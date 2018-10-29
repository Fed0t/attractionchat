import { createStore, applyMiddleware, compose } from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk'
import createHistory from 'history/createBrowserHistory';
import rootReducer from './modules'
import logger from 'redux-logger'
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist'


export const history = createHistory();
const initialState = {};
const enhancers = [];
let middleware = [thunk,routerMiddleware(history)];

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__
   middleware = [thunk,logger, routerMiddleware(history)];
  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension())
  }
}

const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers
);

const persistConfig = {
    key: 'root',
    storage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);


export default () => {
    let store = createStore(
        connectRouter(history)(persistedReducer),
        initialState,
        composedEnhancers
    );
    let persistor = persistStore(store);
    return { store, persistor , history}
}
