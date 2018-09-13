import * as React from 'react'
import { Switch, Route } from 'react-router-dom'
import { DevicesList } from './DevicesList'
import { DeviceDetails } from './DeviceDetails'
import { DeviceType, Arch, FormFactor } from '../../../packages/types'

export type DeviceData = {
  id: string
  type: DeviceType
  formFactor: FormFactor
  arch: Arch
  hostname: string
  inUse: boolean
  status: number
}

type MyState = {
  devices: DeviceData[]
  activeDevice?: DeviceData
}

export class Main extends React.Component<{}, MyState> {
  state = {
    devices: [] as DeviceData[],
    activeDevice: void 0,
  }

  setActiveDevice = (activeDevice: DeviceData) => {
    this.setState({ activeDevice })
  }

  setDevices = (devices: DeviceData[]) => {
    this.setState({ devices })
  }

  getDevice = (id: string) => {
    return this.state.devices.filter(d => d.id === id)[0]
  }

  render() {
    const { devices } = this.state
    return (
      <Switch>
        <Route
          exact
          path="/"
          render={props => (
            <DevicesList
              {...props}
              devices={devices}
              setDevices={this.setDevices}
            />
          )}
        />
        <Route
          exact
          path="/devices/:id"
          render={props => (
            <DeviceDetails
              {...props}
              getDevice={this.getDevice}
              setDevices={this.setDevices}
            />
          )}
        />
      </Switch>
    )
  }
}
