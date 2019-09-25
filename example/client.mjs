import UDPConnection from '../dist/webudp-browser.mjs'

;(function () {
  const ws = new WebSocket('ws://127.0.0.1:8080')

  let dataConnection = undefined

  ws.onopen = (event) => {
    dataConnection = new UDPConnection({
      iceServers: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
      onOffer: (offer) => {
        ws.send(JSON.stringify({
          command: 'offer',
          offer: offer
        }))
      },
      onCandidate: (candidate) => {
        ws.send(JSON.stringify({
          command: 'candidate',
          candidate: candidate
        }))
      }
    })
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    switch (data.command) {
      case 'answer': {
        dataConnection.answer(data.answer)
        break
      }

      case 'candidate': {
        dataConnection.addCandidate(data.candidate)
        break
      }

      default:
        break
    }
  }
}())

