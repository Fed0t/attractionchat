import axios from 'axios';
import cookie from 'react-cookies';

const apiBackend = 'https://app.attractionclub.ro/api/v1';

let token = cookie.load('__attractionclub');

if (window.location && window.location.href && window.location.href.includes('localhost:')) {
    token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDkzMjQ0MTIsImp0aSI6IkVTcHU4RUkyZVlTVk9SbXpETHJcL3JBPT0iLCJpc3MiOiJhdHRyYWN0aW9uY2x1Yi5ybyIsIm5iZiI6MTYwOTMyNDQxMiwic3ViIjoxMTQ1MjgsImV4cCI6MTYxMTk1NDE1NSwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoxMTQ1Mjh9fX0.bSe2w-e2g1mMUFfoURN2rkETNslQZeNZQPgrHWs_CdM';
}

export default axios.create({
    baseURL: apiBackend,
    headers: {
        'Authorization': `Bearer ${token}`
    }
});