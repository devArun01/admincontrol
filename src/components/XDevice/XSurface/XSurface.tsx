import * as React from 'react'
import { DisplayLayer } from './layers/DisplayLayer'
import { XSurfaceDiv, IconBackdrop } from '../../StyledComps'

const MAX_WIDTH = 550
const MAX_HEIGHT = 550

type Size = {
  width: number
  height: number
}

type FrameInset = {
  left: number
  top: number
  right: number
  bottom: number
}

export namespace XSurface {
  export type Props = {
    inset: FrameInset
    container: Size
    appUpload?: boolean
    appKind?: string
  }

  export type State = {
    ar: number
    imgSize: Size
    scaledSize: Size
  }
}

export class XSurface extends React.Component<XSurface.Props, XSurface.State> {
  state = {
    ar: 750 / 1334,
    imgSize: { width: 0, height: 0 },
    scaledSize: { width: 0, height: 0 },
  }

  private setImgSize = (imgSize: Size) => {
    const ar = imgSize.width / imgSize.height
    this.setState({ ar, imgSize })
  }

  private setScaledSize = (scaledSize: Size) => {
    this.setState({ scaledSize })
  }

  render() {
    const { setImgSize, setScaledSize } = this
    const { ar, imgSize, scaledSize } = this.state
    const { inset, container, appKind } = this.props

    const hSpace = inset.left + inset.right
    const vSpace = inset.top + inset.bottom

    const maxW = container.width - hSpace
    const maxH = container.height - vSpace

    let width = Math.min(MAX_WIDTH, maxW)
    let height = Math.round(width / ar)

    if (height > maxH) {
      height = Math.min(MAX_HEIGHT, maxH)
      width = Math.round(height * ar)
    }

    const size = { width, height }

    let displayLayer = (
      <DisplayLayer {...{ imgSize, setImgSize, setScaledSize }} />
    )

    return <XSurfaceDiv style={size}>{displayLayer}</XSurfaceDiv>
  }
}
