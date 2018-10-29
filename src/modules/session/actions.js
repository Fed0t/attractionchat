import {UPDATE_SESSION} from './tags';
import cookie from 'react-cookies';

export const fetchSession = () => dispatch => {
    return new Promise((resolve, reject) => {
        let token = cookie.load('__attractionclub');
        let user_id = cookie.load('__id');
        let premium_int = cookie.load('premium');
        if (token && user_id) {
            dispatch({
                type: UPDATE_SESSION,
                payload: {token: token, id: user_id, premium: premium_int}
            });
            resolve({token: token, id: user_id, premium: premium_int});
        }
        else {
            reject(Error("Promise rejected"));
        }
    });
};
