import { Icon } from 'react-icons-kit'
import * as React from 'react'
import { android } from 'react-icons-kit/fa/android'
import { apple } from 'react-icons-kit/fa/apple'
import { RouteComponentProps } from 'react-router'
import { DeviceData } from './Main'
import { XDevice } from '../components/XDevice'
import { Logs } from './Logs'
import {
  TopContainer,
  DeviceDataContainer,
  BottomContainer,
  DeviceLogs,
  DeviceArea,
  DeviceTable1,
  DeviceTable2,
  DTableData1,
  DTableData2,
  DeviceIconContainer,
} from './StyledComps'
import { DeviceType, Arch, FormFactor, IAdmin } from '../../../packages/types'
import { Switch } from 'antd'

type MyProps = RouteComponentProps<{ id: string }> & {
  getDevice(id: string): DeviceData
}

type MyState = {
  activeDevice?: DeviceData
}

export class DeviceDetails extends React.Component<MyProps, MyState> {
  state = {
    activeDevice: void 0,
  }

  constructor(props: any) {
    super(props)
  }

  componentDidMount() {
    const { id } = this.props.match.params
    const activeDevice = this.props.getDevice(id)
    this.setState({ activeDevice })
  }

  public render() {
    if (!this.state.activeDevice) return null

    const { activeDevice } = this.state
    const { id, type, formFactor, arch, hostname, inUse, status } = activeDevice

    return (
      <React.Fragment>
        <TopContainer>
          <DeviceDataContainer>
            <DeviceIconContainer>
              {(type === 1 || type === 2) && <Icon size={60} icon={apple} />}
              {(type === 3 || type === 4) && <Icon size={60} icon={android} />}
            </DeviceIconContainer>
            <DeviceTable1>
              <tr>
                <DTableData1>
                  <b>In Use :</b> &nbsp;&nbsp;<Switch checked={inUse} />
                </DTableData1>
              </tr>
              <tr>
                <DTableData1>
                  <b>Arch : </b>
                  {Arch[arch]}
                </DTableData1>
              </tr>
              <tr>
                <DTableData1>
                  <b>Form Factor : </b>
                  {FormFactor[formFactor]}
                </DTableData1>
              </tr>
            </DeviceTable1>
            <DeviceTable2>
              <tbody>
                <tr>
                  <DTableData2>
                    <b>Device Kind : </b>
                    {DeviceType[type]}
                  </DTableData2>
                </tr>
                <tr>
                  <DTableData2>
                    <b>Status :</b> {IAdmin.DeviceStatus[status]}
                  </DTableData2>
                </tr>
                <tr>
                  <DTableData2>
                    <b>Host Name :</b> {hostname}
                  </DTableData2>
                </tr>
                <tr>
                  <DTableData2>
                    <b>Device ID :</b> {id}
                  </DTableData2>
                </tr>
              </tbody>
            </DeviceTable2>
            <DeviceLogs>
              <Logs />
            </DeviceLogs>
          </DeviceDataContainer>
        </TopContainer>
        <BottomContainer>
          <DeviceArea>
            <XDevice />
          </DeviceArea>
        </BottomContainer>
      </React.Fragment>
    )
  }
}
