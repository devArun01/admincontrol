import * as React from 'react'
import { IO } from '../IO'
import { Table, Switch } from 'antd'
import { RouteComponentProps } from 'react-router'
import { DeviceData } from './Main'
import { ListArea } from './StyledComps'
import {
  DeviceType,
  Arch,
  FormFactor,
  IAdmin,
  IApp,
} from '../../../packages/types'

class DeviceTable extends Table<DeviceData> {}

type MyProps = RouteComponentProps<{}> & {
  devices: DeviceData[]
  setDevices(devices: DeviceData[])
}

type MyState = {
  changesMade: boolean
}

export class DevicesList extends React.Component<MyProps, MyState> {
  constructor(props: any) {
    super(props)

    this.state = {
      changesMade: false,
    }
  }

  componentDidMount() {
    IO.init('ws://localhost:3030/admin')
    IO.instance.ioReady().then(() => {
      IO.instance.getAllDevices().then(this.props.setDevices)
    })
    IO.instance.on('appLaunch', this.onAppLaunch)
    IO.instance.on('statusChange', this.onStatus)
  }

  componentWillUnmount() {
    IO.instance.off('appLaunch', this.onAppLaunch)
    IO.instance.off('statusChange', this.onStatus)
  }

  onAppLaunch = (appInfo: IApp.ConnProps) => {
    console.log('changeStatus to ' + Object.values(appInfo))
    IO.instance.ioReady().then(() => {
      IO.instance.getAllDevices().then(this.props.setDevices)
    })
  }

  onStatus = (status: IAdmin.DeviceStatus) => {
    console.log('update: ' + IAdmin.DeviceStatus[status])
    IO.instance.ioReady().then(() => {
      IO.instance.getAllDevices().then(this.props.setDevices)
    })
  }

  private columns = [
    {
      key: 'DeviceName',
      title: 'Id',
      dataIndex: 'id',
      render: param => {
        return (
          <a
            style={{ left: 0 }}
            onClick={() => {
              IO.instance.useDevice(param)
              this.props.history.push(`/devices/${param}`)
            }}
          >
            {param}
          </a>
        )
      },
    },
    {
      key: 'DeviceType',
      title: 'Kind',
      dataIndex: 'type',
      render: param => {
        return <div>{DeviceType[param]}</div>
      },
    },
    {
      key: 'FormFactor',
      title: 'FormFactor',
      dataIndex: 'formFactor',
      render: param => {
        return <div>{FormFactor[param]}</div>
      },
    },
    {
      key: 'Architecture',
      title: 'Arch',
      dataIndex: 'arch',
      render: param => {
        return <div>{Arch[param]}</div>
      },
    },
    {
      key: 'HostName',
      title: 'Host',
      dataIndex: 'hostname',
    },
    {
      key: 'InUse',
      title: 'InUse',
      dataIndex: 'inUse',
      render: param => {
        return (
          <div>
            {param && 'Yes'}
            {!param && 'No'}
          </div>
        )
      },
    },
    {
      key: 'Status',
      title: 'Status',
      dataIndex: 'status',
      render: param => {
        return <div>{IAdmin.DeviceStatus[param]}</div>
      },
    },
    {
      key: 'Enable',
      title: 'Enable/Disable',
      render: param => {
        return (
          <div style={{ paddingLeft: '30%' }}>
            <Switch
              size={'small'}
              disabled={param.status === 4 ? true : false}
              defaultChecked={
                param.status === 0 ||
                param.status === 1 ||
                param.status === 2 ||
                param.status === 3
                  ? true
                  : false
              }
              onChange={async () => {
                IO.instance.disableDevice(param.id).then(() => {
                  this.setState({ changesMade: true }, () => {
                    IO.instance.getAllDevices().then(this.props.setDevices)
                  })
                })
              }}
            />
          </div>
        )
      },
    },
  ]

  public render() {
    return (
      <ListArea>
        <DeviceTable
          columns={this.columns}
          pagination={false}
          dataSource={this.props.devices}
          rowKey={record => record.id}
          size={'middle'}
        />
      </ListArea>
    )
  }
}
