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

interface Point {
  x: number,
  y: number,
}

interface MagicdexWebsocketResponseItem extends JsonObject {
  coords: {
    tl: Point,
    tr: Point,
    br: Point,
    bl: Point,
  },
  cardData: {
    scryfall_id: string,
    name: string,
    set: string,
  },
  match: number,
}

export type {
  MagicdexWebSocketHook,
  MagicdexWebSocketProps,
  MagicdexWebsocketResponseItem,
  MagicdexWebSocketReturn,
  Point,
  ReadyStateText,
}
