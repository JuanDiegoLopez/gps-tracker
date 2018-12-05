'use strict'

const gps = require('./lib')
const chalk = require('chalk')

const options = {
    'debug': true,
    'port': process.env.PORT || 9000,
    'device_adapter': "TK303G"
}

const server = gps.server(options, (device, connection) => {
    device.on('login_request', (id, data) => {
        // Logica para validar el dispositivo
        device.login_authorized(true)
    })

    //PING -> When the gps sends their position  
    device.on('ping', (gpsData, msgParts) => {
        // Logica cuando se actualizen las cordendas
    })
})

server.listen_http_server(9001, 'localhost')

// setTimeout(() => {
//     const device = server.find_device('359586015829802')
//     if (!device) return console.log('Device not found')
//     device.send('**imei:359586015829802,111')
// }, 60000)