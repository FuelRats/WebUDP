import WebUDPWrapper from './webudp'
import { RTCPeerConnection, RTCSessionDescription } from 'wrtc'

/*
  The return value of `DataConnectionWrapper` is a `DataConnection` class with
  the `RTCPeerConnection` and `RTCSessionDescription` that are passed into the
  function.
*/

export default WebUDPWrapper({ RTCPeerConnection, RTCSessionDescription })
