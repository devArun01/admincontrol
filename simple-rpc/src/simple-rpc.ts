import * as Debug from 'debug'

const debug = Debug('simple-rpc')

interface Pending {
  [id: string]: {
    resolve: (res: any) => void
    reject: (err: any) => void
  }
}

const MAX_ID = Math.pow(2, 31) - 1
const unknownFn = (method: string) => `RPC invoked on unknown method "${method}"`

export const REQUEST = 0
export const RESPONSE = 1
export const NOTIFY = 2

export const INTERNAL_ERROR = {
  name: 'INTERNAL_ERROR',
  desc: 'Something broke, we are looking into it',
}

/**
 *
 * SimpleRpc is transport agonistic rpc library, focussing purely on
 *
 *  1. Framing protocol adheres to [msgpack-rpc](https://github.com/msgpack-rpc/msgpack-rpc/blob/master/spec.md) spec
 *  2. RPCCode is independent. Msgpack/json or any wire format can be used
 *  2. Invoking appropriate methods on either side
 *
 * Once connection is established, there's no difference between server and client
 * Either side can act as any or both in a true duplex fashion
 *
 * **RPC format**
 *  - Request: `[type, msgid, method, params]`, where `type=0`
 *  - Response: `[type, msgid, error, result]`, where `type=1`
 *  - Notify: `[type, method, params]`, where `type=2`
 *
 * where,
 *
 *  - `type` is `0 | 1 | 2`
 *  - `method` is always `string`
 *  - `params` is a list
 *  - `error` can be `any` but recommended to use obj with `code` & `msg`
 *
 *
 * Usage:
 * ```
 * // Using websocket transport
 * const ws = new WebSocket('ws://localhost:8080')
 * const rpc = new SimpleRpc(new WSTransport(ws), {
 *   // add some client exposed methods
 *   add: (a, b) => a + b,
 *   mul: (a, b) => a * b,
 * })
 *
 * ws.onmessage = (msg) => rpc.onmessage(msg).catch(console.trace)
 *
 * ```
 */
export class SimpleRpc<T extends SimpleRpc.Service<any>> {
  private logErr: typeof console.error
  private msgId = 0
  private io: SimpleRpc.Transport
  private service: T
  private pending = {} as Pending

  constructor(io: SimpleRpc.Transport, service: T, logErr = console.error) {
    this.io = io
    this.service = service
    this.logErr = logErr
    this.io.setMsgHandler(this.handleMessage)
  }

  private nextId = () => {
    return this.msgId < MAX_ID ? this.msgId++ : (this.msgId = 0)
  }

  private respond = async (packet: SimpleRpc.Response | SimpleRpc.Notify) => {
    return this.io.send(packet)
  }

  /**
   * handleMessage receives the packet in msgpack-rpc format &
   * invokes the appropriate local method from MethodMap
   * & responds with result or error
   *
   * handleMessage is declared as prop here (arrow fn) to bind `this`
   * allowing patterns like
   *
   * Unhandled errors are both responded & propagated upwards
   */
  private handleMessage = async (msg: SimpleRpc.Packet) => {
    switch (msg[0]) {
      case REQUEST: {
        const [, msgId, method, args] = msg as SimpleRpc.Request

        debugLog(msg)

        if (!(method in this.service)) {
          const msg = unknownFn(method)
          const resp: SimpleRpc.Response = [RESPONSE, msgId, { code: 'NO_METHOD' }, msg]
          this.respond(resp)
          this.logErr(msg)
          return
        }

        try {
          const result = await this.service[method].apply(null, args)
          await this.respond([RESPONSE, msgId, null, result])
          return
        } catch (err) {
          // rethrow if invoked method has unhandled error
          // with stack trace. To `only` return error, do
          // Promise.reject({...}) from handler
          if (err instanceof Error) {
            await this.respond([RESPONSE, msgId, INTERNAL_ERROR, null])
            throw err
          }

          await this.respond([RESPONSE, msgId, err, null])
          return
        }
      }
      case RESPONSE: {
        const [, msgId, err, result] = msg as SimpleRpc.Response
        const { resolve, reject } = this.pending[msgId]
        delete this.pending[msgId]
        debugLog(msg)
        return err ? reject(err) : resolve(result)
      }
      case NOTIFY: {
        const [, method, args] = msg as SimpleRpc.Notify
        debugLog(msg)
        if (method in this.service) {
          return this.service[method].apply(null, args).catch(err => {
            // When client is notifying us, they aren't interested in
            // listening to error. So incase of error's, only thing that
            // we can do is log to console for non error & crash for
            // exceptions
            if (err instanceof Error) throw err
            else this.logErr(err)
          })
        }

        this.logErr(unknownFn(method))
      }
    }
  }

  /**
   * request invokes the remote method & returns the result as promise
   *
   * @param method remote method name to be invoked
   * @param args args array for the remote method
   */
  public request = async (method: string, ...args: any[]) => {
    const id = this.nextId()
    const msg: SimpleRpc.Request = [0, id, method, args]
    // console.log('REQUEST', this.pending, id)
    debugLog(msg)
    const promise = new Promise<any>((resolve, reject) => {
      this.pending[id] = { resolve, reject }
      // console.log(this.pending)

      return this.io.send(msg).catch(e => {
        // delete this.pending[id]
        throw e
      })
    })

    return promise
  }

  /**
   * notify calls remote method. It returns a `Promise` which resolves
   * as soon as request is written to the wire. It differs from `request`
   * in that the remote method's response is ignored, analogous to emitting event.
   *
   * @param method remote method to be invoked
   * @param args args array for the remote method
   */
  public notify = async (method: string, ...args: any[]) => {
    const msg: SimpleRpc.Notify = [2, method, args]
    debugLog(msg)
    this.io.send(msg)
  }

  public close = (...args: any[]) => {
    this.io.close(...args)
  }
}

function debugLog(args: any[]) {
  if (!debug.enabled) return

  switch (args[0]) {
    case REQUEST:
      return debug('REQUEST', args[1], args[2], ...format(args[3]))
    case RESPONSE:
      return debug('RESPONSE', args[1], format(args[2]), format(args[3]))
    case NOTIFY:
      return debug('NOTIFY', args[1], ...format(args[2]))
  }
}

function format(arg: any) {
  if (Array.isArray(arg)) return arg.map(format)
  if (isBuffer(arg)) return `<Buffer:${arg.length}>`

  if (typeof arg === 'object') {
    const out = {}
    for (const key in arg) out[key] = format(arg[key])
    return out
  }

  return arg
}

function isBuffer(obj) {
  return (
    obj != null &&
    obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' &&
    obj.constructor.isBuffer(obj)
  )
}

export namespace SimpleRpc {
  export type Request = [0, number, string, any[]]
  export type Response = [1, number, any, any]
  export type Notify = [2, string, any[]]

  export type Packet = Request | Response | Notify

  export type MsgHandler = (packet: Packet) => Promise<void>

  export interface Transport {
    setMsgHandler: (msgHandler?: MsgHandler) => void
    send: (packet: Packet) => Promise<void>
    close: (...args: any[]) => void
    connected: boolean
  }
  export type Method = (...args: any[]) => Promise<any>

  export type Service<K> = { [field in keyof K]: any }
}
