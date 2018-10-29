import React, {Component} from "react";
import {Route, Switch, Redirect, withRouter} from 'react-router-dom'
import {push} from 'connected-react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import PageNotFound from './PageNotFound'
import ChatComponent from "./ChatComponent";
import {fetchSession} from '../../modules/session/actions';
import {receiveMessage, isTypingReceive} from '../../modules/conversations/actions';
import {connectToWebsocket} from '../../utils/AttractionApiWebsocket';
import {beepNewMessage} from '../../utils/Utils';
import moment from "moment";
import 'moment/locale/ro'

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            wsSession: null
        };

        moment.locale('ro');
    }

    componentWillMount() {
        this.props.fetchSession().then((res) => {
            let session = connectToWebsocket(res.id, res.token);
            this.setState({
                wsSession: session
            });
            session.subscribe('channel.chat.' + res.id, {
                onSuccess: function () {
                },
                onError: function (err) {
                },
                onEvent: (result) => this.onWsSessionEvent(result)
            });
        });
    }

    onWsSessionEvent(result) {
        try {
            let data = JSON.parse(result['argsList'][0]);
            let message = JSON.parse(data['data']['message']);
            if (message.type && message.type === 'is_typing') {
                this.props.isTypingReceive(message);
            }
            if (message.message) {
                this.props.receiveMessage(message).then((res) => {
                    let soundAlert = beepNewMessage();
                    let audio = new Audio(soundAlert);
                    audio.play();
                });
            }
        } catch (error) {
            console.log(error);
        }

    }

    render() {
        let location = this.props.location;
        const {match} = this.props;
        let pathName = match.url;
        if (pathName.substr(-1) === '/') {
            pathName = pathName.substr(0, pathName.length - 1)
        }
        return (
            <Switch>
                <Route path={`${pathName}/t`} render={() => <ChatComponent basename={pathName}/>}/>
                <Route path={`${pathName}/:type/t`} render={() => <ChatComponent basename={pathName}/>}/>
                <Route path={`${pathName}/*`} render={() => <PageNotFound location={location}/>}/>
                <Redirect to={`${pathName}/t`}/>
            </Switch>
        )
    }
}

const mapStateToProps = ({session}) => ({
    auth: session
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            receiveMessage,
            isTypingReceive,
            fetchSession,
            changePage: (url) => push(url)
        },
        dispatch
    );

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(App))

