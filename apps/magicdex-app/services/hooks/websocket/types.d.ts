import useWebSocket, { Options } from 'react-use-websocket'


type Url = string | (() => string | Promise<string>) | null

type ReadyStateText = 'Connecting' | 'Open' | 'Closing' | 'Closed' | 'Uninstantiated'

interface MagicdexWebSocketProps extends Omit<Options, 'protocols'> {
  port?: number,
  protocol?: 'ws' | 'wss',
}

interface MagicdexWebSocketReturn extends ReturnType<typeof useWebSocket> {
  open: () => void,
  close: () => void,
  isClosed: boolean,
  isClosing: boolean,
  isConnecting: boolean,
  isConnected: boolean,
  isInstantiated: boolean,
  readyStateText: ReadyStateText,
}

type MagicdexWebSocketHook = (url: Url, options?: MagicdexWebSocketProps) => MagicdexWebSocketReturn

export type {
  MagicdexWebSocketProps,
  MagicdexWebSocketReturn,
  MagicdexWebSocketHook,
  ReadyStateText,
}
