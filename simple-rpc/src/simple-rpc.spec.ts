import * as msgpack from 'msgpack-lite'
import * as Debug from 'debug'

import { SimpleRpc, INTERNAL_ERROR } from './simple-rpc'

const error = {
  name: 'UNKNOWN',
  desc: 'Unhandled exception',
}

const dummyTransport: SimpleRpc.Transport = {
  connected: false,
  setMsgHandler(msgHandler?: SimpleRpc.MsgHandler) {},
  async send(packet: SimpleRpc.Packet) {},
  close(...args: any[]) {},
}

describe('Standalone', () => {
  describe('Initialization', () => {
    test('With correct args', () => {
      const rpc = new SimpleRpc(dummyTransport, {})
      expect(rpc).toBeInstanceOf(SimpleRpc)
    })

    test('Throws on unknown remote method', async () => {
      const mockSend = jest.fn()
      const io: SimpleRpc.Transport = {
        ...dummyTransport,
        setMsgHandler(handleMessage?: SimpleRpc.MsgHandler) {},
        async send(packet: SimpleRpc.Packet) {
          const [typ, id, err, resp] = packet as SimpleRpc.Response
          mockSend(err)
        },
      }

      const logErr = jest.fn()
      const rpc = new SimpleRpc(io, {}, logErr)
      const incomming: SimpleRpc.Request = [0, 0, 'unknownFn', []]
      await rpc['handleMessage'](incomming)
      await expect(mockSend).toBeCalledWith({ code: 'NO_METHOD' })
      expect(logErr).toBeCalled()
    })

    test('Exception to be thrown for unhandled error', async () => {
      const mockSend = jest.fn()
      const err = new Error('Some Unhandled error')
      const willThrow = () => {
        throw err
      }
      const io: SimpleRpc.Transport = {
        ...dummyTransport,
        async send(packet: SimpleRpc.Packet) {
          const [typ, id, err, resp] = packet as SimpleRpc.Response
          mockSend(err)
        },
      }

      const rpc = new SimpleRpc(io, { willThrow })
      const incomming: SimpleRpc.Request = [0, 0, 'willThrow', []]

      await expect(rpc['handleMessage'](incomming)).rejects.toMatchObject(err)
      await expect(mockSend).toBeCalledWith(INTERNAL_ERROR)
    })

    test('.notify to return Promise', () => {
      const rpc = new SimpleRpc(dummyTransport, {})
      return expect(rpc.notify('notifyfn')).toBeInstanceOf(Promise)
    })

    test('.request to return Promise', () => {
      const rpc = new SimpleRpc(dummyTransport, {})

      return expect(rpc.request('clientReqFn')).toBeInstanceOf(Promise)
    })
  })

  describe('Encode/Decode', () => {
    test('Notify', async () => {
      const mockSend = jest.fn()
      const io: SimpleRpc.Transport = {
        ...dummyTransport,
        send: async packet => mockSend(packet),
      }
      const rpc = new SimpleRpc(io, {})
      await rpc.notify('notifyFn', 10, 20)

      return expect(mockSend).toHaveBeenCalledWith([2, 'notifyFn', [10, 20]])
    })

    test('Request', async () => {
      const mockSend = jest.fn()
      const io: SimpleRpc.Transport = {
        ...dummyTransport,
        send: async packet => mockSend(packet),
      }
      const rpc = new SimpleRpc(io, {})
      rpc.request('clientReqFn', 10, 20)
      return expect(mockSend).toHaveBeenCalledWith([0, 0, 'clientReqFn', [10, 20]])
    })
  })

  describe('As client/server', () => {})

  describe('Silent logging', () => {})

  describe('Id generator', () => {
    test('id should start at 0', () => {
      const rpc = new SimpleRpc(dummyTransport, {})
      expect(rpc['nextId']()).toBe(0)
    })

    test('Wrap id to Zero after MAX_ID', () => {
      const MAX_ID = Math.pow(2, 31) - 1
      const rpc = new SimpleRpc(dummyTransport, {})
      rpc['msgId'] = MAX_ID
      expect(rpc['nextId']()).toBe(0)
    })
  })
})

describe('req/resp', () => {
  test('echo', async () => {
    let serverHandlerFn: SimpleRpc.MsgHandler | undefined
    const serverTransport = {
      ...dummyTransport,
      setMsgHandler(msgHandler?: SimpleRpc.MsgHandler) {
        serverHandlerFn = msgHandler
      },
      async send(packet: SimpleRpc.Packet) {
        clientHandlerFn!(packet)
      },
    }

    let clientHandlerFn: SimpleRpc.MsgHandler | undefined
    const clientTransport = {
      ...dummyTransport,
      setMsgHandler(msgHandler?: SimpleRpc.MsgHandler) {
        clientHandlerFn = msgHandler
      },
      async send(packet: SimpleRpc.Packet) {
        serverHandlerFn!(packet)
      },
    }

    const serverRPC = new SimpleRpc(serverTransport, {
      echo: async msg => msg,
    })

    const clientRPC = new SimpleRpc(clientTransport, {})

    const result = await clientRPC.request('echo', 'hello')

    expect(result).toEqual('hello')
  })
})

process.on('unhandledRejection', err => {
  console.error(err)
})
