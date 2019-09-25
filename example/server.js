'use strict'
const WebSocket = require('ws')
const UDPConnection = require('../dist/webudp-node')

const connections = []

const wss = new WebSocket.Server({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024
  }
})

wss.on('connection', function connection (ws) {
  let dataConnection = undefined

  ws.on('message', function incoming (message) {
    const data = JSON.parse(message)

    switch (data.command) {
      case 'offer': {
        dataConnection = new UDPConnection({
          offer: data.offer,
          stunServers: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
          onCandidate: (candidate) => {
            ws.send(JSON.stringify({
              command: 'candidate',
              candidate: candidate
            }))
          },
          onAnswer: (answer) => {
            ws.send(JSON.stringify({
              command: 'answer',
              answer: answer
            }))
          }
        })
        connections.push(dataConnection)
        break
      }

      case 'candidate':
        dataConnection.addCandidate(data.candidate)
        break

      default:
        break
    }
  })
})
