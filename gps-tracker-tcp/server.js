'use strict'

const gps = require('./lib')
const chalk = require('chalk')

const options = {
    'debug': true,
    'port': process.env.PORT || 9000,
    'device_adapter': "TK303G"
}

const server = gps.server(options, (device, connection) => {
    device.on('connected', data => {
        // TODO validations before accept device
        console.log(chalk.green('New device connected'))
    })
    
    device.on('login_request', (id, data) => {
        device.login_authorized(true)
    })

    device.on('start_comunication', (id, data) => {
        //
    })

    //PING -> When the gps sends their position  
    device.on('ping', (gpsData, msgParts) => {
    })
})

setTimeout(() => {
    const device = server.find_device('359586015829802')
    device.send('**imei:359586015829802,111')
}, 10000)