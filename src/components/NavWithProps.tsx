import * as React from 'react'
import { Icon } from 'react-icons-kit'
import { longArrowLeft } from 'react-icons-kit/fa/longArrowLeft'
import { NavBarDiv, NavTitle, IconContainer } from './StyledComps'

export class NavWithProps extends React.Component<any, any> {
  public render() {
    let regex1 = /[\/]devices[\/][A-z0-9]*/gm
    let showNavBar = regex1.test(this.props.history.location.pathname)
    return (
      <NavBarDiv>
        {showNavBar && (
          <IconContainer onClick={this.props.history.goBack}>
            <Icon size={'30'} icon={longArrowLeft} />
          </IconContainer>
        )}
        <NavTitle>Admin Panel</NavTitle>
      </NavBarDiv>
    )
  }
}
