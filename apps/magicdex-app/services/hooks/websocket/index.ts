import { useCallback, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import type { MagicdexWebSocketHook, MagicdexWebsocketResponseItem, ReadyStateText } from './types'


const useMagicdexWebSocket: MagicdexWebSocketHook = (url, { port = 5200, protocol = 'ws', onClose, ...options } = {}) => {
  const [shouldConnect, setShouldConnect] = useState(false)

  const res = useWebSocket<MagicdexWebsocketResponseItem[]>(
    url ? `${protocol}://${url}:${port}` : undefined,
    {
      ...options,
      onClose: event => { setShouldConnect(false); onClose?.(event) },
    },
    shouldConnect
  )

  const isClosed = res.readyState === ReadyState.CLOSED
  const isClosing = res.readyState === ReadyState.CLOSING
  const isConnecting = res.readyState === ReadyState.CONNECTING
  const isConnected = res.readyState === ReadyState.OPEN
  const isInstantiated = res.readyState !== ReadyState.UNINSTANTIATED

  const readyStateText = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[res?.readyState ?? -1] as ReadyStateText

  return {
    ...res,
    isClosed,
    isClosing,
    isConnecting,
    isConnected,
    isInstantiated,
    readyStateText,

    open: useCallback(() => setShouldConnect(true), [setShouldConnect]),
    close: useCallback(() => setShouldConnect(false), [setShouldConnect]),
  }
}

export {
  useMagicdexWebSocket,
}
