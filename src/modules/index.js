import {combineReducers} from 'redux'
import conversations from './conversations/reducer'
import session from './session/reducer'

let rootReducer = combineReducers({
    conversations,
    session
});
export default rootReducer;