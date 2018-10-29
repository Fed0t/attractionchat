import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {css, StyleSheet} from 'aphrodite/no-important';
import Lightbox from 'react-images';

class Gallery extends Component {
    constructor() {
        super();

        this.state = {
            lightboxIsOpen: false,
            currentImage: 0,
        };

        this.closeLightbox = this.closeLightbox.bind(this);
        this.gotoNext = this.gotoNext.bind(this);
        this.gotoPrevious = this.gotoPrevious.bind(this);
        this.gotoImage = this.gotoImage.bind(this);
        this.handleClickImage = this.handleClickImage.bind(this);
        this.openLightbox = this.openLightbox.bind(this);
    }

    openLightbox(index, event) {
        event.preventDefault();
        this.setState({
            currentImage: index,
            lightboxIsOpen: true,
        });
    }

    closeLightbox() {
        this.setState({
            currentImage: 0,
            lightboxIsOpen: false,
        });
    }

    gotoPrevious() {
        this.setState({
            currentImage: this.state.currentImage - 1,
        });
    }

    gotoNext() {
        this.setState({
            currentImage: this.state.currentImage + 1,
        });
    }

    gotoImage(index) {
        this.setState({
            currentImage: index,
        });
    }

    handleClickImage() {
        if (this.state.currentImage === this.props.images.length - 1) return;

        this.gotoNext();
    }

    renderGallery() {
        const {images} = this.props;
        if (!images) return;
        let stylesheet = css(classes.source);
        const gallery = images.map((obj, i) => {
            if (images.length === 1) {obj.thumbnail = obj.src; stylesheet = css(classes.source,classes.paddingMore);}
            return (
                <a href={obj.src}
                   key={i}
                   className={css(classes.thumbnail, classes[obj.orientation])}
                   onClick={(e) => this.openLightbox(i, e)}>
                    <img src={obj.thumbnail} className={stylesheet} alt={'chat-file-send'}/>
                </a>
            );
        });

        return (
            <div>
                {gallery}
            </div>
        );
    }

    render() {
        return (
            <div className="section">
                {this.props.heading && <h2>{this.props.heading}</h2>}
                {this.props.subheading && <p>{this.props.subheading}</p>}
                {this.renderGallery()}
                <Lightbox
                    currentImage={this.state.currentImage}
                    images={this.props.images}
                    isOpen={this.state.lightboxIsOpen}
                    onClickImage={this.handleClickImage}
                    onClickNext={this.gotoNext}
                    onClickPrev={this.gotoPrevious}
                    onClickThumbnail={this.gotoImage}
                    onClose={this.closeLightbox}
                    preventScroll={this.props.preventScroll}
                    showThumbnails={this.props.showThumbnails}
                    spinner={this.props.spinner}
                    spinnerColor={this.props.spinnerColor}
                    spinnerSize={this.props.spinnerSize}
                    theme={this.props.theme}
                />
            </div>
        );
    }
}

Gallery.displayName = 'Gallery';
Gallery.propTypes = {
    heading: PropTypes.string,
    images: PropTypes.array,
    showThumbnails: PropTypes.bool,
    subheading: PropTypes.string,
};

const gutter = {
    small: 2,
    large: 4,
};
const classes = StyleSheet.create({
    gallery: {
        marginRight: -gutter.small,
        overflow: 'hidden',

        '@media (min-width: 500px)': {
            marginRight: -gutter.large,
        },
    },

    // anchor
    thumbnail: {
        boxSizing: 'border-box',
        display: 'block',
        float: 'left',
        lineHeight: 0,
        paddingRight: gutter.small,
        paddingBottom: gutter.small,
        overflow: 'hidden',

        '@media (min-width: 500px)': {
            paddingRight: gutter.large,
            paddingBottom: gutter.large,
        },
    },

    // orientation
    landscape: {
        width: '30%',
    },
    square: {
        paddingBottom: 0,
        width: '40%',

        '@media (min-width: 500px)': {
            paddingBottom: 0,
        },
    },

    // actual <img />
    source: {
        border: 0,
        display: 'block',
        height: 'auto',
        maxWidth: '100%',
        width: 'auto',
    },
    paddingMore: {
        padding:5,
        height:250
    },
});

export default Gallery;