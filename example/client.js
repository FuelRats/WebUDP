'use strict'

;(function () {
  const ws = new WebSocket('ws://127.0.0.1:8080')

  let dataConnection = undefined

  ws.onopen = (event) => {
    dataConnection = new UDPConnection({
      stunServers: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
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

  ws.onclose = (event) => {

  }

  ws.onerror = (event) => {

  }

  ws.onmessage = (event) => {
    console.log(event)
    const data = JSON.parse(event.data)
    switch (data.command) {
      case 'answer': {
        console.log('received answer')
        dataConnection.answer(data.answer)
        break
      }

      case 'candidate': {
        console.log('received candidate')
        dataConnection.addCandidate(data.candidate)
        break
      }

      default:
        break
    }
  }
}())

