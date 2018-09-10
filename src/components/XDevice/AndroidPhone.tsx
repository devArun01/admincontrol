import * as React from 'react'
import { AndroidPhoneDiv } from '../StyledComps'

type FrameInset = {
  left: number
  top: number
  right: number
  bottom: number
}

type MyProps = {
  children(frameInset: FrameInset)
}

const MyInsets = {
  left: 7,
  top: 30,
  right: 7,
  bottom: 50,
}

export class AndroidPhone extends React.PureComponent<MyProps> {
  render() {
    return (
      <AndroidPhoneDiv>
        <div className="holder">
          <div className="decor">
            <div className="ring hbtn" />
            <div className="volume hbtn" />
          </div>
          <div className="frame">
            <div className="glare" />
            <div className="topDecor">
              <div className="speaker" />
              <div className="camera" />
            </div>
            {this.props.children(MyInsets)}
          </div>
          <div className="decor">
            <div className="power hbtn" />
          </div>
        </div>
      </AndroidPhoneDiv>
    )
  }
}
