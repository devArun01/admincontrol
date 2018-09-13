import { Icon } from 'react-icons-kit'
import * as React from 'react'
import { android } from 'react-icons-kit/fa/android'
import { apple } from 'react-icons-kit/fa/apple'
import { RouteComponentProps } from 'react-router'
import { DeviceData } from './Main'
import { XDevice } from '../components/XDevice'
import { Logs } from './Logs'
import {
  LeftContainer,
  RightContainer,
  DeviceLogs,
  DeviceArea,
  DeviceTable1,
  DeviceTable2,
  DTableData1,
  DTableData2,
  DeviceIconContainer,
  LRContainer,
} from './StyledComps'
import { DeviceType, Arch, FormFactor, IAdmin } from '../../../packages/types'
import { Switch } from 'antd'
import { IO } from './../IO'

type MyProps = RouteComponentProps<{ id: string }> & {
  getDevice(id: string): DeviceData
  setDevices(devices: DeviceData[])
}

type MyState = {
  activeDevice?: DeviceData
  disableButton?: boolean
  changesMade?: boolean
}

export class DeviceDetails extends React.Component<MyProps, MyState> {
  state = {
    activeDevice: void 0,
    disableButton: false,
    changesMade: true,
  }

  constructor(props: any) {
    super(props)
  }

  componentDidMount() {
    const { id } = this.props.match.params
    const activeDevice = this.props.getDevice(id)
    this.setState({ activeDevice })
    IO.instance.on('statusChange', this.changeStatus)
    IO.instance.on('appLaunch', this.changeStatus)
  }

  componentWillUnmount() {
    IO.instance.off('appLaunch', this.changeStatus)
    IO.instance.off('statusChange', this.changeStatus)
  }

  changeStatus = (status: any) => {
    console.log('changeStatus to ' + status['apiKey'])
    IO.instance.ioReady().then(() => {
      IO.instance.getAllDevices().then(this.props.setDevices)
    })
  }

  public render() {
    if (!this.state.activeDevice) return null
    const activeDevice = this.props.getDevice(this.props.match.params.id)
    const { id, type, formFactor, arch, hostname, inUse, status } = activeDevice
    console.log('rendering details with status: ' + IAdmin.DeviceStatus[status])
    return (
      <React.Fragment>
        <LRContainer>
          <LeftContainer>
            <DeviceIconContainer>
              {(type === 1 || type === 2) && <Icon size={60} icon={apple} />}
              {(type === 3 || type === 4) && <Icon size={60} icon={android} />}
            </DeviceIconContainer>
            <DeviceTable2>
              <tbody>
                <tr>
                  <DTableData1>
                    <b>In Use :</b> {inUse && 'Yes'}
                    {!inUse && 'No'}
                  </DTableData1>
                  <DTableData2>
                    <b>Device Kind : </b>
                    {DeviceType[type]}
                  </DTableData2>
                </tr>
                <tr>
                  <DTableData1>
                    <b>Arch : </b>
                    {Arch[arch]}
                  </DTableData1>
                  <DTableData2>
                    <b>Status :</b> {IAdmin.DeviceStatus[status]}
                  </DTableData2>
                </tr>
                <tr>
                  <DTableData1>
                    <b>Form Factor : </b>
                    {FormFactor[formFactor]}
                  </DTableData1>
                  <DTableData2>
                    <b>Host Name :</b> {hostname}
                  </DTableData2>
                </tr>
                <tr>
                  <DTableData1>
                    <b>Enable/Disable : </b>
                    <Switch
                      size={'small'}
                      disabled={status === 4 ? true : false}
                      defaultChecked={
                        status === 0 ||
                        status === 1 ||
                        status === 2 ||
                        status === 3
                          ? true
                          : false
                      }
                      onChange={async () => {
                        console.log(id)
                        IO.instance.disableDevice(id).then(() => {
                          this.setState({ disableButton: true }, () => {
                            IO.instance
                              .getAllDevices()
                              .then(this.props.setDevices)
                          })
                        })
                      }}
                    />
                  </DTableData1>
                  <DTableData2>
                    <b>Device ID :</b> {id}
                  </DTableData2>
                </tr>
              </tbody>
            </DeviceTable2>
            <DeviceLogs>
              <Logs />
            </DeviceLogs>
          </LeftContainer>
          <RightContainer>
            <DeviceArea>
              <XDevice />
            </DeviceArea>
          </RightContainer>
        </LRContainer>
      </React.Fragment>
    )
  }
}
