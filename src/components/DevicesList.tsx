import * as React from 'react'
import { IO } from '../IO'
import { Table, Switch } from 'antd'
import { RouteComponentProps } from 'react-router'
import { DeviceData } from './Main'
import { ListArea } from './StyledComps'
import { DeviceType, Arch, FormFactor, IAdmin } from '../../../packages/types'

class DeviceTable extends Table<DeviceData> {}

type MyProps = RouteComponentProps<{}> & {
  devices: DeviceData[]
  setDevices(devices: DeviceData[])
}

type MyState = {}

export class DevicesList extends React.Component<MyProps, MyState> {
  constructor(props: any) {
    super(props)
    IO.init('ws://localhost:3030/admin')
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
      render: param => (
        <div>
          <Switch
            checked={param}
            onChange={() => {
              param = !param
              alert(param)
            }}
            size={'small'}
          />
        </div>
      ),
    },
    {
      key: 'Status',
      title: 'Status',
      dataIndex: 'status',
      render: param => {
        return <div>{IAdmin.DeviceStatus[param]}</div>
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
