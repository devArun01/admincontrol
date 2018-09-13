import * as React from 'react'
import VirtualList from 'react-tiny-virtual-list'
import { IO } from '../IO'
import { Log } from '../../../packages/types'

export class Logs extends React.Component<any, any> {
  state = {
    data: [],
  }

  constructor(props: any) {
    super(props)
  }

  private i = 0

  componentDidMount() {
    IO.instance.on('LogEntry', this.activateRender)
  }

  componentWillUnmount() {
    IO.instance.off('LogEntry', this.activateRender)
  }

  activateRender = (log: string) => {
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
            margin: '1%',
            borderRadius: '5px',
            padding: '2% 1%',
            width: '98%',
            height: 'auto',
            wordWrap: 'break-word',
          }}
        >
          {this.state.data[index]}
        </p>
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
