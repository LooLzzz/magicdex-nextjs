import { Box, Button, Center, Group, Stack } from '@mantine/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'

interface CardData {
  distance: bigint,
  cardData: {
    scryfall_id: string,
    name: string,
    set: string,
  },
  coords: {
    tl: { x: number, y: number },
    tr: { x: number, y: number },
    br: { x: number, y: number },
    bl: { x: number, y: number },
  },
}

interface WorkerMessage {
  type: string,
  data?: boolean | Error | CardData[],
}

export default function ImportWebcam() {
  const workerRef = useRef<Worker>()
  const [timeStart, setTimeStart] = useState<number>(0)
  const [timeEnd, setTimeEnd] = useState<number>(0)
  const [rtt, setRtt] = useState<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const webcamRef = useRef<Webcam>(null)
  const canvasCtx = canvasRef?.current?.getContext('2d')
  const [isNewMessage, setIsNewMessage] = useState<boolean>(true)
  const [isWorkerLoaded, setIsWorkerLoaded] = useState<boolean>(false)
  const [lastJsonMessage, setLastJsonMessage] = useState<CardData[]>([])


  const handleSendMessage = useCallback(async () => {
    setTimeStart(Date.now())
    const { videoHeight: height, videoWidth: width } = webcamRef?.current?.video ?? {}
    const webcamCanvasCtx = webcamRef?.current?.getCanvas()?.getContext('2d', { willReadFrequently: true })
    const imageData = webcamCanvasCtx?.getImageData(0, 0, height, width)
    workerRef.current?.postMessage({ imageData })
  }, [])

  useEffect(() => {
    const t = timeEnd - timeStart
    if (t > 0)
      setRtt(t)
  }, [timeStart, timeEnd])

  useEffect(() => {
    if (!setIsWorkerLoaded)
      return

    const interval = setInterval(() => {
      if (isNewMessage) {
        // handleSendMessage()
        setIsNewMessage(false)
      }

      if (canvasCtx) {
        // clear canvas
        canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height)

        // draw last message
        for (const data of lastJsonMessage) {
          const { coords: { tl, tr, br, bl }, cardData: { name, set } } = data
          canvasCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
          canvasCtx.lineWidth = 1.5
          canvasCtx.beginPath()
          canvasCtx.moveTo(tl.x, tl.y)
          canvasCtx.lineTo(tr.x, tr.y)
          canvasCtx.lineTo(br.x, br.y)
          canvasCtx.lineTo(bl.x, bl.y)
          canvasCtx.closePath()

          canvasCtx.fillStyle = 'rgba(88, 187, 255, 0.5)'
          canvasCtx.stroke()
          canvasCtx.fill()

          canvasCtx.font = '25px Calibri'
          canvasCtx.fillStyle = 'white'
          canvasCtx.strokeStyle = 'black'
          canvasCtx.lineWidth = 2.5
          canvasCtx.miterLimit = 2
          canvasCtx.strokeText(`${name} [${set.toUpperCase()}]`, tl.x, tl.y < 50 ? bl.y + 25 : tl.y - 10)
          canvasCtx.fillText(`${name} [${set.toUpperCase()}]`, tl.x, tl.y < 50 ? bl.y + 25 : tl.y - 10)
        }
      }
    }, 10)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  const handleWorkerMessage = useCallback(({ type, data }: WorkerMessage) => {
    if (type === 'error') {
      console.error(data as Error)
      return
    }

    if (type === 'loaded') {
      setIsWorkerLoaded(data as boolean)
      return
    }

    setTimeEnd(Date.now())
    console.log('workerMessage', { type, data })
    setLastJsonMessage((data ?? []) as CardData[])
  }, [])

  useEffect(() => {
    workerRef.current = new Worker('/js/phash.worker.js')
    workerRef.current.onmessage = ({ data }: MessageEvent<WorkerMessage>) => handleWorkerMessage(data)
    return workerRef.current?.terminate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Center>
      <Stack>
        <Center>
          <Group>
            <Button
              onClick={handleSendMessage}
              disabled={!isWorkerLoaded}
            >
              {
                isWorkerLoaded
                  ? 'Send Screenshot'
                  : 'Loading...'
              }
            </Button>
          </Group>
        </Center>

        <Center>
          {rtt > 0 && `RTT: ${rtt}ms`}
        </Center>

        <Box pos='relative'>
          <canvas
            ref={canvasRef}
            width={webcamRef?.current?.video?.videoWidth}
            height={webcamRef?.current?.video?.videoHeight}
            style={{
              position: 'absolute',
              zIndex: 1,
            }}
          />

          <Webcam
            ref={webcamRef}
            audio={false}
            width={640}
            height={480}
            videoConstraints={{ facingMode: 'environment' }}
          />
        </Box>
      </Stack>
    </Center>
  )
}
