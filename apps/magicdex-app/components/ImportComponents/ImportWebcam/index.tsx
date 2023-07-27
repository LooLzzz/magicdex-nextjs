import { FloatingLabelTextInput } from '@/components/CustomMantineInputs'
import { useMagicdexWebSocket } from '@/services/hooks'
import { Box, Button, Center, Group, Stack } from '@mantine/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'


export default function ImportWebcam() {
  const [timeStart, setTimeStart] = useState<number>(0)
  const [timeEnd, setTimeEnd] = useState<number>(0)
  const [rtt, setRtt] = useState<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const webcamRef = useRef<Webcam>(null)
  const canvasCtx = canvasRef?.current?.getContext('2d')
  const [isNewMessage, setIsNewMessage] = useState<boolean>(true)
  const [socketUrl, setSocketUrl] = useState<string>('localhost')
  const { sendMessage, lastJsonMessage, isConnected, isConnecting, open, close } = useMagicdexWebSocket(
    socketUrl,
    {
      onMessage: () => { setTimeEnd(Date.now()); setIsNewMessage(true) },
      onClose: () => setIsNewMessage(true)
    }
  )

  const handleConnectDisconnect = useCallback(() => {
    if (!isConnected)
      open()
    else {
      close()
    }
  }, [isConnected, open, close])

  const handleSendMessage = useCallback(async () => {
    setTimeStart(Date.now())
    sendMessage(webcamRef?.current?.getScreenshot())
  }, [sendMessage])

  useEffect(() => {
    const t = timeEnd - timeStart
    if (t > 0)
      setRtt(t)
  }, [timeStart, timeEnd])

  useEffect(() => {
    if (!isConnected)
      return

    const interval = setInterval(() => {
      if (isNewMessage) {
        handleSendMessage()
        setIsNewMessage(false)
      }

      if (canvasCtx) {
        // clear canvas
        canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height)

        // draw last message
        for (const data of (lastJsonMessage ?? [])) {
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
  })

  return (
    <Center>
      <Stack>
        <FloatingLabelTextInput
          label='Socket URL'
          value={socketUrl}
          disabled={isConnected}
          onChange={e => setSocketUrl(e.currentTarget.value)}
        />

        <Center>
          <Group>
            <Button
              onClick={handleConnectDisconnect}
              disabled={isConnecting}
              color={isConnected ? 'red' : undefined}
            >
              {isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!isConnected}
              color='default'
            >
              Send Screenshot
            </Button>
          </Group>
        </Center>

        <Center>
          {
            rtt > 0 && `RTT: ${rtt}ms`
          }
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
            // width={640}
            // height={480}
            videoConstraints={{
              facingMode: 'environment',
            }}
          />
        </Box>
      </Stack>
    </Center>
  )
}
