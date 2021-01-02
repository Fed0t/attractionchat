import React, { Component } from "react";
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import SingleConversation from "./SingleConversation";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import InfiniteScroll from 'react-infinite-scroll-component';
import ModalBox from "./ModalBox";
import UndefinedUser from '../../utils/UndefinedUser';
import ReactLoading from 'react-loading';
import {
    isMobile
} from "react-device-detect";

import {
    isTypingReset,
    fetchConversations,
    fetchMoreConversations,
    archiveConversation,
    unreadConversation
} from '../../modules/conversations/actions';

const htmlRegex = new RegExp(/<div\b[^>]*class="arrowchat_image_message"[^>]*>[\s\S]*?<\/div>/i);

class ActiveConversations extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModalArchive: false,
            actionsConversationId: 0,
            conversationUser: 'default',
            username: this.props.location.pathname.split(/[/ ]+/).pop(),
            redirected: false,
            refreshing: false,
            loading: true
        };

        this.isTypingTimeout = null;

        this.archiveConversation = this.archiveConversation.bind(this);
        this.toggleArchiveModal = this.toggleArchiveModal.bind(this);
        this.refreshConversations = this.refreshConversations.bind(this);
    }


    componentDidMount() {
        let that = this;
        this.props.fetchConversations().then((res) => {
            this.setState({
                loading: false
            });
            res.data.data.forEach(function (conversation) {
                if (conversation.readed === 1) {
                    that.redirectToFirstConversation(conversation.receiver.username)
                }
            });
        });

    }

    refreshConversations() {
        this.setState({
            refreshing: true
        });
        this.props.fetchConversations().then((res) => {
            this.setState({
                refreshing: false
            });
        });
    }

    componentWillUnmount() {
        clearTimeout(this.isTypingTimeout)
    }

    redirectToFirstConversation(username) {
        if (!this.state.redirected && this.state.username.length <= 1 && !isMobile) {
            this.setState({
                redirected: true
            });

            this.props.changePage(this.props.basename + '/t/' + username);
            this.props.collapse();
        }
    }

    archiveConversation() {
        this.setState({
            showModalArchive: false,
        });
        this.props.archiveConversation(this.state.actionsConversationId).then((res) => {
        });
    }

    toggleArchiveModal(conversation) {
        this.setState({
            showModalArchive: true,
            actionsConversationId: conversation.id,
            conversationUser: conversation.receiver,
        });
    }

    renderConversations() {
        let renderedConversations = [];
        if (this.props.list.list.length > 0) {
            this.props.list.list.forEach((conversation) => {
                let message = conversation && conversation.messages && conversation.messages.length && conversation.messages[0] ? conversation.messages[0].message : {}
                let isYou = false;
                let isTyping = false;

                if (message && message.user && (Number(this.props.session.user_id) === message.user.id)) {
                    isYou = true;
                }

                if (!conversation.receiver) {
                    conversation.receiver = UndefinedUser;
                }

                if (conversation.is_typing) {
                    isTyping = true;
                    this.isTypingTimeout = setTimeout(function () {
                        this.props.isTypingReset(conversation.id)
                    }.bind(this), 3500)
                }

                renderedConversations.push(<ReactCSSTransitionGroup
                    transitionName="example"
                    transitionAppear={true}
                    transitionAppearTimeout={500}
                    transitionEnter={false}
                    key={conversation.id}
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}>
                    <SingleConversation
                        isReaded={conversation.readed === 1}
                        isArchived={false}
                        message={message}
                        isSearch={false}
                        isTyping={isTyping}
                        isYou={isYou}
                        images={message.images || htmlRegex.test(message)}
                        location={(message.location && message.location !== 0)}
                        user={{
                            username: conversation.receiver.username,
                            userId: conversation.receiver.id,
                            avatarUrl: conversation.receiver.avatar_url
                        }}
                        updatedAt={conversation.updated_at}
                        open={() => {
                            this.props.changePage({
                                pathname: this.props.basename + '/t/' + conversation.receiver.username,
                                search: this.props.location.search
                            });
                        }}
                        archive={() => {
                            this.toggleArchiveModal(conversation);
                        }}
                    />
                </ReactCSSTransitionGroup>);

            });
            return renderedConversations;
        }
    }

    render() {
        let conversations = this.props.list;

        if ((this.state.loading && conversations.list.length === 0) || this.state.refreshing) {
            return <ReactLoading className={'center-block loader-pad'} type={'spin'} color='#921090' height={'15%'} width={'15%'} />
        }

        return (
            <div>
                <ReactCSSTransitionGroup
                    transitionName="example"
                    transitionAppear={true}
                    transitionAppearTimeout={500}
                    transitionEnter={false}
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}>
                    <InfiniteScroll
                        dataLength={conversations.list.length}
                        next={() => this.props.fetchMoreConversations(conversations && conversations.next_page_url)}
                        hasMore={(conversations && conversations.next_page_url)}
                        height={440}
                        useWindow={false}
                        loader={<ReactLoading className={'center-block loader-pad'} type={'spin'} color='#921090' height={'15%'} width={'15%'} />}
                        pullDownToRefresh
                        pullDownToRefreshContent={
                            <h3 style={{ textAlign: 'center', color: '#FFF' }}>&#8595; Pull down to refresh</h3>
                        }
                        releaseToRefreshContent={
                            <h3 style={{ textAlign: 'center', color: '#FFF' }}>&#8593; Release to refresh</h3>
                        }
                        refreshFunction={() => {
                            this.refreshConversations();
                        }}>
                        <div className="list">
                            {this.renderConversations()}
                        </div>
                    </InfiniteScroll>
                </ReactCSSTransitionGroup>

                <ModalBox show={this.state.showModalArchive}
                    closeModal={() => {
                        this.setState({
                            showModalArchive: false
                        });
                    }}
                    title={<div style={{ color: '#FFF' }}>Arhiveaza conversatia?</div>}
                    body={<div style={{ color: '#FFF' }}>Doresti sa arhivezi conversatia cu
                              <strong> {this.state.conversationUser.username}</strong>?</div>}
                    actionButton={this.archiveConversation} />
            </div>
        )
    }
}


const mapStateToProps = ({ conversations, session }) => ({
    list: conversations.valid,
    session: session
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            fetchConversations,
            isTypingReset,
            fetchMoreConversations,
            archiveConversation,
            unreadConversation,
            changePage: (url) => push(url)
        },
        dispatch
    );

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(ActiveConversations))



