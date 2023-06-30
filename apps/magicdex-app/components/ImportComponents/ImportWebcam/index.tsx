import { FloatingLabelTextInput } from '@/components/CustomMantineInputs'
import { useMagicdexWebSocket } from '@/services/hooks'
import { Button, Center, Group, Stack, Text } from '@mantine/core'
import React, { useCallback, useState } from 'react'
import CanvasThing from './CanvasThing'


export default function ImportWebcam() {
  const [socketUrl, setSocketUrl] = useState<string>('')
  const [messageInput, setMessageInput] = useState<string>('')
  const { sendMessage, lastMessage, isConnected, isConnecting, isInstantiated, open, close } = useMagicdexWebSocket(socketUrl)

  const handleConnectDisconnect = useCallback(
    () => {
      if (!isConnected)
        open()
      else {
        close()
        setMessageInput('')
      }
    },
    [isConnected, open, close])

  const handleSendMessage = useCallback(
    () => {
      sendMessage(messageInput)
      setMessageInput('')
    },
    [sendMessage, messageInput]
  )

  return (
    <Center>
      <Stack>
        <FloatingLabelTextInput
          label='Socket URL'
          value={socketUrl}
          disabled={isConnected}
          onChange={e => setSocketUrl(e.currentTarget.value)}
        />
        <FloatingLabelTextInput
          label='Message'
          value={messageInput}
          disabled={!isConnected}
          onChange={e => setMessageInput(e.currentTarget.value)}
        />

        <Center>
          <Group>
            <Button
              onClick={handleConnectDisconnect}
              color={isConnected ? 'red' : undefined}
            >
              {isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!isInstantiated || !isConnected}
            >
              Send Message
            </Button>
          </Group>
        </Center>

        {lastMessage ? <Text>Last message: {lastMessage.data}</Text> : null}

        <CanvasThing />
      </Stack>
    </Center>
  )
}
