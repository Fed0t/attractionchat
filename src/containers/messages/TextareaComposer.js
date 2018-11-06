import React, {Component} from "react";
import DropzoneComponent from 'react-dropzone-component';
import {Tabs, Tab, Button} from 'react-bootstrap';
import {Picker} from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import {stickersSoft, stickersHard} from './resources/stickers';
import {push} from 'connected-react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

import {
    dispatchMessageLocal,
    sendMessage
} from '../../modules/conversations/actions';

import ModalBox from "../../containers/conversations/ModalBox";

let componentConfig = {
    iconFiletypes: ['.jpg', '.png', '.gif'],
    showFiletypeIcon: true,
    postUrl: 'https://app.attractionclub.ro/api/v1/chat/send',
};


class TextareaComposer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            placeholder: 'Type a message...',
            showDropzone: false,
            showEmoji: false,
            showStickers: false,
            dropzoneObject: null,
            showUpload: false,
            noPremiumModal: false,
            sendingFailed: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this._handleKeyPress = this._handleKeyPress.bind(this);
        this.showDropZone = this.showDropZone.bind(this);
        this.showEmoji = this.showEmoji.bind(this);
        this.showStickers = this.showStickers.bind(this);
        this.addEmoji = this.addEmoji.bind(this);
    }

    componentDidMount() {
        document.addEventListener('input', this.handleCursorPosition.bind(this), true);
        document.addEventListener('click', this.handleCursorPosition.bind(this), true);
    }

    componentWillUnmount() {
        document.addEventListener('input', this.handleCursorPosition.bind(this), true);
        document.addEventListener('click', this.handleCursorPosition.bind(this), true);
    }

    handleCursorPosition(e) {
        if (e.target === this.textarea) {
            this.setState({
                curserPositonStart: e.target.selectionStart,
                curserPositonEnd: e.target.selectionEnd
            });
        }
    }

    handleChange(message) {
        if (message.charCode !== 13) {
            this.setState({
                message: message.target.value
            });
        }
    }


    _handleKeyPress(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    showDropZone() {
        this.setState({
            showDropzone: !this.state.showDropzone,
            showStickers: false,
            showEmoji: false,
        });
    }

    showEmoji() {
        this.setState({
            showEmoji: !this.state.showEmoji,
            showDropzone: false,
            showStickers: false,
        });
    }

    showStickers() {
        this.setState({
            showStickers: !this.state.showStickers,
            showDropzone: false,
            showEmoji: false,
        });
    }

    addEmoji(emoji) {
        const textareaStrParts = [
            `${this.textareaRef.value.substring(0, this.state.curserPositonStart)}`,
            `${emoji.native}`,
        ];
        let textareaValue = textareaStrParts.join('');
        this.setState({
            message: textareaValue,
        });
    }

    handlePost() {
        this.state.dropzoneObject.processQueue();
        this.setState({
            showUpload: false
        })
    }

    handleFileAdded(file) {
        this.setState({
            showUpload: true
        })
    }

    sendMessage() {
        if (Number(this.props.session.premium) === 0) {
            this.setState({
                noPremiumModal: true,
            });
            return false;
        }

        let message = this.state.message;
        let receiverId = Number(this.props.dropzoneConfig.params.receiver);
        let senderId = Number(this.props.dropzoneConfig.params.sender);
        let params = {
            message: '' + this.state.message + '',
            sender: senderId,
            receiver: receiverId
        };
        if (message.length > 0 && receiverId !== null) {
            this.setState({
                message: '',
            });
            this.props.sendMessage(params).then((res) => {
                    this.props.scrollToBottom();
                    this.textareaRef.focus();
                    this.setState({
                        sendingFailed: false,
                    });
                },
                (err) => {
                    console.log(err);
                    this.setState({
                        sendingFailed: true,
                    });
                });
        }
    }

    render() {

        return (
            <div>
                {(this.state.sendingFailed) && <div style={{color:'red',fontSize:12,float:'right'}}>Message error...</div>}
                <div className="message-box-chat">

                    <textarea
                        cols="35"
                        rows="3"
                        ref={ref => (this.textareaRef = ref)}
                        autoFocus={this.props.autofocus}
                        value={this.state.message}
                        onChange={this.handleChange}
                        onKeyDown={this._handleKeyPress}
                        className="form-control black-text"
                        placeholder={'Type a message...'}>
                         {this.state.message}
                     </textarea>

                    <div>
                        <div className="pull-left">
                            <div className="action-button" onClick={this.showDropZone}>
                                <span className="glyphicon glyphicon-paperclip" style={{fontSize: 17, marginTop: 3}}/>
                            </div>
                            <div className="action-button" onClick={this.showEmoji}>
                                <img style={{height: 18}}
                                     alt={'Emoticons'}
                                     src="https://attractionclub.ro/chat/themes/facebook_no_bar/images/smilies/smile.png"/>
                            </div>
                            <div className="action-button" onClick={this.showStickers}>
                                <img alt={'Stickers'} style={{height: 20}}
                                     src="https://attractionclub.ro/assets/img/iconita.gif"/>
                            </div>
                        </div>
                        <div className="pull-right">
                            <button className="btn btn-md btn-default pull-right send-btn"
                                    onClick={this.sendMessage}
                                    id="send-btn">Trimite
                            </button>
                        </div>
                    </div>

                    <div className="clearfix"/>
                </div>

                <div>
                    <div style={{marginTop: 10, display: (this.state.showDropzone) ? 'block' : 'none'}}>
                        <DropzoneComponent config={componentConfig}
                                           eventHandlers={{
                                               successmultiple: (file, response) => {
                                                   file.forEach((image) => {
                                                       this.state.dropzoneObject.removeFile(image);
                                                   });
                                                   this.props.dispatchMessageLocal(response);

                                                   this.showDropZone();
                                               },
                                               init: (dropzone) => {
                                                   this.setState({
                                                       dropzoneObject: dropzone
                                                   });
                                               },
                                               addedfile: this.handleFileAdded.bind(this)
                                           }}
                                           djsConfig={this.props.dropzoneConfig}>

                            <div className="dz-message">
                                <button className="btn btn-default2">
                                <span className="glyphicon glyphicon-paperclip"
                                      style={{color: '#FFF'}}/>
                                    Alege poze sau un video...
                                </button>
                            </div>
                            {this.state.showUpload && (
                                <button onClick={this.handlePost.bind(this)} className="btn btn-danger"
                                        style={{display: 'block', margin: '0 auto'}}>
                                <span className="glyphicon glyphicon-send"
                                      style={{color: '#FFF', margin: 2}}/>
                                    <span style={{padding: 3}}>Trimite pozele</span>
                                </button>
                            )}
                        </DropzoneComponent>
                    </div>

                    <div style={{marginTop: 10, display: (this.state.showEmoji) ? 'block' : 'none'}}>
                        <Picker style={{width: '100%'}} showPreview={false} onSelect={this.addEmoji}/>
                    </div>


                    <div style={{marginTop: 10, display: (this.state.showStickers) ? 'block' : 'none'}}>
                        <Tabs defaultActiveKey={1} id="stickers-tabs">
                            <Tab eventKey={1} title="Stickers Soft">
                                {stickersSoft.map((sticker, index) => {
                                    return (
                                        <img className="sticker" key={index} src={sticker.code} onClick={() => {
                                            this.setState({
                                                message: sticker.name
                                            });
                                        }} alt=""/>);
                                })}
                            </Tab>
                            <Tab eventKey={2} title="Stickers Hard">
                                {stickersHard.map((sticker, index) => {
                                    return (
                                        <img className="sticker" key={index} src={sticker.code} onClick={() => {
                                            this.setState({
                                                message: sticker.name
                                            });
                                        }} alt=""/>);
                                })}
                            </Tab>
                        </Tabs>
                    </div>
                </div>

                <ModalBox show={this.state.noPremiumModal}
                          closeModal={() => {
                              this.setState({
                                  noPremiumModal: false
                              });
                          }}
                          size={'large'}
                          yesButton={<Button bsStyle="danger" onClick={() => {
                              this.props.history.push('/subscription')
                          }}>
                              DA
                          </Button>}
                          noButton={<Button bsStyle="primary" onClick={() => {
                              this.setState({
                                  noPremiumModal: false
                              });
                          }}>Mai tarziu</Button>}
                          title={<div style={{color: '#FFF'}}>DEVINO PREMIUM?</div>}
                          body={<div style={{color: '#FFF', fontSize: 20}}>Imi pare rau dar nu esti PREMIUM!
                              <strong><a style={{color: 'red'}} href="/subscription"> MEMBRU PREMIUM!</a></strong>
                          </div>}
                          actionButton={() => {
                              console.log('subscription')
                          }}/>
            </div>

        )
    }
}

const mapStateToProps = ({conversations, session}) => ({
    session: session
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            dispatchMessageLocal,
            sendMessage,
            changePage: (url) => push(url)
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TextareaComposer)

