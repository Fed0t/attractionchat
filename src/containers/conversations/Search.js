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
    searchMoreConversation,
    unreadConversation,
    archiveConversation,
    restoreConversation,
} from '../../modules/conversations/actions';


class SearchConversations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModalArchive: false,
            actionsConversationId: 0,
            conversationUser:'default',
            showModalRestore: false,
        };

        this.archiveConversation = this.archiveConversation.bind(this);
        this.toggleArchiveModal = this.toggleArchiveModal.bind(this);

        this.restoreConversation = this.restoreConversation.bind(this);
        this.toggleRestoreModal = this.toggleRestoreModal.bind(this);
    }

    restoreConversation() {
        this.setState({
            showModalRestore: false,
        });
        this.props.restoreConversation(this.state.actionsConversationId).then((res) => {
        });
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

    toggleRestoreModal(conversation) {
        this.setState({
            showModalRestore: true,
            actionsConversationId: conversation.id,
            conversationUser: conversation.receiver,
        });
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
                        isSearch={true}
                        isYou={isYou}
                        message={message}
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
                        restore={() => {
                            this.toggleRestoreModal(conversation);
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
        if(conversations.list && conversations.list.length > 0 && !this.props.searching){
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
                            next={() => this.props.searchMoreConversation(conversations.next_page_url)}
                            hasMore={(conversations.next_page_url)}
                            height={440}
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
                    </ReactCSSTransitionGroup>

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

                    <ModalBox show={this.state.showModalRestore}
                              closeModal={() => {
                                  this.setState({
                                      showModalRestore: false
                                  });
                              }}
                              title={<div style={{color: '#FFF'}}>Recupereaza conversatia?</div>}
                              body={<div style={{color: '#FFF'}}>Doresti sa recuperezi conversatia cu
                                  <strong>{this.state.conversationUser.username}</strong> ?</div>}
                              actionButton={this.restoreConversation}/>
                </div>
            )
        }

        if(this.props.searching){
            return (<div>Searching...</div>)
        }else{
            return (<div>No conversations...</div>)
        }
    }
}


const mapStateToProps = ({conversations, session}) => ({
    session: session,
    list: conversations.search
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            searchMoreConversation,
            archiveConversation,
            restoreConversation,
            unreadConversation,
            changePage: (url) => push(url)
        },
        dispatch
    );

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchConversations))



