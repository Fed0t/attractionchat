import React, {Component} from "react";
import {push} from 'connected-react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import SingleConversation from "./SingleConversation";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import InfiniteScroll from 'react-infinite-scroll-component';
import ModalBox from "./ModalBox";
import UndefinedUser from '../../utils/UndefinedUser';

import {
    fetchUnreadConversations,
    fetchMoreUnreadedConversations,
    unreadConversation,
    archiveConversation
} from '../../modules/conversations/actions';

class UnreadConversations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModalArchive: false,
            actionsConversationId: 0,
            conversationUser: 'default',
            username: this.props.location.pathname.split(/[/ ]+/).pop(),
            redirected: false
        };
        this.archiveConversation = this.archiveConversation.bind(this);
        this.toggleArchiveModal = this.toggleArchiveModal.bind(this);
    }

    componentDidMount() {
        this.props.fetchUnreadConversations();
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

    componentDidUpdate(){
        this.props.keepScroll();
    }

    renderConversations() {
        let renderedConversations = [];
        if (this.props.list.list.length > 0) {
            this.props.list.list.forEach((conversation) => {
                let message = conversation.messages[0].message;

                let isYou = false;
                if (message && message.user && (Number(this.props.session.user_id) === message.user.id)) {
                    isYou = true;
                }

                if (!conversation.receiver) {
                    conversation.receiver = UndefinedUser;
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
                        isArchived={(conversation.deleted_at !== null)}
                        isSearch={false}
                        message={message}
                        isYou={isYou}
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
                        next={() => this.props.fetchMoreUnreadedConversations(conversations.next_page_url)}
                        hasMore={(conversations.next_page_url)}
                        scrollableTarget={'conversations-list'}
                        useWindow={false}
                        loader={<h4 className="text-center">Loading...</h4>}
                        pullDownToRefresh
                        pullDownToRefreshContent={
                            <h3 style={{textAlign: 'center', color: '#FFF'}}>&#8595; Pull down to refresh</h3>
                        }
                        releaseToRefreshContent={
                            <h3 style={{textAlign: 'center', color: '#FFF'}}>&#8593; Release to refresh</h3>
                        }

                        refreshFunction={() => {
                        }}>
                        {this.renderConversations()}
                    </InfiniteScroll>

                    <ModalBox show={this.state.showModalArchive}
                              closeModal={() => {
                                  this.setState({
                                      showModalArchive: false
                                  });
                              }}
                              title={<div style={{color: '#FFF'}}>Arhiveaza conversatia?</div>}
                              body={<div style={{color: '#FFF'}}>Doresti sa arhivezi conversatia cu
                                  <strong> {this.state.conversationUser.username}</strong>?</div>}
                              actionButton={this.archiveConversation}/>
                </ReactCSSTransitionGroup>
            </div>
        )
    }
}


const mapStateToProps = ({conversations, session}) => ({
    list: conversations.unread,
    session: session
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            fetchUnreadConversations,
            unreadConversation,
            archiveConversation,
            fetchMoreUnreadedConversations,
            changePage: (url) => push(url)
        },
        dispatch
    );

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(UnreadConversations))



