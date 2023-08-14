/* eslint-disable no-undef*/
importScripts('opencv.js')


self.onmessage = e => {
  postMessage({ type: 'message', data: e.data })
}

self.onerror = e => {
  console.error(e)
  postMessage({ type: 'error', data: e })
}


// onLoad
console.debug('opencv-js.worker done loading', { cv })
postMessage({ type: 'loaded', data: true })
