// declare const cv: OpenCV
// declare const dfd: DanfoJs

var cv = {}
var dfd = {}
var phash_df = {}
var utils = {}


console.debug('cv-wasm.worker: loading libs...')
importScripts(
  'https://cdn.jsdelivr.net/npm/opencv.js-webassembly@4.2.0/opencv.min.js',
  'https://cdn.jsdelivr.net/npm/danfojs@1.1.2/lib/bundle.min.js',
  'utils.js',
)
cv = cv()

console.debug('cv-wasm.worker: fetching phash dataset...')
dfd.readCSV('https://media.githubusercontent.com/media/LooLzzz/magicdex-nextjs/phash/phash_normal_256bit.csv')
  .then(df => {
    // const newPhashColumn = df['phash'].apply(x => BigInt(x).toString(2).split('').map(d => parseInt(d))).values
    // df.drop({ columns: ['phash'] })
    // df.addColumn('phash', newPhashColumn)
    // console.log(df['phash'])

    phash_df = df
    console.debug('cv-wasm.worker: done!', { cv, dfd, utils, phash_df })
    postMessage({ type: 'loaded', data: true })
  })
  .catch(e => {
    console.error(e)
    postMessage({ type: 'error', data: e })
  })


self.onmessage = async ({ data }) => {
  const res = []
  const mat = cv.matFromImageData(data?.imageData)
  const sub_images = (
    utils
      .extract_sub_images(mat)
      .map(({ coords, mat }) => ({
        phash: utils.sub_image_to_phash(mat),
        coords,
      }))
  )
  mat.delete()

  for (const { phash, coords } of sub_images) {
    if (phash === null || phash === undefined)
      continue

    const { distance, ...cardData } = utils.match_phash(phash, phash_df, 130) ?? {}
    if (distance)
      res.push({ cardData, coords, distance, phash })
  }

  postMessage({ type: 'message', data: res })
}

self.onerror = e => {
  console.error(e)
  postMessage({ type: 'error', data: e })
}
