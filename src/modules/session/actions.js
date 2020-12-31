import { UPDATE_SESSION } from './tags';
import cookie from 'react-cookies';

export const fetchSession = () => dispatch => {
    return new Promise((resolve, reject) => {
        let token = cookie.load('__attractionclub');
        let user_id = cookie.load('__id');
        let premium_int = cookie.load('premium');
        if (window.location && window.location.href && window.location.href.includes('localhost:')) {
            token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDkzMjQ0MTIsImp0aSI6IkVTcHU4RUkyZVlTVk9SbXpETHJcL3JBPT0iLCJpc3MiOiJhdHRyYWN0aW9uY2x1Yi5ybyIsIm5iZiI6MTYwOTMyNDQxMiwic3ViIjoxMTQ1MjgsImV4cCI6MTYxMTk1NDE1NSwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoxMTQ1Mjh9fX0.bSe2w-e2g1mMUFfoURN2rkETNslQZeNZQPgrHWs_CdM';
            user_id = '114528';
            premium_int = '1';
        }
        if (token && user_id) {
            dispatch({
                type: UPDATE_SESSION,
                payload: { token: token, id: user_id, premium: premium_int }
            });
            resolve({ token: token, id: user_id, premium: premium_int });
        }
        else {
            reject(Error("Promise rejected"));
        }
    });
};
