import { Embla } from '@mantine/carousel'


export function appendUrlParams(url: string, params: Record<string, string>) {
  const urlParams = new URLSearchParams(params)
  return `${url}?${urlParams.toString()}`
}

/**
 * Split an array into chunks of a given size
 * @param array The array to split
 * @param chunkSize The minimum size of each chunk, must be greater than 0. If 0 is passed, a single chunk will be returned
 * @returns An array of chunks
 */
export function splitArrayToChunks<T>(array: T[], chunkSize: number): T[][] {
  if (chunkSize < 0)
    throw new Error('Chunk size must be greater than 0')

  if (chunkSize === 0)
    return [array]

  const chunks = array.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / chunkSize)

    if (!resultArray[chunkIndex])
      resultArray[chunkIndex] = [] // start a new chunk
    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])

  return chunks
}

export function stringToBoolean(value: string) {
  if (typeof value !== 'string')
    throw new Error(`Invalid boolean string, expected 'string', got '${typeof value}'`)
  const _value = value.trim().toLowerCase()

  if (_value === 'true')
    return true

  if (_value === 'false')
    return false

  throw new Error(`Invalid boolean string, expected 'true' or 'false', got '${value}'`)
}

export function toTitleCase(value: string) {
  return value.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  )
}

export function roundPrecision(num: number, precision: number) {
  const d = 10 ** precision
  num += Number.EPSILON
  return Math.round(num * d) / d
}

export function emblaAutoHeightEffect(embla: Embla) {
  embla.on('init', e => {
    const slidesInView = embla.slidesInView(true)
    if (slidesInView.length === 0)
      return

    const { clientHeight: slideClientHeight } = embla.slideNodes()[slidesInView[0]]
    embla.rootNode().style.height = `${slideClientHeight}px`
  })
  embla.on('reInit', e => {
    const slidesInView = embla.slidesInView(true)
    if (slidesInView.length === 0)
      return

    const { clientHeight: slideClientHeight } = embla.slideNodes()[embla.slidesInView(true)[0]]
    embla.rootNode().style.height = `${slideClientHeight}px`
  })
  embla.on('select', e => {
    const slidesInView = embla.slidesInView(true)
    if (slidesInView.length === 0)
      return

    const { clientHeight: slideClientHeight } = embla.slideNodes()[embla.slidesInView(true)[0]]
    embla.rootNode().style.height = `${slideClientHeight}px`
  })
}

export function renameObjectKeys<T extends Record<string, unknown> | Record<string, unknown>[]>(obj: T, keyMap: Record<string, string>): T {
  if (Array.isArray(obj))
    return obj.map(item => renameObjectKeys(item, keyMap)) as T

  return Object.fromEntries(
    Object
      .entries(obj)
      .map(([key, value]) => [keyMap[key] ?? key, value])
  ) as T
}

export function filterObject<T extends Record<string, unknown> | Record<string, unknown>[]>(obj: T, filter: (value: [string, unknown], index: number, array: [string, unknown][]) => boolean): T {
  if (Array.isArray(obj))
    return obj.map(item => filterObject(item, filter)) as T

  return Object.fromEntries(
    Object
      .entries(obj)
      .filter(filter)
  ) as T
}

export function uniqueArray<T>(array: T[]) {
  return array.filter((value, index, self) => self.indexOf(value) === index)
  // return [...new Set(array)]
}
