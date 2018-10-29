import React, {Component} from "react";
import {push} from 'connected-react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
// import queryString from 'query-string'
import SingleConversation from "./SingleConversation";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import InfiniteScroll from 'react-infinite-scroll-component';
import ModalBox from "./ModalBox";
import UndefinedUser from '../../utils/UndefinedUser';

import {
    fetchTrashedConversations,
    fetchMoreTrashedConversations,
    restoreConversation,
    unreadConversation,
    deleteForever
} from '../../modules/conversations/actions';

class ArchivedConversations extends Component {

    constructor(props) {
        super(props);
        this.state = {
            actionsConversationId: 0,
            conversationUser: 'default',
            username: this.props.location.pathname.split(/[/ ]+/).pop(),
            redirected: false,
            showModalRestore: false,
            showModalDestroy: false,
        };

        this.toggleDestroyModal = this.toggleDestroyModal.bind(this);
        this.deleteConversation = this.deleteConversation.bind(this);

        this.restoreConversation = this.restoreConversation.bind(this);
        this.toggleRestoreModal = this.toggleRestoreModal.bind(this);
    }

    componentDidMount() {
        this.props.fetchTrashedConversations();
    }

    restoreConversation() {
        this.setState({
            showModalRestore: false,
        });
        this.props.restoreConversation(this.state.actionsConversationId).then((res) => {
        });
    }


    toggleRestoreModal(conversation) {
        this.setState({
            showModalRestore: true,
            actionsConversationId: conversation.id,
            conversationUser: conversation.receiver,
        });
    }


    toggleDestroyModal(conversation) {
        this.setState({
            showModalDestroy: true,
            actionsConversationId: conversation.id,
            conversationUser: conversation.receiver,
        });
    }

    deleteConversation() {
        this.setState({
            showModalDestroy: false,
        });
        this.props.deleteForever(this.state.actionsConversationId).then((res) => {
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
                        isReaded={conversation.readed === 1 }
                        isArchived={(conversation.deleted_at !== null)}
                        message={message}
                        isSearch={false}
                        isYou={isYou}
                        user={{
                            username: conversation.receiver.username,
                            userId: conversation.receiver.id,
                            avatarUrl: conversation.receiver.avatar_url
                        }}
                        updatedAt={conversation.updated_at}
                        open={() => {
                            this.props.changePage({
                                pathname: this.props.basename + '/archived/t/' + conversation.receiver.username,
                                search: this.props.location.search
                            });
                        }}
                        restore={() => {
                            this.toggleRestoreModal(conversation);
                        }}
                        delete={() => {
                            this.toggleDestroyModal(conversation);
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
                        next={() => this.props.fetchMoreTrashedConversations(conversations.next_page_url)}
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

                <ModalBox show={this.state.showModalDestroy}
                          closeModal={() => {
                              this.setState({
                                  showModalDestroy: false
                              });
                          }}
                          title={<div style={{color: '#FFF'}}>Sterge pentru totdeauna?</div>}
                          body={<div style={{color: '#FFF'}}>Doresti sa stergi pentru totdeauna conversatia cu
                              <strong>{this.state.conversationUser.username}</strong>?</div>}
                          actionButton={this.deleteConversation}/>
            </div>
        )
    }
}


const mapStateToProps = ({conversations, session}) => ({
    list: conversations.archived,
    session: session
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            fetchTrashedConversations,
            fetchMoreTrashedConversations,
            restoreConversation,
            unreadConversation,
            deleteForever,
            changePage: (url) => push(url)
        },
        dispatch
    );

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(ArchivedConversations))



