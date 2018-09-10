import * as net from 'net'
import { TCPTransport, SimpleRpc } from '@unfold/simple-rpc'
import * as msgpack from 'msgpack-lite'

describe('TCPTransport', () => {
  test('hello world', async () => {
    const echoServer = net.createServer(socket => {
      const io = new TCPTransport(socket, 'Server')
      const rpc = new SimpleRpc(io, {
        echo: async arg => arg,
      })
    })

    await new Promise(resolve => echoServer.listen(1983, resolve))

    const msg = 1
    const socket = await connectClient(1983)
    const rpc = new SimpleRpc(new TCPTransport(socket, 'Client'), {})
    const result = await rpc.request('echo', msg)
    rpc.close()

    expect(result).toBe(msg)

    await new Promise(resolve => echoServer.close(resolve))
  })
})

function connectClient(port: number) {
  return new Promise<net.Socket>((resolve, reject) => {
    const socket = net.createConnection({ port }, () => {
      // console.log('Client Connected')
      resolve(socket)
    })

    socket.once('error', err => {
      throw err
    })
  })
}

describe('PlainSocket', () => {
  test('server says hello', async () => {
    const msg = [1, 3913, 'some method', { x: 100, y: 200 }]

    const server = net.createServer(socket => {
      const encodeStream = msgpack.createEncodeStream()
      encodeStream.pipe(socket)
      encodeStream.write(msg)
      encodeStream.end()
    })

    await new Promise(resolve => {
      server.listen(1987, resolve)
    })

    const client = await connectClient(1987)

    const stream = client.pipe(msgpack.createDecodeStream())

    const result = await new Promise((resolve, reject) => {
      stream.on('data', buf => {
        resolve(buf)
        client.destroy()
      })
      client.on('error', reject)
    })

    expect(result).toEqual(msg)

    await new Promise(resolve => {
      server.close(resolve)
    })
  })

  test('echo', async () => {
    const input = 'whatever'

    const server = net.createServer(socket => {
      socket.pipe(msgpack.createDecodeStream()).on('data', msg => writeMsg(msg, socket))
    })

    const writeMsg = (msg, socket) => {
      const encodeStream = msgpack.createEncodeStream()
      encodeStream.pipe(socket)
      encodeStream.write(msg)
      encodeStream.end()
    }

    await new Promise(resolve => {
      server.listen(1987, resolve)
    })

    const client = await connectClient(1987)

    const stream = client.pipe(msgpack.createDecodeStream())

    writeMsg(input, client)

    const result = await new Promise((resolve, reject) => {
      stream.on('data', buf => {
        resolve(buf)
        client.destroy()
      })
      client.on('error', reject)
    })

    expect(result).toEqual(input)

    await new Promise(resolve => {
      server.close(resolve)
    })
  })
})
