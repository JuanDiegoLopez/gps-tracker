'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const net = require('net')
const chalk = require('chalk')

const app = express()
const tcpClient = new net.Socket()

const port = process.env.PORT || 3000
const tcpPort = process.env.TCP_PORT || 9001
const tcpHost = process.env.TCP_HOST || 'localhost'

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.post('/sendCommand', (req, res, next) => {
  console.log(`${chalk.green('POST')} /sendMessage`)
  const message  = req.body
  tcpClient.write(JSON.stringify(message))
  res.send('message sent')
})

app.listen(port, () => {
  console.log(chalk.green(`Server running on port ${port}`))
  
    tcpClient.connect(tcpPort, tcpHost, () => {
      console.log(chalk.blue('Connection with TCP server successful'))
      const token = {
        token: '11111111'
      }
      tcpClient.write(JSON.stringify(token))
    })
})