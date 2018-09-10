import * as React from 'react'
import 'antd/dist/antd.css'
import { Main } from './Main'
import { NavBar } from './NavBar'
import { BrowserRouter } from 'react-router-dom'

export class App extends React.Component<any, any> {
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <NavBar />
          <Main />
        </React.Fragment>
      </BrowserRouter>
    )
  }
}
