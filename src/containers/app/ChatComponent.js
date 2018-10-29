import React, {Component} from "react";
import {Route, NavLink, Switch, withRouter} from 'react-router-dom'
import {push} from 'connected-react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import ActiveConversations from "../conversations/Active";
import UnreadConversations from "../conversations/Unread";
import ArchivedConversations from "../conversations/Archived";
import SearchConversations from "../conversations/Search";
import UserMessages from '../messages/UserMessages';
import SplashMessagesBox from "../messages/SplashMessagesBox";

import {
    isMobile,
    isTablet
} from "react-device-detect";

import {
    searchConversation,
    countUnreadConversations,
} from '../../modules/conversations/actions';

class ChatComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            search: '',
            username: this.props.location.pathname.split(/[/ ]+/).pop(),
            searchResult: [],
            searching: true,
            scrollPosition: 0,
            messagesCollapsed:false
        };

        this.delayTimer = null;
        this.container = null;
        this.timeoutScroll = null;
    }

    componentWillMount() {
        if (!this.state.checked && this.props.location.search.length > 0) {
            this.setState({
                checked: true
            })
        }

        this.props.countUnreadConversations();
    }

    componentWillUnmount() {
        clearTimeout(this.delayTimer);
        clearTimeout(this.timeoutScroll);
    }

    componentDidUpdate() {
        if (this.state.checked && this.props.location.search.length === 0) {
            this.props.history.push({
                pathname: this.props.location.pathname,
                search: '?filter=unreaded'
            });
        }
        let urlUsername = this.props.location.pathname.split(/[/ ]+/).pop();
        if (this.state.username !== urlUsername) {
            this.setState({
                username: urlUsername
            });
            this.collapseMobileMessages();
        }
    }

    collapseMobileMessages(){
        if(isMobile && !isTablet && this.collapseRef){
            if(this.state.messagesCollapsed === false){
                this.collapseRef.classList.add('show');
                this.setState({
                    messagesCollapsed:true
                });
            }else{
                this.collapseRef.classList.remove('show');
                this.setState({
                    messagesCollapsed:false
                });
            }
        }
    }

    handleCheck() {
        this.setState({checked: !this.state.checked});
        if (!this.state.checked) {
            this.props.history.push({
                pathname: this.props.location.pathname,
                search: '?filter=unreaded'
            });
        } else {
            this.props.history.push({
                pathname: this.props.location.pathname,
                search: ''
            })
        }
    }

    resetSearch() {
        this.setState({
            search: '',
        });
    }

    doSearch(text) {
        this.setState({
            search: text,
            searching: true
        });
        let that = this;
        clearTimeout(this.delayTimer);
        this.delayTimer = setTimeout(function () {
            that.props.searchConversation(text).then((res) => {
                if (res.data.data) {
                    that.setState({
                        searchResult: res.data,
                    })
                }
                that.setState({
                    searching: false
                });
            });
        }, 1000);
    }

    render() {
        const basename = this.props.basename;

        let messageBox = (
            <Switch>
                <Route path={`${basename}/t/:username`} render={(props) => {
                    return <UserMessages {...props}/>
                }}/>
                <Route path={`${basename}/archived/t/:username`} render={(props) => {
                    return <UserMessages {...props}/>
                }}/>
                <Route path={`${basename}/t`} component={SplashMessagesBox}/>
                <Route path={`${basename}/archived/t`} component={SplashMessagesBox}/>
            </Switch>
        );

        return (
            <div className="row">
                <div className="col-lg-5 col-xs-12 col-md-5 div-row-marketing messages-box" style={(isMobile) ? {paddingRight:5,paddingLeft:5} : {paddingRight:2}}>
                    <ul className="nav1">
                        <div className="row-mesaje" style={{marginLeft: -2}}>
                            <ul className="tabs" style={{position: 'relative'}}>

                                <NavLink exact={true} activeClassName='is-active' to={{
                                    pathname: basename + '/t/' + this.state.username,
                                    search: this.props.location.search
                                }}>Conversatii</NavLink>

                                <NavLink activeClassName='is-active' to={{
                                    pathname: basename + '/archived/t/' + this.state.username,
                                    search: this.props.location.search
                                }}>Arhivate</NavLink>

                            </ul>
                            <Route path={`${basename}/t`} render={(props) => {
                                return (
                                    <div>
                                        <div className={'messages-unread-btn'}>
                                            <span style={{marginRight: 5, fontSize: 13}}>
                                                {this.props.stats.unread_count > 0 && <span
                                                    className="badge red-badge">{this.props.stats.unread_count}</span>}
                                                Mesaje necitite </span>

                                            <input style={{padding: 2, marginTop: 2}} type="checkbox"
                                                   onChange={this.handleCheck.bind(this)}
                                                   defaultChecked={this.state.checked}/>
                                        </div>
                                    </div>
                                )
                            }}/>
                        </div>
                        <div className="row-orasul">
                            <div className="input-group">
                                <input id="search-c"
                                       type="text"
                                       style={{zIndex: 0}}
                                       className="form-control placeholder"
                                       placeholder="Caută" value={this.state.search}
                                       onChange={(e) => {
                                           this.doSearch(e.target.value)
                                       }}/>

                                <div className="input-group-btn">
                                    <button id="cancel-search-c" type="button"
                                            onClick={this.resetSearch.bind(this)}
                                            className="btn btn-default dropdown-toggle">
                                        <span className="glyphicon glyphicon-remove"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div id="conversations">
                            <div
                                onScroll={(e) => {
                                    e.persist();
                                    clearTimeout(this.timeoutScroll);
                                    this.timeoutScroll = setTimeout(function () {
                                        this.setState({
                                            scrollPosition: e.target.scrollTop
                                        });
                                    }.bind(this), 300)
                                }}
                                ref={(el) => (this.container === null) ? this.container = el : ''}
                                className="col-md-6 col-xs-12 scrollbar style-2 conversation-style"
                                id="conversations-list">

                                {(this.state.search.length > 0) ?
                                    <SearchConversations basename={basename} searching={this.state.searching}/>
                                    :
                                    <Switch>
                                        <Route path={`${basename}/t`}
                                               render={(props) => {
                                                   if (this.state.checked) {
                                                       return <UnreadConversations
                                                           keepScroll={() => {
                                                               if (this.container) {
                                                                   this.container.scrollTop = this.state.scrollPosition
                                                               }
                                                           }}
                                                           basename={basename}
                                                           type={'unread'} {...props}/>
                                                   } else {
                                                       return <ActiveConversations basename={basename}
                                                                                   collapse={this.collapseMobileMessages}
                                                                                   type={'valid'} {...props}/>
                                                   }
                                               }}/>

                                        <Route path={`${basename}/archived/t`}
                                               render={(props) => <ArchivedConversations basename={basename}
                                                                                         type={'archived'} {...props} />}/>
                                    </Switch>
                                }
                            </div>
                        </div>
                    </ul>
                </div>

                {(!isMobile || isTablet) ? <div className="col-lg-7 col-xs-12 col-md-7 div-profil-prim-plan" style={{paddingLeft:0}}>
                        <div className="alert-mesaje alert-success-msg" style={{marginTop: 4, borderRadius: 2}}>
                            {messageBox}
                            <div className="clearfix"/>
                        </div>
                    </div> :
                    <div>
                        <div className="col-lg-7 col-xs-12 col-md-7">

                            <div className="panel-collapse collapse" id="collapse1"
                                 ref={(ref) => this.collapseRef = ref}>
                                <div
                                    style={{
                                        position: 'fixed',
                                        width: '100%',
                                        left: 0,
                                        zIndex: 3,
                                        top: 0,
                                        height: '100%',
                                    }}>
                                    <div className="alert-mesaje alert-success-msg"
                                         style={{height: '100%', overflowY: 'scroll',backgroundColor: '#500750'}}>
                                        {messageBox}
                                        <div className="clearfix"/>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                }
            </div>
        )
    }
}


const mapStateToProps = ({conversations}) => ({
    stats: conversations.stats
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            searchConversation,
            countUnreadConversations,
            changePage: (url) => push(url)
        },
        dispatch
    );

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatComponent))

