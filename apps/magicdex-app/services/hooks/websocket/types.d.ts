import type { JsonObject, Options, WebSocketHook } from 'react-use-websocket/dist/lib/types'


type Url = string | (() => string | Promise<string>) | null
type ReadyStateText = 'Connecting' | 'Open' | 'Closing' | 'Closed' | 'Uninstantiated'
type MagicdexWebSocketHook = (url: Url, options?: MagicdexWebSocketProps) => MagicdexWebSocketReturn

interface MagicdexWebSocketProps extends Omit<Options, 'protocols'> {
  port?: number,
  protocol?: 'ws' | 'wss',
}

interface MagicdexWebSocketReturn extends WebSocketHook<MagicdexWebsocketResponseItem[]> {
  open: () => void,
  close: () => void,
  isClosed: boolean,
  isClosing: boolean,
  isConnecting: boolean,
  isConnected: boolean,
  isInstantiated: boolean,
  readyStateText: ReadyStateText,
}

interface MagicdexWebsocketResponseItem extends JsonObject {
  coords: {
    x: number,
    y: number,
    w: number,
    h: number,
  },
  cardData: {
    scryfall_id: string,
    name: string,
  }
}

export type {
  MagicdexWebSocketHook,
  MagicdexWebSocketProps,
  MagicdexWebsocketResponseItem,
  MagicdexWebSocketReturn,
  ReadyStateText,
}
