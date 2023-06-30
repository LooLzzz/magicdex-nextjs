import { FloatingLabelTextInput } from '@/components/CustomMantineInputs'
import { useMagicdexWebSocket } from '@/services/hooks'
import { Box, Button, Center, Group, Stack, Text } from '@mantine/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'


export default function ImportWebcam() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const webcamRef = useRef<Webcam>(null)
  const canvasCtx = canvasRef?.current?.getContext('2d')
  const [socketUrl, setSocketUrl] = useState<string>('localhost')
  const { sendMessage, lastJsonMessage, isConnected, isConnecting, isInstantiated, open, close } = useMagicdexWebSocket(socketUrl, {})

  const handleConnectDisconnect = useCallback(
    () => {
      if (!isConnected)
        open()
      else {
        close()
      }
    },
    [isConnected, open, close])

  const handleSendMessage = useCallback(
    () => {
      sendMessage(webcamRef?.current?.getScreenshot())
    },
    [sendMessage]
  )

  useEffect(() => {
    if (!canvasCtx)
      return

    // clear canvas
    canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height)

    // draw last message
    canvasCtx.strokeStyle = 'black'
    canvasCtx.lineWidth = 2
    for (const data of (lastJsonMessage ?? [])) {
      const { coords: { x, y, w, h }, cardData: { name } } = data
      canvasCtx.strokeRect(x, y, w, h)
      canvasCtx.fillText(name, x, y - 3)
    }
  }, [canvasCtx, lastJsonMessage])

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
              disabled={!isInstantiated || !isConnected}
            >
              Rx/Tx
            </Button>
          </Group>
        </Center>

        {lastJsonMessage ? <Text>Last message: {JSON.stringify(lastJsonMessage)}</Text> : null}

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
            videoConstraints={{
              facingMode: 'environment',
              // width: 1280,
              // height: 720,
            }}
          />
        </Box>
      </Stack>
    </Center>
  )
}
