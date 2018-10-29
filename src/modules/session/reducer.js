import {UPDATE_SESSION} from './tags';

const initialState = {
    token: null,
    user_id: null,
    premium: 0,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_SESSION:
            return {
                ...state,
                token: action.payload.token,
                user_id: action.payload.id,
                premium: action.payload.premium
            };
        default:
            return state
    }
}