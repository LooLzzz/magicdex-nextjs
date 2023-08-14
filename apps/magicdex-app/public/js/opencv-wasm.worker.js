/* eslint-disable no-undef */

var Module = {}
Module['onRuntimeInitialized'] = () => {
  // onLoad
  console.debug('cv-wasm.worker done loading', { cv, dfd })
  postMessage({ type: 'loaded', data: true })
}
importScripts('cv-wasm.js', 'https://cdn.jsdelivr.net/npm/danfojs@1.1.2/lib/bundle.min.js')

// declare const cv: OpenCV
// declare const dfd: DanfoJs


self.onmessage = ({ data }) => {
  postMessage({ type: 'message', data: `${data}-sama` })
}

self.onerror = e => {
  console.error(e)
  postMessage({ type: 'error', data: e })
}
