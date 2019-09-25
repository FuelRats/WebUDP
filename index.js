
export default class UDPConnection {
  constructor  (options) {
    const configuration = {
      'iceServers': [
        { 'urls': options.stunServers }
      ]
    }

    this.onOfferCallback = options.onOffer
    this.onAnswerCallback = options.onAnswer
    this.onCandidateCallback = options.onCandidate

    this.peerConnection = new RTCPeerConnection(configuration)
    this.peerConnection.onicecandidate = this.onIceCandidate.bind(this)
    this.peerConnection.onicecandidateerror = this.onIceCandidateError.bind(this)
    this.peerConnection.onnegotiationneeded = this.onNegotiationNeeded.bind(this)
    this.peerConnection.oniceconnectionstatechange = this.onIceConnectionChange.bind(this)
    this.peerConnection.onicegatheringstatechange = this.onIceGatheringChange.bind(this)
    this.peerConnection.ondatachannel = this.onDataChannel.bind(this)



    if (options.offer) {
      console.log('Creating answer')
      this.peerConnection.setRemoteDescription(options.offer).then(() => {
        this.peerConnection.createAnswer().then((answer) => {
          console.log('sending answer')
          const sessionDescription = new RTCSessionDescription(answer)
          this.peerConnection.setLocalDescription(sessionDescription)

          this.onAnswerCallback(sessionDescription)
        }).catch((error) => {
          console.error('create answer failure', error)
        })
      }).catch((error) => {
        console.error('set remote description failure', error)
      })
    } else {
      console.log('preparing data channel')
      this.setChannel(this.peerConnection.createDataChannel('dataChannel', {
        ordered: false,
        maxRetransmits: 0
      }))

      console.log('creating offer')
      this.peerConnection.createOffer().then((offer) => {
        const sessionDescription = new RTCSessionDescription(offer)
        this.peerConnection.setLocalDescription(sessionDescription)

        console.log('sending offer')
        this.onOfferCallback(offer)
      }).catch((error) => {
        console.error('create offer failure', error)
      })
    }
  }

  onIceCandidate (event) {
    console.log('ice candidate', event)
    if (event && event.candidate) {
      this.onCandidateCallback(event.candidate)
    }
  }

  onIceCandidateError (event) {
    console.error('ice candidate error', event)
  }

  onIceConnectionChange (event) {
    console.log('ice connection change', event)
  }

  onIceGatheringChange (event) {
    console.log('ice gathering change', event)
  }

  onNegotiationNeeded (event) {
    console.log('negotiation needed', event)
  }

  onDataChannel (event) {
    console.log('server has opened a UDP data channel')
    this.setChannel(event.channel)
  }

  onDataConnectionOpened (event) {
    console.log('data channel opened', event)
    this.channel.send('Your face is a UDP packet')

  }

  onDataConnectionClosed (event) {
    console.log('data channel closed', event)
  }

  onDataConnectionMessage (event) {
    console.log('UDP data channel message received:', event)
  }

  onDataConnectionError (event) {
    console.log('data channel error', event)
  }

  addCandidate (candidate) {
    this.peerConnection.addIceCandidate(candidate)
  }

  answer (answer) {
    this.peerConnection.setRemoteDescription(answer)
  }

  setChannel (channel) {
    this.channel = channel
    this.channel.onopen = this.onDataConnectionOpened.bind(this)
    this.channel.onclose = this.onDataConnectionClosed.bind(this)
    this.channel.onmessage = this.onDataConnectionMessage.bind(this)
    this.channel.onerror = this.onDataConnectionError.bind(this)
  }
}
