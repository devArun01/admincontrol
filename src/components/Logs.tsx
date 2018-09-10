import * as React from 'react'
import VirtualList from 'react-tiny-virtual-list'
import { IO } from '../IO'
import { Log } from '../../../packages/types'

const dataArray = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
]

export class Logs extends React.Component<any, any> {
  state = {
    data: [],
  }

  constructor(props: any) {
    super(props)
  }

  private i = 0

  componentDidMount() {
    IO.instance.on('onLogEntry', this.activateRender)
    if (IO.instance.getLogData) this.activateRender(IO.instance.getLogData)
  }

  componentWillUnmount() {
    IO.instance.off('onLog', this.activateRender)
  }

  activateRender = (log: string) => {
    console.log('[activateRender]')
    this.setState({ data: [...this.state.data, log] }, () => {
      document
        .getElementById(`logCount${this.i - 1}`)
        .scrollIntoView({ behavior: 'smooth' })
    })
  }

  private renderItem = ({ index }) => {
    this.i++
    return (
      <div key={index}>
        <p
          id={`logCount${this.i - 1}`}
          style={{
            backgroundColor: '#f5f5f5',
            margin: '2%',
            borderRadius: '50px',
            padding: '1% 2%',
            display: 'inline-block',
          }}
        >
          {this.state.data[index]}
        </p>
        <br />
      </div>
    )
  }

  render() {
    return (
      <VirtualList
        width="100%"
        height="100%"
        overscanCount={this.state.data.length}
        itemCount={this.state.data.length}
        itemSize={50} // Also supports variable heights (array or function getter)
        renderItem={this.renderItem}
      />
    )
  }
}
