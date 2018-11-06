import {
    FETCH_CONVERSATIONS,
    RECEIVE_MESSAGE,
    RECEIVE_IS_TYPING,
    RESET_IS_TYPING,
    FETCH_MORE_CONVERSATIONS,
    FETCH_MORE_MESSAGES,
    FETCH_UNREADED_CONVERSATIONS,
    FETCH_MORE_UNREADED_CONVERSATIONS,
    FETCH_TRASHED_CONVERSATIONS,
    FETCH_MORE_TRASHED_CONVERSATIONS,
    FETCH_SEARCH_CONVERSATIONS,
    FETCH_MORE_SEARCH_CONVERSATIONS,
    RESET_SEARCH_CONVERSATIONS,
    ARCHIVE_CONVERSATION,
    RESTORE_CONVERSATION,
    DESTROY_CONVERSATION,
    COUNT_UNREAD_CONVERSATIONS,
    UNREAD_CONVERSATION,
    FETCH_CONVERSATION
} from './tags';

import backendApi from '../../utils/Api';
import querystring from 'querystring';


export const sendMessage = (params) => dispatch => {
    return backendApi.post(`/chat/send`, params)
        .then(res => {
            dispatch({
                type: RECEIVE_MESSAGE,
                payload: res.data
            });
            return res;
        });
};


export const isTypingReceive = (message) => dispatch => {
    return new Promise((resolve, reject) => {
        if (message) {
            dispatch({
                type: RECEIVE_IS_TYPING,
                payload: message
            });
            resolve(message);
        }
        else {
            reject(Error("Promise rejected"));
        }
    });
};

export const isTypingReset = (conversation_id) => dispatch => {
    return new Promise((resolve, reject) => {
        if (conversation_id) {
            dispatch({
                type: RESET_IS_TYPING,
                payload: conversation_id
            });
            resolve(conversation_id);
        }
        else {
            reject(Error("Promise rejected"));
        }
    });
};

export const receiveMessage = (message) => dispatch => {
    return new Promise((resolve, reject) => {
        if (message) {
            dispatch({
                type: RECEIVE_MESSAGE,
                payload: message
            });
            resolve(message);
        }
        else {
            reject(Error("Promise rejected"));
        }
    });
};


export const fetchConversations = (args) => dispatch => {
    return backendApi.get(`/chat/conversations`)
        .then(res => {
            dispatch({
                type: FETCH_CONVERSATIONS,
                payload: res.data
            });
            return res;
        });
};


export const fetchMoreConversations = (nextPage) => dispatch => {
    return backendApi.get(nextPage).then(res => {
        dispatch({
            type: FETCH_MORE_CONVERSATIONS,
            payload: res.data
        });
        return res;
    });
};

export const fetchUnreadConversations = (args) => dispatch => {
    return backendApi.get(`/chat/conversations/unreaded`)
        .then(res => {
            dispatch({
                type: FETCH_UNREADED_CONVERSATIONS,
                payload: res.data
            });
            return res;
        });
};
export const fetchMoreUnreadedConversations = (nextPage) => dispatch => {
    return backendApi.get(nextPage).then((res) => {
        dispatch({
            type: FETCH_MORE_UNREADED_CONVERSATIONS,
            payload: res.data
        });
        return res;
    });
};


export const fetchTrashedConversations = (args) => dispatch => {
    return backendApi.get(`/chat/conversations/archived`)
        .then(res => {
            dispatch({
                type: FETCH_TRASHED_CONVERSATIONS,
                payload: res.data
            });
            return res;
        });
};


export const fetchMoreTrashedConversations = (nextPage) => dispatch => {
    return backendApi.get(nextPage).then((res) => {
        dispatch({
            type: FETCH_MORE_TRASHED_CONVERSATIONS,
            payload: res.data
        });
        return res;
    });
};

export const fetchConversation = (username) => dispatch => {
    return backendApi.get(`/chat/conversation/getMessagesByUsername`, {params: {username: username}})
        .then(res => {
            dispatch({
                type: FETCH_CONVERSATION,
                payload: res.data
            });

            return res;
        });
};

export const fetchMoreMessages = (url, conversation_id) => dispatch => {
    let parseUrl = querystring.parse(url);
    let parameters = {params: {conversation_id: conversation_id}};
    if (parseUrl.conversation_id) {
        parameters = {params: {}}
    }
    return backendApi.get(url, parameters)
        .then(res => {
            dispatch({
                type: FETCH_MORE_MESSAGES,
                payload: res.data
            });
            return res;
        });
};

export const fetchMoreMessagesWithoutDispatch = (url, conversation_id) => dispatch => {
    let parseUrl = querystring.parse(url);
    let parameters = {params: {conversation_id: conversation_id}};
    if (parseUrl.conversation_id) {
        parameters = {params: {}}
    }
    return backendApi.get(url, parameters)
        .then(res => {
            return res;
        });
};

export const searchConversation = (username) => dispatch => {
    return backendApi.post(`/chat/conversation/search`, {username: username})
        .then(res => {
            if (res.data.success) {
                dispatch({
                    type: FETCH_SEARCH_CONVERSATIONS,
                    payload: res.data.result
                });
            } else {
                dispatch({
                    type: RESET_SEARCH_CONVERSATIONS,
                    payload: []
                });
            }
            return res;
        });
};

export const searchMoreConversation = (url) => dispatch => {
    return backendApi.post(url)
        .then(res => {
            if (res.data.success) {
                dispatch({
                    type: FETCH_MORE_SEARCH_CONVERSATIONS,
                    payload: res.data.result
                });
            }
            return res;
        });
};

export const archiveConversation = (id) => dispatch => {
    return backendApi.post(`/chat/conversation/delete`, {conversation_id: id})
        .then(res => {
            dispatch({
                type: ARCHIVE_CONVERSATION,
                payload: res.data
            });
            return res;
        });
};

export const restoreConversation = (id) => dispatch => {
    return backendApi.post(`/chat/conversation/restore`, {conversation_id: id})
        .then(res => {
            dispatch({
                type: RESTORE_CONVERSATION,
                payload: res.data
            });
            return res;
        });
};
export const deleteForever = (id) => dispatch => {
    return backendApi.post(`/chat/conversation/destroy`, {conversation_id: id})
        .then(res => {
            dispatch({
                type: DESTROY_CONVERSATION,
                payload: res.data
            });
            return res;
        });
};

export const dispatchMessageLocal = (message) => dispatch => {
    dispatch({
        type: RECEIVE_MESSAGE,
        payload: message
    });
};
export const countUnreadConversations = () => dispatch => {
    return backendApi.post(`/chat/conversations/unreaded/count`)
        .then(res => {
            dispatch({
                type: COUNT_UNREAD_CONVERSATIONS,
                payload: res.data
            });
            return res;
        });
};

export const unreadConversation = (id) => dispatch => {
    return backendApi.post(`/chat/conversations/unreaded/unflag`, {conversation_id: id})
        .then(res => {
            dispatch({
                type: UNREAD_CONVERSATION,
                payload: res.data
            });
            return res;
        });
};

