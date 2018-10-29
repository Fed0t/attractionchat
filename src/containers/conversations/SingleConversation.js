import React from "react";
import 'moment-timezone';
import PropTypes from "prop-types";
import renderHTML from 'react-render-html';
// import undefinedUser from '../../utils/UndefinedUser.js';
import {limitChars} from '../../utils/Utils';

import Moment from 'react-moment';
import {stickersSoft, stickersHard} from '../messages/resources/stickers.js';


const privatePhotosRegex = new RegExp(/{("private_photos":[^]*)}/i);
const publicPhotosRegex = new RegExp(/{("public_photos":[^]*)}/i);
let stickersRegex = '';
stickersSoft.concat(stickersHard).forEach(function (sticker, index) {
    stickersRegex = sticker['name'] + '|' + stickersRegex;
});
stickersRegex = stickersRegex.slice(0, -1);
stickersRegex = new RegExp(stickersRegex);


const SingleConversation = (props) => {

    let message = props.message.message;

    let you = '';
    if (props.isYou) {
        you = ' Tu: ';
    }

    if (props.location) {
        message = renderHTML('<span><span className="glyphicon glyphicon-globe"/></span>' + you + ' Mesaj cu locatie </span>');
    } else if (props.images) {
        message = renderHTML('<span><span className="glyphicon glyphicon-camera"/></span>' + you + ' Mesaj cu poza </span>');
    } else if (privatePhotosRegex.test(props.message.message)) {
        message = renderHTML('<span><span className="glyphicon glyphicon-picture"/></span>' + you + ' Mesaj cu galeria privata </span>');
    } else if (publicPhotosRegex.test(props.message.message)) {
        message = renderHTML('<span><span className="glyphicon glyphicon-picture"/></span>' + you + ' Mesaj cu galeria publica </span>');
    } else if (stickersRegex.test(props.message.message)) {
        message = renderHTML('<span><span className="glyphicon glyphicon-heart"/></span>' + you + ' Mesaj cu sticker </span>');
    } else {
        message = renderHTML(limitChars(you + message, 50));
    }


    let archived = (props.isSearch && props.isArchived );

    let messageClassName = 'p-mesaje ';

    if (!props.isReaded && !props.isYou) {
        messageClassName = messageClassName + ' unread '
    }


    return (
        <div className="blockquote-box clearfix userBox" onClick={() => {
            props.open();
        }}>

            <div className="square pull-left">
                <img alt={props.user.username}
                     className={'img-circle img-avatar-conv'}
                     src={props.user.avatarUrl}
                     style={{}}/>
            </div>

            <h4>
                <span href={'/profile/'}>{props.user.username} {(archived) &&
                <span style={{fontSize: 13, color: '#a10f0f'}}> - arhivat</span>} </span>

                <div className="actions">
                    {!props.isReaded &&
                    <span className="action">
                            <i className="fa fa-envelope "/>
                        </span>
                    }

                    {(props.isArchived) ? (
                        <span>
                            <span className="action">
                                 <a onClick={(e) => {
                                     if (props.restore) {
                                         props.restore();
                                     }
                                     e.stopPropagation();
                                 }}> <i className="fa fa-undo"/> </a>
                             </span>
                             <span className="action">
                                 <a onClick={(e) => {
                                     if (props.delete) {
                                         props.delete();
                                     }
                                     e.stopPropagation();
                                 }}>
                                     <i style={{color: 'red'}} className="fa fa-times"/>
                                 </a>
                            </span>
                        </span>
                    ) : (
                        <span className="action">
                             <a onClick={(e) => {
                                 if (props.archive) {
                                     props.archive();
                                 }
                                 e.stopPropagation();
                             }}>
                                 <i className="fa fa-times"/>
                             </a>
                        </span>
                    )}


                </div>
            </h4>

            <div className="h6-data-mesaje pull-right" style={{fontSize: 13, marginTop: 20}}>
                <Moment format="DD/MMM">{props.updatedAt}</Moment>
            </div>

            <div className={messageClassName} style={{fontSize: 14}}>
                {(props.isTyping) ?
                    <span>Scrie <img style={{height: 35}} src={require('../../assets/typing-indicator.gif')}
                                     alt=""/></span> :
                    <span>
                        {message}
                        {(props.message.user_read === 1 && props.isYou) &&
                        <span title={'Seen'} style={{marginLeft: 2}}><span className="glyphicon glyphicon-ok"/></span>}
                    </span>}
            </div>
        </div>

    );
};


SingleConversation.propTypes = {
    archive: PropTypes.func,
    delete: PropTypes.func,
    restore: PropTypes.func,
};

export default (SingleConversation);