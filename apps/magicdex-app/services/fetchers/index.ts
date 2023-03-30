
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function defaultFetcher(input: string | Request | URL, init?: RequestInit, timeit = false): Promise<{ [key: string]: any }> {
  const startTime = Date.now()
  const res = await fetch(input, init).then(
    res => res.json()
  )

  if (timeit)
    console.debug(`[defaultFetcher] ${input} took ${Date.now() - startTime}ms`)
  return res
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function postFetcher([input, body], timeit = false): Promise<{ [key: string]: any }> {
  const startTime = Date.now()
  const res = await fetch(
    input,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then(res => res.json())

  if (timeit)
    console.debug(`[postFetcher] ${input} took ${Date.now() - startTime}ms`)
  return res
}

export default defaultFetcher
