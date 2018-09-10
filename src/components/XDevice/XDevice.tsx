import Measure, { ContentRect } from 'react-measure'
import * as React from 'react'
import { Container } from '../StyledComps'
import { AndroidPhone } from './AndroidPhone'
import { XSurface } from './XSurface'

type Size = {
  width: number
  height: number
}

type XDeviceProps = {
  appUpload?: boolean
  appKind?: string
}
type XDeviceState = { container: Size }

export class XDevice extends React.Component<XDeviceProps, XDeviceState> {
  state = { container: { width: 0, height: 0 } }

  private onResize = ({ bounds: container }: ContentRect) => {
    this.setState({ container })
  }

  render() {
    const { container } = this.state
    const { appUpload, appKind } = this.props

    return (
      <Measure bounds onResize={this.onResize}>
        {({ measureRef }) => (
          <Container innerRef={measureRef}>
            <AndroidPhone>
              {inset => (
                <XSurface {...{ inset, container, appUpload, appKind }} />
              )}
            </AndroidPhone>
          </Container>
        )}
      </Measure>
    )
  }
}
