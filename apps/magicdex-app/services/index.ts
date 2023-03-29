
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultFetcher = (input: string | Request | URL, init?: RequestInit): Promise<{ [key: string]: any }> => (
  fetch(input, init)
    .then(res => res.json())
)

export {
  defaultFetcher,
}
