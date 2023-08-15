/* eslint-disable no-undef */
var utils = {}


utils.hammingDistanceString = (a, b) => {
  return ((a ^ b).toString(2).match(/1/g) || '').length
}

utils.hammingDistanceBigInt = (a, b) => {
  let sum = 0
  let val = BigInt(a) ^ BigInt(b)
  while (val) {
    ++sum
    val &= val - 1n
  }
  return sum
}

utils.hammingDistanceBinaryArray = (a, b) => {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] ^ b[i]
  }
  return sum
}

/** Taken from https://gist.github.com/bellbind/6fee86bd8027b57991f9 */
utils.dct2d = (mat, m, n) => {
  var isqrt2 = 1 / Math.sqrt(2)
  var px = Math.PI / m
  var py = Math.PI / n
  var r = []
  for (var ry = 0; ry < n; ry++) {
    for (var rx = 0; rx < m; rx++) {
      var c = Math.pow(isqrt2, (rx === 0) + (ry === 0))
      var t = 0
      for (var y = 0; y < n; y++) {
        for (var x = 0; x < m; x++) {
          var v = mat[y * m + x]
          t += v * Math.cos(px * (x + 0.5) * rx) * Math.cos(py * (y + 0.5) * ry)
        }
      }
      r.push(c * t / 4)
    }
  }
  return r
}

/** Based on the implementation from https://github.com/JohannesBuchner/imagehash */
utils.phash = (mat, hash_size = 16, highfreq_factor = 4) => {
  const img_size = hash_size * highfreq_factor
  const idx_midpoint = Math.floor((hash_size * hash_size) / 2)

  cv.cvtColor(mat, mat, cv.COLOR_BGR2GRAY, 0)
  cv.resize(mat, mat, new cv.Size(img_size, img_size), 0, 0, cv.INTER_AREA)

  const dct_coef = utils.dct2d(mat.data, img_size, img_size)
  const dct_lowfreq = dct_coef.filter((v, idx) => (Math.floor(idx / img_size) < hash_size) && ((idx % img_size) < hash_size))
  const dct_median = dct_lowfreq.slice().sort((a, b) => a - b)[idx_midpoint]
  const hash_array = dct_lowfreq.map(v => v > dct_median ? 1 : 0)
  const hash = BigInt('0b' + hash_array.join(''))

  return hash
  // return hash_array
}

utils.find_rects = (mat) => {
  const gray = new cv.Mat()
  const blurred = new cv.Mat()
  const edged = new cv.Mat()
  const kernel = cv.Mat.ones(3, 3, cv.CV_8U)
  const dilated = new cv.Mat()
  const eroded = new cv.Mat()
  const contours = new cv.MatVector()
  const hier = new cv.Mat()

  cv.cvtColor(mat, gray, cv.COLOR_BGR2GRAY, 0)
  cv.medianBlur(gray, blurred, 5)
  cv.adaptiveThreshold(blurred, edged, 0xFF, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 5, 5)
  cv.dilate(edged, dilated, kernel, new cv.Point(-1, -1), 1)
  cv.erode(dilated, eroded, kernel, new cv.Point(-1, -1), 1)

  cv.findContours(eroded, contours, hier, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

  const rects = []
  if (hier) {
    const stack = [[0, hier.intPtr(0, 0)]]
    while (stack.length > 0) {
      const [i_cnt, h] = stack.pop()
      const [i_next, i_prev, i_child, i_parent] = h
      if (i_next !== -1) {
        stack.push([i_next, hier.intPtr(0, i_next)])
      }

      const cnt = contours.get(i_cnt)
      const size = cv.contourArea(cnt)
      const peri = cv.arcLength(cnt, true)
      const approx = new cv.Mat()
      cv.approxPolyDP(cnt, approx, 0.04 * peri, true)

      if (size >= 10000 && approx.rows === 4) {
        rects.push({
          tl: { x: approx.data32S[0], y: approx.data32S[1] },
          tr: { x: approx.data32S[2], y: approx.data32S[3] },
          br: { x: approx.data32S[4], y: approx.data32S[5] },
          bl: { x: approx.data32S[6], y: approx.data32S[7] },
        })
      }
      else if (i_child !== -1) {
        stack.push([i_child, hier.intPtr(0, i_child)])
      }

      approx.delete()
    }
  }

  gray.delete()
  blurred.delete()
  edged.delete()
  kernel.delete()
  dilated.delete()
  eroded.delete()
  contours.delete()
  hier.delete()
  return rects
}

utils.resize_to_ratio = (mat, ratio = 1.4) => {
  const height = mat.rows
  const width = mat.cols
  const current_ratio = height / width

  if (current_ratio > ratio) {
    const new_height = width * ratio
    return cv.resize(mat, mat, new cv.Size(width, new_height))
  } else {
    const new_width = height / ratio
    return cv.resize(mat, mat, new cv.Size(new_width, height))
  }
}

utils.rect_to_point_array = (rect) => {
  return cv.matFromArray(
    4, 1, cv.CV_32FC2,
    [
      rect.tl.x, rect.tl.y,
      rect.tr.x, rect.tr.y,
      rect.br.x, rect.br.y,
      rect.bl.x, rect.bl.y
    ],
  )
}

utils.four_point_transform = (mat, rect) => {
  const { tl, tr, br, bl } = rect

  const width_a = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2))
  const width_b = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2))
  const max_width = Math.max(width_a, width_b)

  const height_a = Math.sqrt(Math.pow(tr.x - br.x, 2) + Math.pow(tr.y - br.y, 2))
  const height_b = Math.sqrt(Math.pow(tl.x - bl.x, 2) + Math.pow(tl.y - bl.y, 2))
  const max_height = Math.max(height_a, height_b)

  const warped = new cv.Mat()
  cv.warpPerspective(
    mat,
    warped,
    cv.getPerspectiveTransform(
      utils.rect_to_point_array(rect),
      cv.matFromArray(
        4, 1, cv.CV_32FC2,
        [
          0, 0,
          max_width - 1, 0,
          max_width - 1, max_height - 1,
          0, max_height - 1
        ])
    ),
    new cv.Size(max_width, max_height),
  )

  if (max_width > max_height) {
    cv.warpAffine(
      warped,
      warped,
      cv.getRotationMatrix2D(
        new cv.Point(max_height / 2, max_height / 2),
        270,
        1.0
      ),
      new cv.Size(max_height, max_width),
    )
  }
  return warped
}

utils.crop_scale_image = (mat, scale = 0.98) => {
  const center_x = mat.cols / 2
  const center_y = mat.rows / 2
  const new_w = mat.cols * scale
  const new_h = mat.rows * scale
  const lx = center_x - new_w / 2
  const rx = center_x + new_w / 2
  const ty = center_y - new_h / 2
  const by = center_y + new_h / 2

  // region_of_interest
  return mat.roi(
    new cv.Rect(lx, ty, rx - lx, by - ty)
  )
}

utils.extract_sub_images = (mat) => {
  return utils
    .find_rects(mat)
    .map(rect => ({
      coords: rect,
      mat: utils.four_point_transform(mat, rect),
    }))
}

utils.sub_image_to_phash = (mat) => {
  return utils.phash(
    utils.crop_scale_image(mat)
  )
}

utils.match_phash = (phash, phash_df, threshold) => {
  phash_df = phash_df.addColumn(
    'distance',
    phash_df['phash'].apply(x => utils.hammingDistanceString(phash, BigInt(x)))
    // phash_df['phash'].apply(x => utils.hammingDistanceBigInt(phash, BigInt(x)))
    // phash_df['phash'].apply(x => utils.hammingDistanceBinaryArray(phash, BigInt(x).toString(2).split('').map(d => parseInt(d))))
  )

  const argmin = phash_df['distance'].argMin()
  const row = phash_df.iloc({ rows: [argmin] })
  // phash_df = phash_df.sortValues('distance')
  // phash_df.head(10).print()
  // const row = phash_df.iloc({ rows: [0] })

  if (row['distance'].values[0] > threshold) {
    return null
  }

  // return dfd.toJSON(row)[0]
  return {
    scryfall_id: row['scryfall_id'].values[0],
    name: row['name'].values[0],
    set: row['set'].values[0],
    phash: row['phash'].values[0],
    distance: row['distance'].values[0],
  }
}
