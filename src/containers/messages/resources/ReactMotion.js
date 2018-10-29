import React, {Component} from 'react';
import clickdrag from 'react-clickdrag';

class ReactMotion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastPositionX: 185,
            lastPositionY: -385,
            currentX: 185,
            currentY: -385,
        };
    };


    componentWillReceiveProps(nextProps) {
        if (nextProps.dataDrag.isMoving) {
            this.setState({
                currentX: this.state.lastPositionX + nextProps.dataDrag.moveDeltaX,
                currentY: this.state.lastPositionY + nextProps.dataDrag.moveDeltaY,
            });
        }
        else {
            this.setState({
                lastPositionX: this.state.currentX,
                lastPositionY: this.state.currentY
            });
        }
    }

    render() {
        let chatHeadButton = require('../../../assets/chat-head.jpg');
        return (
            <div
                style={{
                    WebkitTransform: `translate3d(${this.state.currentX}px, ${this.state.currentY}px, 0)`,
                    transform: `translate3d(${this.state.currentX}px, ${this.state.currentY}px, 0)`,
                    zIndex: 999,
                    position: 'absolute'
                }}>
                <div className={`demo1-ball`} style={{backgroundImage: `url(/${chatHeadButton})`, position: 'relative'}}
                     onClick={() => {
                         this.props.showBox();
                     }}>
                </div>
            </div>
        );
    };
}

let ClickDragExample = clickdrag(ReactMotion, {touch: true});

export default ClickDragExample;
