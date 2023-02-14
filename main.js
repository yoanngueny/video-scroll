import './style.css'
import { Pane } from 'tweakpane'
import padStart from 'lodash/padStart'
import { calcRatioToCover } from './utils'

/**
 * Manage media types
 */

const MEDIA_TYPES = {
  VIDEO72: 'video72',
  VIDEO1: 'video1',
  IMAGES: 'images',
}

let video = document.querySelector('#video')
let canvas = document.querySelector('#canvas')
const context = canvas.getContext('2d')

function setMediaType(value) {
  resetScroll()
  // clean images
  images.length = 0
  context.clearRect(0, 0, canvas.width, canvas.height)
  canvas.style.display = 'none'
  // clean videos
  video.style.display = 'none'
  switch (value) {
    // show 72 key frame interval video
    case MEDIA_TYPES.VIDEO72:
      video.style.display = 'block'
      video.addEventListener('loadeddata', onVideoLoadedData)
      video.src = '/desktop_72kfd.mp4'
      break
    // show 1 key frame interval video
    case MEDIA_TYPES.VIDEO1:
      video.style.display = 'block'
      video.addEventListener('loadeddata', onVideoLoadedData)
      video.src = '/desktop_1kfd.mp4'
      break;
    // show canvas images
    case MEDIA_TYPES.IMAGES:
      canvas.style.display = 'block'
      loadImages()
      break;
  }
  // force resize
  onResize()
}

/**
 * Load canvas mode all images
 */

const images = []

function loadImages() {
  for (let i = 0; i <= 1410; i++) {
    const index = padStart(i, 4, '0')
    const image = new Image()
    image.src = `/images/desktop_${index}.jpg`
    images.push(image)
  }
}

/**
 * Pause video when data loaded (iOS needs autoplay video)
 */

function onVideoLoadedData() {
  if (video) {
    video.removeEventListener('loadeddata', onVideoLoadedData)
    video.pause()
  }
}

/**
 * Set video time according to scroll position
 */

let currentScrollPercent = 0
let smoothScrollPercent = 0
let previousVideoTime = 0

function animate() {
  // calculate scroll percent
  currentScrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
  // smooth scroll percent
  smoothScrollPercent += (currentScrollPercent - smoothScrollPercent) * 0.1
  // update timeline progress
  updateTimelineProgress()
  // update images progress
  if (mediaType.value === MEDIA_TYPES.IMAGES) {
    const imageIndex = Math.floor(smoothScrollPercent * images.length)
    if (imageIndex < images.length) {
      const image = images[imageIndex]
      if (image.complete) {
        const coverRatio = calcRatioToCover(image.width, image.height, canvas.width, canvas.height)
        const destinationWidth = image.width * coverRatio
        const destinationHeight = image.height * coverRatio
        const destinationX = (canvas.width - destinationWidth) * .5
        const destinationY = (canvas.height - destinationHeight) * .5
        context.drawImage(image, 0, 0, image.width, image.height, destinationX, destinationY, destinationWidth, destinationHeight)
      }
    }
  }
  // update video progress
  else {
    if (video.duration) {
      const currentVideoTime = smoothScrollPercent * video.duration
      // set video time when different from previous time
      if (Math.abs(currentVideoTime - previousVideoTime) > .1) {
        previousVideoTime = currentVideoTime
        video.currentTime = currentVideoTime
      }
    }
  }
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)

/**
 * Resize canvas
 */

function onResize() {
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}

window.addEventListener('resize', onResize)

/**
 * Reset scroll position to start
 */

function resetScroll() {
  window.scrollTo(0, 0)
  currentScrollPercent = 0
  smoothScrollPercent = 0
  previousVideoTime = 0
}

/**
 * Scale timeline progress according to scroll percent
 */

const timelineProgress = document.querySelector('.timeline_progress')

function updateTimelineProgress() {
  timelineProgress.style['transform'] = `scaleX(${smoothScrollPercent})`
  timelineProgress.style['-ms-transform'] = `scaleX(${smoothScrollPercent})`
  timelineProgress.style['-webkit-transformtransform'] = `scaleX(${smoothScrollPercent})`
}

/**
 * Add tweakpane to debug the media types
 */

const pane = new Pane()
const mediaType = pane.addBlade({
  view: 'list',
  label: 'Media',
  options: [
    { text: 'Video 72 KFI', value: MEDIA_TYPES.VIDEO72 },
    { text: 'Video 1 KFI', value: MEDIA_TYPES.VIDEO1 },
    { text: 'Images', value: MEDIA_TYPES.IMAGES },
  ],
  value: MEDIA_TYPES.IMAGES,
}).on('change', (ev) => {
  setMediaType(ev.value)
})

/**
 * set default media type
 */

setMediaType(mediaType.value)