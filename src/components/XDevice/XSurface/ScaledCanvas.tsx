import Measure, { ContentRect } from 'react-measure'
import * as React from 'react'

type Size = {
  width: number
  height: number
}

export namespace ScaledCanvas {
  export type Props = {
    imgSize: Size
    setScaledSize(scaledSize: Size)
    setRef(ref: HTMLCanvasElement)
  }
}

export class ScaledCanvas extends React.Component<ScaledCanvas.Props> {
  private measureRef = (ref: HTMLCanvasElement) => {
    console.warn('measureRef called too early')
  }

  shouldComponentUpdate(nextProps: ScaledCanvas.Props) {
    const { width, height } = this.props.imgSize
    const { width: nextWidth, height: nextHeight } = nextProps.imgSize
    return width !== nextWidth || height !== nextHeight
  }

  setRef = (ref: HTMLCanvasElement) => {
    this.measureRef(ref)
    this.props.setRef(ref)
  }

  onResize = ({ bounds: { width, height } }: ContentRect) => {
    this.props.setScaledSize({ height, width })
  }

  render() {
    const { width, height } = this.props.imgSize

    const canvasProps = {
      width,
      height,
      style: {
        width: '100%',
        height: '100%',
        display: 'block',
      },
    }

    return (
      <Measure bounds onResize={this.onResize}>
        {({ measureRef }) => {
          this.measureRef = measureRef
          console.log('Render ScaledCanvas')
          return <canvas {...canvasProps} ref={this.setRef} />
        }}
      </Measure>
    )
  }
}
