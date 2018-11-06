import React, {Component} from "react";
import {push} from 'connected-react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import TextareaComposer from "./TextareaComposer";
import InfiniteScroll from 'react-infinite-scroller';
import findIndex from 'lodash/findIndex';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import undefinedUser from '../../utils/UndefinedUser.js';
import {arrayUnique} from '../../utils/Utils';
import SingleMessage from "./SingleMessage";
import moment from "moment";
import ReactLoading from 'react-loading';
import {
    isMobile
} from "react-device-detect";

import {
    fetchConversation,
    fetchMoreMessages,
    fetchMoreMessagesWithoutDispatch,
    unreadConversation
} from '../../modules/conversations/actions';

class UserMessages extends Component {

    constructor(props) {
        super(props);
        const {username} = this.props.match.params;
        this.state = {
            loading: true,
            fetched: false,
            username: username,
            hasMoreItems: true,
            remote: null,
            readed: false,
        };

        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    getConversationsFullList() {
        return arrayUnique(this.props.valid.list.concat(this.props.unread.list, this.props.archived.list, this.props.search.list));
    }

    getConversationIndex(username) {
        if (this.props.valid.list.length > 0 || this.props.unread.list.length > 0 || this.props.archived.list.length > 0 || this.props.search.list.length > 0) {
            let fullList = this.getConversationsFullList();
            return findIndex(fullList, function (conversation) {
                if (conversation && conversation.receiver.username) {
                    return conversation.receiver.username.toLowerCase() === username.toLowerCase();
                }
            });
        }
        return false;
    }

    getConversation(username) {
        let index = this.getConversationIndex(username);
        if (index !== -1) {
            let fullList = this.getConversationsFullList();
            return fullList[index];
        }
        return false;
    }

    getUsernameFromConversation(username) {
        let conversation = this.getConversation(username);
        if (conversation && conversation.receiver) {
            return conversation.receiver;
        } else if (this.state.remote && this.state.remote.receiver) {
            return this.state.remote.receiver;
        }
        return false;
    }

    getRemoteConversation(username) {
        if (this.getConversationIndex(username) === -1 && this.state.fetched === false) {
            this.props.fetchConversation(username).then((res) => {
                this.setState({
                    remote: res.data,
                    fetched: true,
                    loading: false,
                });
            });
        }
    }

    loadMoreMessages(username) {
        let fullList = this.getConversationsFullList();
        let conversationIndex = findIndex(fullList, function (receiver) {
            if (receiver) {
                return receiver.receiver.username.toLowerCase() === username.toLowerCase();
            }
        });
        if (conversationIndex !== -1 && fullList[conversationIndex].messagesPaginated.next_page_url) {
            let nextPageUrl = fullList[conversationIndex].messagesPaginated.next_page_url;
            let conversationId = fullList[conversationIndex].id;
            this.props.fetchMoreMessages(nextPageUrl, conversationId).then((res) => {
                if(res.data.messagesPaginated.next_page_url === null){
                    this.setState({
                        hasMoreItems: false,
                    });
                }
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {username} = this.props.match.params;
        if (username !== this.state.username) {
            this.setState({
                username: username,
                readed: false,
            });
        }

        if (!this.state.readed) {
            let conversation = this.getConversation(username);
            if (conversation) {
                setTimeout(function () {
                    this.scrollToBottom();
                    if (conversation.readed === 0) {
                        this.props.unreadConversation(conversation.id)
                    }
                    this.setState({
                        readed: true
                    })
                }.bind(this), 200);
            }
        }

        this.getRemoteConversation(username);

        //todo:need to rethink
        // if (this.props.valid.list.length > 0 && this.props.valid.list[0].receiver.username === params.username) {
        //     this.scrollToBottom();
        // }
    }

    scrollToBottom() {
        const scrollHeight = this.infinteRef.scrollHeight;
        const height = this.infinteRef.clientHeight;
        const maxScrollTop = scrollHeight - height;
        this.infinteRef.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }

    renderMessages() {
        const {username} = this.props.match.params;
        let messages = this.getConversation(username);

        let currentDay = moment().format('DD-MMM-YYYY');
        let previousDay = currentDay;
        let messagesCollection = [];

        if (messages) {
            [...messages.messagesPaginated.data].reverse().forEach((message) => {
                if (message.message) {
                    currentDay = moment.unix(message.message.sent).format('DD-MMM-YYYY');
                    if (!message.message.user) {
                        message.message.user = undefinedUser
                    }
                    messagesCollection.push(<ReactCSSTransitionGroup
                        transitionName="example"
                        transitionAppear={true}
                        transitionAppearTimeout={500}
                        transitionEnter={false}
                        transitionEnterTimeout={500}
                        key={'transition' + message.message_id}
                        transitionLeaveTimeout={300}>
                        {
                            (currentDay !== previousDay) && (
                                <p className="lineContainer text-center">
                                    <span className="line"/>
                                    <span className="text">{currentDay}</span>
                                    <span className="line"/>
                                </p>
                            )
                        }
                        <SingleMessage
                            key={message.message_id}
                            text={message.message.message}
                            images={message.message.images}
                            location={message.message.location}
                            isRight={(Number(message.message.user.id) === Number(this.props.session.user_id))}
                            timestamp={message.message.sent}
                            isReaded={message.message.user_read}
                            user={{
                                username: message.message.user.username,
                                id: message.message.user.id,
                                avatar_url: message.message.user.avatar_url
                            }}
                        />
                    </ReactCSSTransitionGroup>);
                    previousDay = currentDay;
                }
            });
        }
        return messagesCollection;
    }

    handleBack = () => {
        this.props.changePage('/m/messages/t/');
    };


    render() {
        let username = this.props.match.params.username;
        let userObject = this.getUsernameFromConversation(username);
        let conversation = this.getConversation(username);

        let profileUrl = '/profile/' + username;
        if (isMobile) {
            profileUrl = '/m/profile/' + username;
        }

        if (this.state.loading && !conversation) {
            return <ReactLoading className={'center-block loader-pad'} type={'spin'} color='#921090' height={'15%'}
                                 width={'15%'}/>
        }

        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading user-info-panel">
                        {(userObject) &&
                        <div>
                            {isMobile &&
                            <span className="glyphicon glyphicon-chevron-left" onClick={() => this.handleBack()}
                                  style={{fontSize: 14, marginRight: 5}}/>}
                            <a href={profileUrl}>{username}</a>,
                            {' ' + userObject.city.ro_name},
                            activ acum {moment.unix(userObject.last_active).fromNow()}
                        </div>}
                    </div>
                </div>

                <div className="scrollbar-outer scrollbar style-2" id="messages-list" ref={(ref) => {
                    this.infinteRef = ref;
                }}>
                    <InfiniteScroll
                        pageStart={0}
                        isReverse={true}
                        initialLoad={false}
                        loadMore={() => {
                            console.log('load more')
                            this.loadMoreMessages(username);
                        }}
                        hasMore={this.state.hasMoreItems && conversation.messagesPaginated.next_page_url !== null}
                        threshold={5}
                        useWindow={false}
                        loader={<ReactLoading key={Math.floor(Math.random() * 999999999)}
                                              className={'center-block loader-pad'} type={'spin'} color='#921090'
                                              height={'10%'} width={'10%'}/>}>
                        <div className="tracks">
                            {this.renderMessages()}
                        </div>
                    </InfiniteScroll>
                </div>
                <div>
                    {(conversation && conversation.is_typing) &&
                    <span><img style={{height: 35}} src={require('../../assets/typing-indicator.gif')} alt=""/></span>}
                </div>
                <TextareaComposer
                    autofocus={true}
                    scrollToBottom={this.scrollToBottom}
                    dropzoneConfig={{
                        autoProcessQueue: false,
                        uploadMultiple: true,
                        maxFiles: 7,
                        addRemoveLinks: true,
                        parallelUploads: 7,
                        params: {
                            token: this.props.session.token,
                            message: '',
                            receiver: (userObject) ? userObject.id : '',
                            sender: this.props.session.user_id
                        }
                    }}
                />
            </div>
        )
    }
}


const mapStateToProps = ({conversations, session}) => ({
    valid: conversations.valid,
    unread: conversations.unread,
    archived: conversations.archived,
    search: conversations.search,
    session: session
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            fetchConversation,
            fetchMoreMessages,
            unreadConversation,
            fetchMoreMessagesWithoutDispatch,
            changePage: (url) => push(url)
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserMessages)

