import { SimpleRpc } from './simple-rpc'
import * as Debug from 'debug'
import * as WebSocket from 'isomorphic-ws'
import * as msgpack from 'msgpack-lite'
import { BackOff } from './backoff'

const debug = Debug('rpc-transport')

/**
 * WSTransport is a RPCTransport which wraps WebSocket connection
 *
 * It is typically used on the server side (receiver side) when ws
 * is established.
 */
export class WSTransport implements SimpleRpc.Transport {
  private msgHandler?: SimpleRpc.MsgHandler
  private ws: WebSocket
  private closing = false

  constructor(ws: WebSocket) {
    this.ws = ws
    ws.onmessage = this.onMessage
  }

  private onMessage = (e: { data: any }) => {
    if (!this.msgHandler) throw new Error('WS: Receiver not set')
    const buff = e.data instanceof Uint8Array ? e.data : new Uint8Array(e.data)
    const msg = msgpack.decode(buff)
    this.msgHandler(msg)
  }

  setMsgHandler(msgHandler?: SimpleRpc.MsgHandler) {
    this.msgHandler = msgHandler
  }

  send(packet: SimpleRpc.Packet) {
    const msg = msgpack.encode(packet)
    if (!this.connected) {
      debug(`WS Disconnected. Couldnt send ${packet}`)
      return Promise.resolve()
    }

    return new Promise<void>((resolve, reject) => {
      // @ts-ignore
      this.ws.send(msg, err => (err ? reject(err) : resolve()))
    })
  }

  public get connected() {
    return !this.closing && this.ws && this.ws.readyState === WebSocket.OPEN
  }

  close(...args: any[]) {
    this.closing = true
    this.ws.close(...args)
  }
}

export type WSOpts = {
  retryInterval?: number
  onOpen?: () => void
  onClose?: (ev: CloseEvent) => void
  onReconnect?: () => void
}

const defaultOpts: WSOpts = {
  retryInterval: 1000,
  onOpen: () => {},
  onClose: (ev: CloseEvent) => {},
  onReconnect: () => {},
}

/**
 * RPCTransport is RPCTransport for websocket with retry
 *
 * Typically used on the client side, when a ws conn needs
 * to be established with retry
 *
 * const io = new WSRetryTransport('ws://localhost:8080', {
 *   onOpen: () => {},
 *   onClose: (ev: CloseEvent) => {},
 *   onReconnect: () => console.log('reconnecting...'),
 * })
 * io.open()
 *
 * const rpc = new SimpleRpc(io, {
 *   add: (a: number, b: number) => a + b
 * })
 *
 */
export class WSRetryTransport implements SimpleRpc.Transport {
  private uri: string
  private opts: WSOpts
  private clientOpts?: WebSocket.ClientOptions
  private handlerFn?: SimpleRpc.MsgHandler
  private ws?: WebSocket
  private backOff: BackOff
  private timer?: NodeJS.Timer
  private _connected = false
  private _waitMs = 0

  constructor(uri: string, opts: WSOpts = {}, clientOpts?: WebSocket.ClientOptions) {
    this.uri = uri
    this.opts = { ...defaultOpts, ...opts }
    this.clientOpts = clientOpts
    this.backOff = new BackOff(this.opts.retryInterval, this.opts.retryInterval! * 150)
  }

  public open() {
    // clear reconnect timer, if any
    if (this.timer) clearTimeout(this.timer)

    this.ws = new WebSocket(this.uri, this.clientOpts)
    // On client side, we default to arraybuffer
    // on server side, we assume https://github.com/websockets/ws is used
    // When set to 'arraybuffer' on the client side, server will
    // always receive _binarytype as 'arraybuffer' see
    // https://github.com/websockets/ws/commit/b80b33588d92ebfdd9d12d75415dd5eace6c9531
    this.ws.binaryType = 'arraybuffer'
    this.ws.onmessage = (e: { data: any }) => {
      if (!this.handlerFn) throw new Error('WS: Receiver not set')
      const buff = e.data instanceof Uint8Array ? e.data : new Uint8Array(e.data)
      const msg = msgpack.decode(buff)
      this.handlerFn(msg)
    }
    this.ws.onerror = (e: any) => {
      this._connected = false
      if (e.code === 'ECONNREFUSED') this.reconnect()
    }

    this.ws.onopen = (ev: any) => {
      this._connected = true
      this.backOff.reset()
      this.opts.onOpen!()
      delete this.timer
    }

    this.ws.onclose = (ev: any) => {
      this._connected = false
      if (!this.timer) this.opts.onClose!(ev)
      if (ev.code !== 1000 && ev.code !== 1005) {
        this.reconnect()
        return
      }
    }
  }

  private reconnect() {
    this._waitMs = this.backOff.duration
    this.timer = setTimeout(() => {
      this.opts.onReconnect!()
      this.open()
    }, this._waitMs)
  }

  public get connected() {
    return this._connected && !!this.ws && this.ws.readyState === WebSocket.OPEN
  }

  public get waitTime() {
    return this._waitMs
  }

  public retry() {
    this.backOff.reset()
    this.open()
  }

  public getWaitTime() {
    return this._waitMs
  }

  public setMsgHandler(handlerFn?: SimpleRpc.MsgHandler) {
    this.handlerFn = handlerFn
  }

  public send(packet: SimpleRpc.Packet) {
    const msg = msgpack.encode(packet)
    if (!this.connected) {
      debug(`WS Disconnected. Couldnt send ${packet}`)
      return Promise.resolve()
    }

    return new Promise<void>((resolve, reject) => {
      // @ts-ignore
      this.ws.send(msg, err => (err ? reject(err) : resolve()))
    })
  }

  public close(...args: any[]) {
    this.ws!.close(...args)
  }
}
