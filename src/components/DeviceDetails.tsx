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
  PhoneKindLogo,
  DeviceDataContainer,
  BottomContainer,
  DeviceLogs,
  DeviceArea,
  DeviceTable,
  DTableHead,
  DTableHeader,
  DTableData,
} from './StyledComps'
import { DeviceType, Arch, FormFactor, IAdmin } from '../../../packages/types'

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
          <PhoneKindLogo>
            {(type === 1 || type === 2) && <Icon size={'35%'} icon={apple} />}
            {(type === 3 || type === 4) && <Icon size={'35%'} icon={android} />}
          </PhoneKindLogo>
          <DeviceDataContainer>
            <DeviceTable>
              <DTableHead>
                <tr>
                  <DTableHeader colSpan={2}>
                    <h3>Device Details</h3>
                  </DTableHeader>
                </tr>
              </DTableHead>
              <tbody>
                <tr>
                  <DTableData>Device ID : {id}</DTableData>
                  <DTableData>Device Kind : {DeviceType[type]}</DTableData>
                </tr>
                <tr>
                  <DTableData>
                    Form Factor : {FormFactor[formFactor]}
                  </DTableData>
                  <DTableData>Arch : {Arch[arch]}</DTableData>
                </tr>
                <tr>
                  <DTableData>Host Name : {hostname}</DTableData>
                  <DTableData>
                    In Use :{' '}
                    {(inUse && 'Yes(inUse)') || (!inUse && 'No(inUse)')}
                  </DTableData>
                </tr>
                <tr>
                  <DTableData>
                    Status : {IAdmin.DeviceStatus[status]}
                  </DTableData>
                </tr>
              </tbody>
            </DeviceTable>
          </DeviceDataContainer>
        </TopContainer>
        <BottomContainer>
          <DeviceLogs>
            <Logs />
          </DeviceLogs>
          <DeviceArea>
            <XDevice />
          </DeviceArea>
        </BottomContainer>
      </React.Fragment>
    )
  }
}
