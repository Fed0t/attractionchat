import {
    FETCH_CONVERSATIONS,
    FETCH_MORE_CONVERSATIONS,
    RECEIVE_MESSAGE,
    RECEIVE_IS_TYPING,
    FETCH_MORE_MESSAGES,
    FETCH_UNREADED_CONVERSATIONS,
    FETCH_MORE_UNREADED_CONVERSATIONS,
    FETCH_TRASHED_CONVERSATIONS,
    FETCH_MORE_TRASHED_CONVERSATIONS,
    FETCH_SEARCH_CONVERSATIONS,
    FETCH_MORE_SEARCH_CONVERSATIONS,
    RESET_SEARCH_CONVERSATIONS,
    RESET_IS_TYPING,
    ARCHIVE_CONVERSATION,
    RESTORE_CONVERSATION,
    DESTROY_CONVERSATION,
    COUNT_UNREAD_CONVERSATIONS,
    UNREAD_CONVERSATION,
    FETCH_CONVERSATION
} from './tags';
import update from 'immutability-helper';
import unionBy from 'lodash/unionBy';
import uniqBy from 'lodash/uniqBy';
import findIndex from 'lodash/findIndex';
import {copy} from '../../utils/Utils';

update.extend('$concat', function (messages, originalMessages) {
    return unionBy(originalMessages, messages, "message_id");
});

Object.defineProperty(Array.prototype, 'precat', {
    configurable: true,
    writable: true,
    value: function precat() {
        return Array.prototype.concat.call([], ...arguments, this)
    }
});

const moveFirstToHead = ([head, ...tail], predicate, accumulator = []) =>
    (predicate.call(null, head)) ?
        [head].concat(accumulator).concat(tail) : moveFirstToHead(tail, predicate, accumulator.concat(head));


const initialState = {
    valid: {
        list: [],
        next_page_url: null
    },
    archived: {
        list: [],
        next_page_url: null
    },
    unread: {
        list: [],
        next_page_url: null
    },
    search: {
        list: [],
        next_page_url: null
    },
    stats: {
        unread_count: 0,
    }
};

export default (state = initialState, action) => {
    let conversationIndex = null;
    let listName = null;
    let conversationObj = null;

    switch (action.type) {
        //VALID LIST
        case FETCH_CONVERSATIONS:
            return update(state, {
                valid: {
                    list: {$set: action.payload.data},
                    next_page_url: {$set: action.payload.next_page_url}
                }
            });
        case FETCH_MORE_CONVERSATIONS:
            return update(state, {
                valid: {
                    list: {$set: merge(state.valid.list,action.payload.data,'id')},
                    next_page_url: {$set: action.payload.next_page_url}
                }
            });
        //UNREAD LIST
        case FETCH_UNREADED_CONVERSATIONS:
            return update(state, {
                unread: {
                    list: {$set: action.payload.data},
                    next_page_url: {$set: action.payload.next_page_url}
                }
            });
        case FETCH_MORE_UNREADED_CONVERSATIONS:
            return update(state, {
                unread: {
                    list: {$set: merge(state.unread.list,action.payload.data,'id')},
                    next_page_url: {$set: action.payload.next_page_url}
                }
            });
        //UNREAD LIST
        case FETCH_SEARCH_CONVERSATIONS:
            return update(state, {
                search: {
                    list: {$set: action.payload.data},
                    next_page_url: {$set: action.payload.next_page_url}
                }
            });
        case FETCH_MORE_SEARCH_CONVERSATIONS:
            return update(state, {
                search: {
                    list: {$set: merge(state.search.list,action.payload.data,'id')},
                    next_page_url: {$set: action.payload.next_page_url}
                }
            });
        case RESET_SEARCH_CONVERSATIONS:
            return update(state, {
                search: {
                    list: {$set: []},
                    next_page_url: {$set: null}
                }
            });
        //ARCHIVED CONVERSATIONS
        case FETCH_TRASHED_CONVERSATIONS:
            return update(state, {
                archived: {
                    list: {$set: action.payload.data},
                    next_page_url: {$set: action.payload.next_page_url}
                }
            });

        case FETCH_CONVERSATION:
            return update(state,{
                valid: {
                    list: {$set: state.valid.list.concat(action.payload)},
                }
            });
        case RECEIVE_MESSAGE:

            let message = copy(action.payload);
            let conversation = copy(action.payload.conversation);
            let payload = action.payload;

            delete message['conversation'];

            let receiveMessageState = state;
            let isReaded = 0;
            let result = null;

            //ARHIVATE DACA CONV EXISTA
            conversationIndex = findIndex(state.archived.list, {recipient_id: conversation.recipient_id});
            if (conversationIndex !== -1) {
                listName = 'archived';
                isReaded = state[listName].list[conversationIndex].readed;
                receiveMessageState = update(receiveMessageState, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                messagesPaginated: {
                                    data: {$apply: function (messages) {
                                        let merged = messages.precat([message]);
                                        return uniqBy(merged,'id');
                                    }},
                                },
                                readed: {$set: (payload.message.user.id === conversation.sender.id) ? 1 : 0},
                                messages: {$set: [message]}
                            }
                        }
                    }
                });
                result = moveFirstToHead(receiveMessageState.archived.list, element => element.recipient_id === conversation.recipient_id);
                receiveMessageState = update(receiveMessageState, {
                    [listName]: {
                        list: {
                            $set: result
                        }
                    }
                });
            }
            //SEARCH DACA CONV EXISTA
            conversationIndex = findIndex(state.search.list, {recipient_id: conversation.recipient_id});
            if (conversationIndex !== -1) {
                listName = 'search';
                isReaded = state[listName].list[conversationIndex].readed;
                receiveMessageState = update(receiveMessageState, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                messagesPaginated: {
                                    data: {$apply: function (messages) {
                                        let merged = messages.precat([message]);
                                        return uniqBy(merged,'id');
                                    }},
                                },
                                readed: {$set: (payload.message.user.id === conversation.sender.id) ? 1 : 0},
                                messages: {$set: [message]}
                            }
                        }
                    }
                });
                result = moveFirstToHead(receiveMessageState.search.list, element => element.recipient_id === conversation.recipient_id);
                receiveMessageState = update(receiveMessageState, {
                    [listName]: {
                        list: {
                            $set: result
                        }
                    }
                });
            }


            //NECITITE DACA CONV EXISTA
            conversationIndex = findIndex(state.unread.list, {recipient_id: conversation.recipient_id});
            if (conversationIndex !== -1) {
                listName = 'unread';
                isReaded = state[listName].list[conversationIndex].readed;
                receiveMessageState = update(receiveMessageState, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                messagesPaginated: {
                                    data: {$apply: function (messages) {
                                        let merged = messages.precat([message]);
                                        return uniqBy(merged,'id');
                                    }},
                                },
                                readed: {$set: (payload.message.user.id === conversation.sender.id) ? 1 : 0},
                                messages: {$set: [message]}
                            }
                        }
                    }
                });
                result = moveFirstToHead(receiveMessageState.unread.list, element => element.recipient_id === conversation.recipient_id);
                receiveMessageState = update(receiveMessageState, {
                    [listName]: {
                        list: {
                            $set: result
                        }
                    }
                });
            }

            //NEW CONVERSATION UNREAD LIST
            if (conversationIndex === -1) {
                let newConversation = {...conversation, messages: [{...message}]};
                receiveMessageState = update(receiveMessageState, {
                    unread: {
                        list: {$unshift: [newConversation]},
                        next_page_url: {$set: newConversation.messagesPaginated.data.next_page_url}
                    }
                });
                let arrayResultUnread = moveFirstToHead(receiveMessageState.unread.list, element => element.recipient_id === newConversation.recipient_id);
                receiveMessageState = update(receiveMessageState, {
                    unread: {
                        list: {$set: arrayResultUnread}
                    }
                });
            }

            conversationIndex = findIndex(state.valid.list, {recipient_id: conversation.recipient_id});
            if (conversationIndex !== -1) {
                listName = 'valid';
                isReaded = state[listName].list[conversationIndex].readed;
                receiveMessageState = update(receiveMessageState, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                messagesPaginated: {
                                    data: {$apply: function (messages) {
                                        let merged = messages.precat([message]);
                                        return uniqBy(merged,'id');
                                    }},
                                },
                                readed: {$set: (payload.message.user.id === conversation.sender.id) ? 1 : 0},
                                messages: {$set: [message]}
                            }
                        }
                    },
                    stats: {
                        unread_count: {$set: (payload.message.user.id === conversation.sender.id) ? (state.stats.unread_count + 1) : state.stats.unread_count}
                    }
                });

                result = moveFirstToHead(receiveMessageState.valid.list, element => {
                    if(element.recipient_id){
                        return element.recipient_id === conversation.recipient_id
                    }
                });

                receiveMessageState = update(receiveMessageState, {
                    [listName]: {
                        list: {
                            $set: result
                        }
                    }
                });
            }

            //NEW CONVERSATION VALID LIST
            if (conversationIndex === -1) {
                let newConversation = {...conversation, messages: [{...message}]};
                receiveMessageState = update(receiveMessageState, {
                    valid: {
                        list: {$unshift: [newConversation]},
                        next_page_url: {$set: newConversation.messagesPaginated.data.next_page_url}
                    }
                });
                let arrayResult = moveFirstToHead(receiveMessageState.valid.list, element => element.recipient_id === newConversation.recipient_id);
                receiveMessageState = update(receiveMessageState, {
                    valid: {
                        list: {$set: arrayResult},
                    },
                    stats: {
                        unread_count: {$set: (state.stats.unread_count + 1)}
                    }
                });
            }

            return update(state, {$set: receiveMessageState});

        case RECEIVE_IS_TYPING:
            conversationIndex = findIndex(state.valid.list, {recipient_id: Number(action.payload.sender)});
            if (conversationIndex !== -1) {
                return update(state, {
                    valid: {
                        list: {
                            [conversationIndex]: {
                                is_typing: {$set: true}
                            }
                        }
                    }
                });
            }
            return state;


        case RESET_IS_TYPING:
            conversationIndex = findIndex(state.valid.list, {id: Number(action.payload)});
            if (conversationIndex !== -1) {
                return update(state, {
                    valid: {
                        list: {
                            [conversationIndex]: {
                                is_typing: {$set: false}
                            }
                        }
                    }
                });
            }
            return state;

        case FETCH_MORE_TRASHED_CONVERSATIONS:
            return update(state, {
                archived: {
                    list: {$set: state.archived.list.concat(action.payload.data)},
                    next_page_url: {$set: action.payload.next_page_url}
                }
            });

        case FETCH_MORE_MESSAGES:
            let messages = [];
            let moreMessagesState = state;

            conversationIndex = findIndex(state.valid.list, {recipient_id: action.payload.recipient_id});
            if (conversationIndex !== -1) {
                listName = 'valid';
                messages = unionBy(state.valid.list[conversationIndex].messagesPaginated.data, action.payload.messagesPaginated.data, 'message_id');
                moreMessagesState = update(moreMessagesState, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                messagesPaginated: {
                                    data: {$set: messages},
                                    next_page_url: {$set: action.payload.messagesPaginated.next_page_url}
                                }
                            }
                        }
                    }
                });
            }

            conversationIndex = findIndex(state.unread.list, {recipient_id: action.payload.recipient_id});
            if (conversationIndex !== -1) {
                messages = unionBy(state.unread.list[conversationIndex].messagesPaginated.data, action.payload.messagesPaginated.data, 'message_id');
                listName = 'unread';
                moreMessagesState = update(moreMessagesState, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                messagesPaginated: {
                                    data: {$set: messages},
                                    next_page_url: {$set: action.payload.messagesPaginated.next_page_url}
                                }
                            }
                        }
                    }
                });
            }

            conversationIndex = findIndex(state.archived.list, {recipient_id: action.payload.recipient_id});
            if (conversationIndex !== -1) {
                messages = unionBy(state.archived.list[conversationIndex].messagesPaginated.data, action.payload.messagesPaginated.data, 'message_id');
                listName = 'archived';
                moreMessagesState = update(moreMessagesState, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                messagesPaginated: {
                                    data: {$set: messages},
                                    next_page_url: {$set: action.payload.messagesPaginated.next_page_url}
                                }
                            }
                        }
                    }
                });
            }

            conversationIndex = findIndex(state.search.list, {recipient_id: action.payload.recipient_id});
            if (conversationIndex !== -1) {
                messages = unionBy(state.search.list[conversationIndex].messagesPaginated.data, action.payload.messagesPaginated.data, 'message_id');
                listName = 'search';
                moreMessagesState = update(moreMessagesState, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                messagesPaginated: {
                                    data: {$set: messages},
                                    next_page_url: {$set: action.payload.messagesPaginated.next_page_url}
                                }
                            }
                        }
                    }
                });
            }

            return update(state, {
                $set: moreMessagesState
            });

        case ARCHIVE_CONVERSATION:
            let archiveState = state;
            conversationIndex = findIndex(state.valid.list, {'id': action.payload.conversation_id});

            if (conversationIndex !== -1) {
                listName = 'valid';
                conversationObj = copy(state.valid.list[conversationIndex]);
                archiveState = update(archiveState, {
                    [listName]: {
                        list: {$unset: [conversationIndex]}
                    }
                });
            }

            conversationIndex = findIndex(state.unread.list, {'id': action.payload.conversation_id});
            if (conversationIndex !== -1) {
                listName = 'unread';
                conversationObj = copy(state.unread.list[conversationIndex]);
                archiveState = update(archiveState, {
                    [listName]: {
                        list: {$unset: [conversationIndex]}
                    }
                });
            }

            conversationIndex = findIndex(state.search.list, {'id': action.payload.conversation_id});
            if (conversationIndex !== -1) {
                listName = 'search';
                conversationObj = copy(state.search.list[conversationIndex]);
                archiveState = update(archiveState, {
                    [listName]: {
                        list: {$unset: [conversationIndex]}
                    }
                });
            }

            conversationIndex = findIndex(state.archived.list, {'id': action.payload.conversation_id});
            if (conversationIndex !== -1) {
                listName = 'archived';
                archiveState = update(archiveState, {
                    [listName]: {
                        list: {$unshift: [conversationObj]}
                    }
                });
            }


            return update(state, {$set: archiveState});

        case RESTORE_CONVERSATION:
            let restoreState = state;
            conversationIndex = findIndex(state.valid.list, {'id': action.payload.conversation_id});

            if (conversationIndex !== -1) {
                listName = 'valid';
                conversationObj = copy(state.valid.list[conversationIndex]);
                restoreState = update(restoreState, {
                    [listName]: {
                        list: {$unshift: [conversationObj]}
                    }
                });
            }

            conversationIndex = findIndex(state.unread.list, {'id': action.payload.conversation_id});
            if (conversationIndex !== -1) {
                listName = 'unread';
                conversationObj = copy(state.unread.list[conversationIndex]);
                restoreState = update(restoreState, {
                    [listName]: {
                        list: {$unset: [conversationIndex]}
                    }
                });
            }

            conversationIndex = findIndex(state.search.list, {'id': action.payload.conversation_id});
            if (conversationIndex !== -1) {
                listName = 'search';
                conversationObj = copy(state.search.list[conversationIndex]);
                restoreState = update(restoreState, {
                    [listName]: {
                        list: {$unset: [conversationIndex]}
                    }
                });
            }

            conversationIndex = findIndex(state.archived.list, {'id': action.payload.conversation_id});
            if (conversationIndex !== -1) {
                listName = 'archived';
                restoreState = update(restoreState, {
                    [listName]: {
                        list: {$unset: [conversationIndex]}
                    }
                });
            }
            return update(state, {$set: restoreState});
        case DESTROY_CONVERSATION:
            conversationIndex = findIndex(state.archived.list, {'id': action.payload.conversation_id});
            return update(state, {
                archived: {
                    list: {$unset: [conversationIndex]}
                }
            });
        case COUNT_UNREAD_CONVERSATIONS:
            return update(state, {
                stats: {
                    unread_count: {$set: action.payload.counter}
                }
            });

        case UNREAD_CONVERSATION:
            let newStateConversation = state;
            listName = 'valid';
            conversationIndex = findIndex(state.valid.list, {id: action.payload.id});

            if (conversationIndex !== -1) {
                //is valid
                newStateConversation = update(newStateConversation, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                readed: {$set: 1}
                            }
                        }
                    }
                });
            }

            conversationIndex = findIndex(state.unread.list, {id: action.payload.id});
            if (conversationIndex !== -1) {
                listName = 'unread';
                newStateConversation = update(newStateConversation, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                readed: {$set: 1}
                            }
                        }
                    }
                });
            }

            conversationIndex = findIndex(state.archived.list, {id: action.payload.id});
            if (conversationIndex !== -1) {
                listName = 'archived';
                newStateConversation = update(newStateConversation, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                readed: {$set: 1}
                            }
                        }
                    }
                });
            }

            conversationIndex = findIndex(state.search.list, {id: action.payload.id});
            if (conversationIndex !== -1) {
                listName = 'search';
                newStateConversation = update(newStateConversation, {
                    [listName]: {
                        list: {
                            [conversationIndex]: {
                                readed: {$set: 1}
                            }
                        }
                    }
                });
            }

            newStateConversation = update(newStateConversation, {
                stats:{
                    unread_count : {$set:(state.stats.unread_count-1)}
                }
            });

            return update(state, {
                $set: newStateConversation
            });
        default:
            return state
    }
}

function merge(a, b, key) {

    function x(a) {
        a.forEach(function (b) {
            if (!(b[key] in obj)) {
                obj[b[key]] = obj[b[key]] || {};
                array.push(obj[b[key]]);
            }
            Object.keys(b).forEach(function (k) {
                obj[b[key]][k] = b[k];
            });
        });
    }

    var array = [],
        obj = {};

    x(a);
    x(b);
    return array;
}