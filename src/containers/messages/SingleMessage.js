import React from 'react'
import './resources/message.css'
import { stickersSoft, stickersHard } from './resources/stickers.js'
import moment from 'moment'
import Gallery from './Gallery'
// import Linkify from 'react-linkify';
// import {emojiTextParser} from '../../utils/Utils';
import renderHTML from 'react-render-html'
import ReactPlayer from 'react-player'
import Linkify from 'react-linkify'

let stickersRegex = ''
stickersSoft.concat(stickersHard).forEach(sticker => {
  stickersRegex = `${sticker.name}|${stickersRegex}`
})
stickersRegex = stickersRegex.slice(0, -1)
stickersRegex = new RegExp(stickersRegex, 'i')

const privatePhotosRegex = new RegExp(/{("private_photos":[^]*)}/i)
const publicPhotosRegex = new RegExp(/{("public_photos":[^]*)}/i)
const htmlRegex = new RegExp(
  /<div class="arrowchat_image_message">[\s\S\d]*<\/div>/i
)
const oldPhotos = new RegExp(/image[{]([0-9]{13})[}][{](.*)[}]/g)

const SingleMessage = props => {
  let message = renderHTML(props.text)

  let imageSource = ''
  let stickerSource = ''
  let videoSource = ''
  let mapsLink = ''

  if (props.images.length > 0) {
    let imageParse = JSON.parse(props.images)
    let imagesSources = []

    if (imageParse.constructor === Array) {
      imageParse.forEach(image => {
        imagesSources.push({
          src:
            'https://app.attractionclub.ro/storage' +
            image.path +
            '/' +
            image.id,
          thumbnail:
            'https://app.attractionclub.ro/storage' +
            image.path +
            '/thumbnail_' +
            image.id
        })
      })
    } else {
      imagesSources.push({
        src:
          'https://app.attractionclub.ro/storage' +
          imageParse.path +
          '/' +
          imageParse.id
      })
    }
    imageSource = <Gallery images={imagesSources} />
  }

  if (props.videos.length > 0) {
    let videoParse = JSON.parse(props.videos)
    if (videoParse.length > 0) {
      let parsedVideo = videoParse[0]
      videoSource = (
        <ReactPlayer
          width={200}
          controls={true}
          url={
            'https://app.attractionclub.ro/storage' +
            parsedVideo.path +
            '/' +
            parsedVideo.id
          }
        />
      )
    }
  }

  if (props.location.length > 0) {
    let locationObject = JSON.parse(props.location)
    mapsLink = (
      <span style={{ marginLeft: 5 }}>
        <a
          rel="noopener noreferrer"
          target="_blank"
          style={{ color: 'red' }}
          href={
            'http://maps.google.com/?q=' +
            locationObject.lat +
            ',' +
            locationObject.long
          }>
          Ti-am trimis un mesaj cu locatia mea in momentul acesta.
        </a>
        <div style={{ padding: 5 }}>
          <iframe
            title="map"
            width="100%"
            height="180"
            frameBorder="0"
            src={
              'https://www.bing.com/maps/embed?&cp=' +
              locationObject.lat +
              '~' +
              locationObject.long +
              '&lvl=16&typ=d&sty=r'
            }
            scrolling="no"
          />
        </div>
      </span>
    )
  }

  if (privatePhotosRegex.test(props.text)) {
    let privatePhotos = JSON.parse(props.text)
    let imagesGrid = []
    privatePhotos.private_photos.forEach(photo => {
      imagesGrid.push({
        src:
          'https://attractionclub.ro/assets/cache/images/images-full-' +
          photo +
          '.jpg',
        thumbnail:
          'https://attractionclub.ro/assets/cache/images/images-small-' +
          photo +
          '.jpg'
      })
    })
    message = (
      <Gallery
        subheading={
          props.user.username + ' ti-a trimis galeria privata din aplicatie.'
        }
        images={imagesGrid}
      />
    )
  }

  if (publicPhotosRegex.test(props.text)) {
    let privatePhotos = JSON.parse(props.text)
    let imagesGrid = []
    privatePhotos.public_photos.forEach(photo => {
      imagesGrid.push({
        src:
          'https://attractionclub.ro/assets/cache/images/images-full-' +
          photo +
          '.jpg',
        thumbnail:
          'https://attractionclub.ro/assets/cache/images/images-small-' +
          photo +
          '.jpg'
      })
    })
    message = (
      <Gallery
        subheading={
          props.user.username + ' ti-a trimis galeria publica din aplicatie.'
        }
        images={imagesGrid}
      />
    )
  }

  if (stickersRegex.test(props.text)) {
    let stickerImage = stickersSoft.concat(stickersHard).filter(function (item) {
      return item.name === props.text.match(stickersRegex)[0]
    })
    stickerSource = <img src={stickerImage[0].code} alt="" />
    message = ''
  }

  if (htmlRegex.test(props.text)) {
    let srcWithQuotes = props.text.match(/data-id=([^\s]*)\s/)[1]
    const imageSource = srcWithQuotes.substring(1, srcWithQuotes.length - 1)
    message = (
      <Gallery
        images={[
          {
            src: 'https://attractionclub.ro' + imageSource,
            thumbnail: 'https://attractionclub.ro' + imageSource + '_t'
          }
        ]}
      />
    )
  }

  if (oldPhotos.test(props.text)) {
    let srcWithQuotes = props.text.match(/image[{]([0-9]{13})[}][{](.*)[}]/)[1]
    message = (
      <Gallery
        images={[
          {
            src:
              'https://attractionclub.ro/chat/public/download.php?file=' +
              srcWithQuotes +
              '_t',
            thumbnail:
              'https://attractionclub.ro/chat/public/download.php?file=' +
              srcWithQuotes +
              '_t'
          }
        ]}
      />
    )
  }

  return (
    <Linkify properties={{ target: '_blank' }}>
      <div
        className="blockquote-box-mesaj clearfix"
        title={moment.unix(props.timestamp).format('HH:mm')}
        style={{ marginTop: 15, marginBottom: 10 }}>
        {props.isRight ? (
          <div className="pull-right right-message">
            <div className="h5-msg">{message}</div>
            {mapsLink}
            {imageSource}
            {videoSource}
            {stickerSource}
            {props.isReaded === 1 && (
              <span className="pull-right message-seen">
                {' '}
                Seen <span className="glyphicon glyphicon-ok" />
              </span>
            )}
          </div>
        ) : (
            <div
              className="square-mesaj"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
              <img
                alt={props.user.username}
                className={'img-circle'}
                src={props.user.avatar_url}
                style={{ height: 40, width: 40 }}
              />

              <div className="bubble1-mesaje bubble1-msg">
                <div className="h5-msg" style={{ padding: 5, fontSize: 15 }}>
                  {message}
                </div>
                {videoSource}
                {mapsLink}
                {imageSource}
                {stickerSource}
              </div>
            </div>
          )}
      </div>
    </Linkify>
  )
}

export default SingleMessage
