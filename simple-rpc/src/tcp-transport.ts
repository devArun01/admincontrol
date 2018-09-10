import { SimpleRpc } from './simple-rpc'
import * as Debug from 'debug'
import * as msgpack from 'msgpack-lite'
import * as net from 'net'

const debug = Debug('tcp-transport')

/**
 * TCPTransport uses msgpack stream communicate
 *
 * Msgpack itself prefixes type & length in its spec, so no
 * further frameing is rquired
 *
 * **Usage**
 * ```
 * const server = net.createServer(socket => {
 *   const tcpTransport = new TCPTransport(socket)
 *   socket.pipe(socket)
 * })
 *
 * server.listen()
 * ```
 */
export class TCPTransport implements SimpleRpc.Transport {
  private name: string
  private msgHandler?: SimpleRpc.MsgHandler
  private sock: net.Socket
  private encodeStream: msgpack.EncodeStream

  constructor(sock: net.Socket, name = 'socket') {
    this.name = name
    this.sock = sock

    this.encodeStream = msgpack.createEncodeStream()
    this.encodeStream.pipe(this.sock)

    const decodeStream = msgpack.createDecodeStream()
    this.sock.pipe(decodeStream).on('data', this.onMessage)
  }

  private onMessage = async (packet: SimpleRpc.Packet) => {
    // @ts-ignore
    // happens when rdp is restarted
    // TODO: Should we ignore? Investigate
    if (packet === -1) console.warn('Unexpected "-1" received on decodeStream.')

    if (!this.msgHandler) throw new Error('WS: Receiver not set')
    await this.msgHandler(packet)
  }

  setMsgHandler(msgHandler?: SimpleRpc.MsgHandler) {
    this.msgHandler = msgHandler
  }

  async send(packet: SimpleRpc.Packet) {
    debug(this.name, 'send', packet)
    this.encodeStream.pipe(this.sock)
    this.encodeStream.write(packet)
    // @ts-ignore
    // See https://github.com/kawanet/msgpack-lite/issues/80
    this.encodeStream._flush()
  }

  // @ts-ignore
  get connected(): boolean {
    throw new Error('Not Implemented')
  }

  close(...args: any[]) {
    this.sock.end()
  }
}

// First 2 bytes in socket denotes the size of header
// ie (2^16 - 1) = 65.535 kb is the max size supported
const HEADER_LEN = 2

/**
 * readSocketHeader reads & parses header from the socket.
 * We use length prefixed headers. HEADER_LEN is sequence of
 * bytes that stores the length of the header that follows it
 *
 * @param socket freshly opened socket
 */
export function readSocketHeader(socket: net.Socket) {
  return new Promise((resolve, reject) => {
    const endCB = () => reject(new Error('Socket closed before reading headers'))

    socket.once('error', reject)
    socket.once('end', endCB)

    const getHeader = () => {
      const hdrSize = socket.read(HEADER_LEN)

      if (hdrSize === null) return null

      const len = hdrSize.readUIntBE(0, 2)
      debug('header length: ', len)
      const bytes = socket.read(hdrSize)
      socket.removeListener('error', reject)
      socket.removeListener('end', endCB)
      return msgpack.decode(bytes)
    }

    if (socket.readable) {
      const header = getHeader()
      if (header !== null) return resolve(header)
    }

    socket.once('readable', () => resolve(getHeader()))
  })
}
