import * as React from 'react'
import { IO } from '../../../../IO'
import { ScaledCanvas } from '../ScaledCanvas'
import { LayerDiv } from '../../../StyledComps'
import { ScreenFrame } from '../../../../../../packages/types'

type Size = {
  width: number
  height: number
}

type IOScreenFrame = Pick<ScreenFrame, 'x' | 'y' | 'w' | 'h'> & {
  img: HTMLImageElement
}

type MyProps = {
  imgSize: Size
  setImgSize(imgSize: Size)
  setScaledSize(scaledSize: Size)
}

const BLANK_IMG =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

/**
 * DisplayLayer is the core component in XDevice. It contains canvas on
 * which remote jpeg is drawn. It updates AspectRatio of the parent if and
 * when dimensions of jpeg image changes.
 *
 *
 */
export class DisplayLayer extends React.Component<MyProps> {
  private pendingFrame: number
  private ctx: CanvasRenderingContext2D

  componentDidMount() {
    IO.instance.on('clearScreen', this.clearScreen)
    IO.instance.on('onScreenFrame', this.draw)
  }

  componentDidCatch(error, info) {
    console.log(error, info)
  }

  shouldComponentUpdate(nextProps: MyProps) {
    const { width, height } = this.props.imgSize
    const { width: nextWidth, height: nextHeight } = nextProps.imgSize
    return width !== nextWidth || height !== nextHeight
  }

  componentWillUnmount() {
    IO.instance.off('clearScreen', this.clearScreen)
    IO.instance.off('onScreenFrame', this.draw)
    window.cancelAnimationFrame(this.pendingFrame)
  }

  private clearScreen = () => {
    const { width, height } = this.props.imgSize
    if (this.ctx) this.ctx.clearRect(0, 0, width, height)
  }

  private setRef = (ref: HTMLCanvasElement) => {
    if (!ref) this.ctx = null
    else this.ctx = ref.getContext('2d')
  }

  private draw = (frame: IOScreenFrame) => {
    if (this.pendingFrame) window.cancelAnimationFrame(this.pendingFrame)

    this.pendingFrame = window.requestAnimationFrame(() => {
      const { x, y, img } = frame
      const { width, height } = img
      const { imgSize } = this.props

      if (width !== imgSize.width || height !== imgSize.height) {
        const size: Size = { width, height }
        this.setState(size)
        this.props.setImgSize({ width, height })
      }

      this.ctx && this.ctx.drawImage(img, x, y)
    })
  }

  render() {
    console.log('renderCanvas')

    const props = {
      imgSize: this.props.imgSize,
      setScaledSize: this.props.setScaledSize,
      setRef: this.setRef,
    }

    return (
      <LayerDiv>
        <ScaledCanvas {...props} />
      </LayerDiv>
    )
  }
}
