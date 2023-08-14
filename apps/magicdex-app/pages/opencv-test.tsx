import { Button, Center, Stack, TextInput } from '@mantine/core'
import { useCallback, useEffect, useRef, useState } from 'react'


interface WorkerMessage {
  type: string,
  data?: unknown,
}

export default function OpencvTestPage() {
  const workerRef = useRef<Worker>()
  const [textValue, setTextValue] = useState('')
  const [cvLoaded, setCvLoaded] = useState(false)

  const handleWorkerMessage = ({ type, data }: WorkerMessage) => {
    if (type === 'error') {
      console.error(data as Error)
      return
    }

    if (type === 'loaded') {
      setCvLoaded(data as boolean)
      return
    }

    console.log('workerMessage', { type, data })
  }

  const handleWork = useCallback(() => {
    workerRef.current?.postMessage(textValue)
  }, [textValue])

  useEffect(() => {
    workerRef.current = new Worker('/js/opencv-wasm.worker.js')
    workerRef.current.onmessage = ({ data }: MessageEvent<WorkerMessage>) => handleWorkerMessage(data)
    return workerRef.current?.terminate
  }, [])

  if (!cvLoaded) {
    return (
      <Center>Loading...</Center>
    )
  }

  return (
    <Center>
      <Stack>
        <TextInput
          value={textValue}
          onChange={v => setTextValue(v.currentTarget.value)}
        />

        <Button onClick={handleWork}>
          Submit
        </Button>
      </Stack>
    </Center>
  )
}
