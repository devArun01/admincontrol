import * as React from 'react'
import { Icon } from 'react-icons-kit'
import { arrow_left } from 'react-icons-kit/ikons/arrow_left'
import { NavBarDiv, NavTitle, IconContainer } from './StyledComps'

export class NavWithProps extends React.Component<any, any> {
  public render() {
    let regex1 = /[\/]devices[\/][A-z0-9]*/gm
    let showNavBar = regex1.test(this.props.history.location.pathname)
    return (
      <NavBarDiv>
        {showNavBar && (
          <div>
            <IconContainer onClick={this.props.history.goBack}>
              <Icon size={'20'} icon={arrow_left} />
              BACK
            </IconContainer>
            <NavTitle>Device Details</NavTitle>
          </div>
        )}
        {!showNavBar && <NavTitle>Admin Panel</NavTitle>}
      </NavBarDiv>
    )
  }
}
