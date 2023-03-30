
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