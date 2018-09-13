import { WSRetryTransport } from '../simple-rpc/src/ws-transport'
import { SimpleRpc } from '../simple-rpc/src/simple-rpc'
import { IAdmin, IApp, Log, ScreenFrame } from '../../packages/types'
import * as Debug from 'debug'
const debug = Debug('IO')

type EventHandler = (...args: any[]) => void
type IOScreenFrame = Pick<ScreenFrame, 'x' | 'y' | 'w' | 'h'> & {
  img: HTMLImageElement
}

export class IO {
  private static _instance: IO

  private ws: WSRetryTransport
  public rpc: SimpleRpc<IAdmin.Client>
  private isOpen = false
  private openResolver?: () => void
  private listeners: { [k: string]: EventHandler[] } = Object.create(null)

  public static init(url: string) {
    if (!this._instance) this._instance = new IO(url)
    if (debug) window['IO'] = IO
    return this._instance
  }

  static get instance() {
    if (!this._instance) throw new Error('IO instance is not initialized')
    return this._instance
  }

  private constructor(url: string) {
    this.ws = new WSRetryTransport(url, {
      retryInterval: 50,
      onOpen: () => {
        this.isOpen = true
        this.openResolver && this.openResolver()
        delete this.openResolver
        debug('onOpen')
      },
      onClose: e => {
        debug('onClose')
      },
      onReconnect: () => {
        debug('onReconnect')
      },
    })

    this.ws.open()

    this.rpc = new SimpleRpc(this.ws, {
      onLog: async (entry: Log.Entry) => {
        this.emit('LogEntry', entry['message'])
      },
      onApp: async (appInfo: IApp.ConnProps) => {
        console.log('[appInfo]' + appInfo)
        this.emit('appLaunch', appInfo)
      },
      onStatus: async (id: string, status: IAdmin.DeviceStatus) => {
        console.log('status: ' + status)
        this.emit('statusChange', status)
      },
      onScreenFrame: async (frame: ScreenFrame) => {
        const { x, y, w, h } = frame
        const blob = new Blob([frame.bytes], { type: 'image/jpeg' })
        const blobUrl = window.URL.createObjectURL(blob)

        const screenFrame = { x, y, w, h, img: new Image() }

        screenFrame.img.onload = () => {
          this.emit('onScreenFrame', screenFrame)
        }

        screenFrame.img.src = blobUrl
      },
    })
  }

  public async ioReady() {
    if (this.isOpen) return

    return new Promise((resolve, reject) => {
      this.openResolver = resolve
    })
  }

  public async getAllDevices() {
    const devices: any = await this.rpc.request('getAllDevices')
    console.log('getAllDevices: ' + devices[0]['id'])
    return devices
  }

  public async useDevice(id: any) {
    const deviceInfo: any = await this.rpc.request('useDevice', id)
    // console.log('[useDevice]: ' + deviceInfo)
    return deviceInfo
  }

  public async disableDevice(id: any) {
    const deviceToDisable: any = await this.rpc.request('diableDevice', id)
    return deviceToDisable
  }

  /**
   * on Registers an event handler for the given type.
   *
   * - if type is `"*"`, then listen to all events
   */
  public on = (type: string, handler: EventHandler) => {
    if (!this.listeners[type]) this.listeners[type] = []
    this.listeners[type].push(handler)
  }

  /**
   * off Removes listeners
   *
   * - with no args, it resets all listeners for all types
   * - with no handler, it resets all listeners for given type
   * - otherwise removes that one specific handler
   */
  public off = (type?: string, handler?: EventHandler) => {
    if (!type) this.listeners = Object.create(null)
    else if (!handler) delete this.listeners[type]
    else if (this.listeners[type]) {
      const idx = this.listeners[type].indexOf(handler)
      if (idx !== -1) this.listeners[type].splice(idx, 1)
    }
  }

  /**
   * emit Invokes all handlers for the given type.
   * If present, `"*"` handlers are invoked after type-matched handlers.
   */
  public emit = (type: string, ...args: any[]) => {
    if (this.listeners[type]) for (const fn of this.listeners[type]) fn(...args)
    if (this.listeners['*'])
      for (const fn of this.listeners['*']) fn(type, ...args)
  }
}
