import React,{Component} from 'react';
import {Modal,Button} from 'react-bootstrap';
import PropTypes from "prop-types";

class ModalBox extends Component {

    render() {
        let bsSize = 'small';

        if(this.props.size){
            bsSize = this.props.size;
        }

        let yesButton = (
            <Button bsStyle="danger" onClick={this.props.actionButton}>
                DA
            </Button>
        );
        let noButton = (
            <Button bsStyle="primary" onClick={this.props.closeModal}>Mai tarziu</Button>
        );

        if(this.props.yesButton) {
            yesButton = this.props.yesButton
        }

        if(this.props.noButton) {
            noButton = this.props.noButton
        }

        return (
            <div>
                <Modal show={this.props.show} onHide={this.props.closeModal} bsSize={bsSize} >
                        <Modal.Header closeButton style={{ backgroundColor: '#960094e0',color:'#FFF'}}>
                            <Modal.Title>{this.props.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ backgroundColor: '#960094e0'}}>
                            {this.props.body}
                        </Modal.Body>
                        <Modal.Footer style={{ backgroundColor: '#960094e0',color:'#FFF',marginTop:0}}>
                            {yesButton}
                            {noButton}
                        </Modal.Footer>

                </Modal>
            </div>
        );
    }
}

ModalBox.propTypes = {
    show: PropTypes.bool,
    closeModal:PropTypes.func,
    actionButton:PropTypes.func,
    body:PropTypes.element,
    title:PropTypes.element,
    yesButton:PropTypes.element,
    noButton:PropTypes.element,
};

export default (ModalBox);