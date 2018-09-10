import * as React from 'react'
import { Route } from 'react-router-dom'
import { NavWithProps } from './NavWithProps'

export class NavBar extends React.Component<any, any> {
  render() {
    return (
      <Route
        children={({ history }) => {
          const props: any = {
            history,
          }
          return <NavWithProps {...props} />
        }}
      />
    )
  }
}

// {/* <div className="NavBarDiv">
// <h2 className="NavTitle">Admin Panel</h2>
// </div> */}
