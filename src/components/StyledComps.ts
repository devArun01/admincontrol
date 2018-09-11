import styled from 'styled-components'

export const ListArea = styled.div`
  position: absolute;
  min-width: 500px;
  width: 96vw;
  top: 0px;
  left: 0;
  margin: 10vh 2vw 0vh 2vw;
`
export const NavBarDiv = styled.div`
  min-width: 400px;
  width: 100%;
  color: white;
  position: absolute;
  margin: 0;
  left: 0;
  top: 0;
  height: 8vh;
  display: flex;
  justify-content: center;
  align-items: center;
`
export const IconContainer = styled.a`
  text-decoration: none;
  position: absolute;
  z-index: 3;
  top: 0;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  left: 20px;
  color: black;
`

export const NavTitle = styled.h2`
  margin: 1% 0%;
  color: black;
  font-size: 24px;
  font-family: 'Roboto', sans-serif;
`
export const LRContainer = styled.div`
  display: flex;
`

export const LeftContainer = styled.div`
  position: relative;
  top: 8vh;
  min-height: 500px;
  min-width: 500px;
  height: 90vh;
  width: 58vw;
  margin: 0 1vw;
  font-size: 12px;
  color: black;
  background-color: #f3fafa;
`

export const DeviceTable1 = styled.table`
  position: absolute;
  width: 30%;
  left: 20%;
  top: 0;
  margin: 3.5vh 0;
  height: 18vh;
`

export const DeviceTable2 = styled.table`
  position: absolute;
  width: 50%;
  left: 50%;
  top: 0;
  margin: 2vh 0;
  height: 21vh;
`
export const DTableData1 = styled.td`
  width: 30%;
  vertical-align: top;
  padding: 0 1%;
`
export const DTableData2 = styled.td`
  width: 50%;
  vertical-align: top;
  padding: 0 1%;
`

export const RightContainer = styled.div`
  position: relative;
  top: 8vh;
  min-height: 500px;
  min-width: 450px;
  height: 90vh;
  width: 39vw;
  margin: 0;
  background-color: #f5f5f5;
`
export const DeviceLogs = styled.div`
  position: absolute;
  top: 23vh;
  left: 0%;
  height: 65vh;
  width: 98%;
  margin: 0 1%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  background-color: white;
`
export const DeviceArea = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
`
export const DeviceIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 21vh;
  width: 20%;
  margin: 1vh 0;
`

export const Container = styled.div`
  min-width: 400px;
  min-height: 400px;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`
export const AndroidPhoneDiv = styled.div`
  padding: 0 7px 10px;

  .holder {
    position: relative;
    z-index: 1;
    display: flex;
    transition: all 0.2s ease-in;
  }

  .hbtn {
    position: absolute;
    width: 100%;
    background-color: #111;
    border-radius: 2px 0 0 2px;
    z-index: -2;
    box-shadow: 0 5px 10px rgba(31, 31, 31, 0.4), 0 0 0 1px #5f5f5f;
  }

  .decor {
    position: relative;
    flex: 0 0 3px;
  }

  .ring.hbtn {
    top: 14%;
    height: 4%;
  }

  .volume.hbtn {
    top: 24%;
    height: 12%;
  }

  .power.hbtn {
    top: 14%;
    height: 6%;
    border-radius: 0 2px 2px 0;
    background-color: #111;
  }

  .topDecor {
    position: absolute;
    left: 0;
    right: 0;
    width: 120px;
    height: 10px;
    top: 1.2%;
    margin: auto;
  }

  .topDecor .speaker {
    position: absolute;
    left: 0;
    right: 0;
    top: 2px;
    height: 8px;
    width: 80px;
    margin: auto;
    background-color: #111;
    border-radius: 4px;
    border: 1px solid #313131;
  }

  .topDecor .camera {
    position: absolute;
    left: 0;
    right: 0;
    top: 1px;
    height: 10px;
    width: 10px;
    margin: auto;
    margin-left: 120px;
    background-color: #007575;
    border-radius: 6px;
    border: 1px solid #000;
  }

  .frame {
    position: relative;
    /* flex: 1 1 auto; */
    border-radius: 30px 30px 20px 20px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.2);
    background-color: #111;
    padding: 30px 4px 20px;
    z-index: -1;
    height: 100%;
    width: 100%;
  }

  .glare {
    overflow: hidden;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: 30px 30px 20px 20px;

    &:before {
      content: '';
      position: absolute;
      width: 100%;
      height: 115%;
      top: -20%;
      left: -60%;
      background: linear-gradient(
        to right bottom,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.1)
      );
      transform: rotate(20deg);
    }
  }

  .display {
    position: relative;
    z-index: 1;
    display: block;
  }

  .display > * {
    position: relative;
    border-radius: 6px;
    display: block;
    width: 100%;
    height: auto;
    overflow: hidden;
    box-shadow: 0 0 0 1px hsl(0, 0%, 0%);
  }
`
export const LayerDiv = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
`
LayerDiv.displayName = 'LayerDiv'

export const XSurfaceDiv = styled.div`
  background-color: #000;
  position: relative;
  /* flex: 1; */
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  width: 100%;
`

export const IconBackdrop = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`
