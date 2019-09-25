const UDPConnectionWrapper = ({ RTCPeerConnection, RTCSessionDescription }) => {
  /**
   * @classdesc UDP connection instances
   * @class
   */
  return class UDPConnection {
    /**
     *
     * @param {object} options configuration object.
     * @param {[string]} options.iceServers a list of STUN/TURN servers to use for negotiation.
     * @param {UDPConnection~candidateCallback} options.onCandidate
     * @param {object} [options.offer] Instantiates the UDP connection with an offer from another UDP connection.
     * @param {UDPConnection~offerCallback} [options.onOffer]
     * @param {UDPConnection~answerCallback} [options.onAnswer]
     * @constructor
     */
    constructor  (options) {
      const configuration = {
        'iceServers': [
          { 'urls': options.iceServers }
        ]
      }

      /**
       * A WebRTC offer callback
       * @callback UDPConnection~offerCallback
       * @param {object} offer an offer object
       */
      this.onOfferCallback = options.onOffer
      /**
       * @callback UDPConnection~answerCallback
       * @param {object} answer a WebRTC answer object
       */
      this.onAnswerCallback = options.onAnswer
      /**
       * A WebRTC candidate negotiation callback
       * @callback UDPConnection~candidateCallback
       * @param {object} candidate an ICE candidate
       */
      this.onCandidateCallback = options.onCandidate

      this.peerConnection = new RTCPeerConnection(configuration)
      this.peerConnection.onicecandidate = this.onIceCandidate.bind(this)
      this.peerConnection.onicecandidateerror = this.onIceCandidateError.bind(this)
      this.peerConnection.onnegotiationneeded = this.onNegotiationNeeded.bind(this)
      this.peerConnection.ondatachannel = this.onDataChannel.bind(this)



      if (options.offer) {
        this.peerConnection.setRemoteDescription(options.offer).then(() => {
          this.peerConnection.createAnswer().then((answer) => {
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
        this.setChannel(this.peerConnection.createDataChannel('dataChannel', {
          ordered: false,
          maxRetransmits: 0
        }))

        this.peerConnection.createOffer().then((offer) => {
          const sessionDescription = new RTCSessionDescription(offer)
          this.peerConnection.setLocalDescription(sessionDescription)

          this.onOfferCallback(offer)
        }).catch((error) => {
          console.error('create offer failure', error)
        })
      }
    }

    onIceCandidate (event) {
      if (event && event.candidate) {
        this.onCandidateCallback(event.candidate)
      }
    }

    onIceCandidateError (event) {
      console.error('ice candidate error', event)
    }

    onNegotiationNeeded (event) {
      console.log('negotiation needed', event)
    }

    onDataChannel (event) {
      this.setChannel(event.channel)
    }

    onDataConnectionOpened (event) {

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
      return this.peerConnection.addIceCandidate(candidate)
    }

    answer (answer) {
      return this.peerConnection.setRemoteDescription(answer)
    }

    send (data) {
      this.channel.send(data)
    }

    setChannel (channel) {
      this.channel = channel
      this.channel.onopen = this.onDataConnectionOpened.bind(this)
      this.channel.onclose = this.onDataConnectionClosed.bind(this)
      this.channel.onmessage = this.onDataConnectionMessage.bind(this)
      this.channel.onerror = this.onDataConnectionError.bind(this)
    }
  }
}

export default UDPConnectionWrapper
