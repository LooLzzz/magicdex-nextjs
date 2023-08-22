import { useCallback, useState } from 'react'


interface TimedHandlers {
  start: () => void
  stop: () => void
  reset: () => void
}

const useTimed = (): [null | number, TimedHandlers] => {
  const [startTime, setStartTime] = useState<null | number>(null)
  const [timeDelta, setTimeDelta] = useState<null | number>(null)

  const start = useCallback(() => {
    setStartTime(Date.now())
  }, [setTimeDelta, setStartTime])

  const stop = useCallback(() => {
    if (startTime) {
      setTimeDelta(Date.now() - startTime)
      setStartTime(null)
    }
  }, [startTime, setTimeDelta, setStartTime])

  const reset = useCallback(() => {
    setTimeDelta(null)
    setStartTime(null)
  }, [setTimeDelta, setStartTime])

  return [
    timeDelta,
    { start, stop, reset }
  ]
}

export { useTimed }
