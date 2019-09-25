import WebUDPWrapper from './webudp'

const {
  RTCPeerConnection,
  RTCSessionDescription,
} = window

export default WebUDPWrapper({ RTCPeerConnection, RTCSessionDescription })

