import axios from 'axios';
import cookie from 'react-cookies';

const apiBackend = 'https://app.attractionclub.ro/api/v1';

export default axios.create({
    baseURL: apiBackend,
    headers: {
        'Authorization': 'Bearer '+ cookie.load('__attractionclub')
    }
});