'use strict'

const gps = require('gps-tracking')
const chalk = require('chalk')
const tk303g = require('./adapters/tk303g')

const options = {
    'debug': true,
    'port': process.env.PORT || 9000,
    'device_adapter': tk303g
}

const server = gps.server(options, (device, connection) => {
    device.on('connected', data => {
        // TODO validations before accept device
        console.log(chalk.green('New device connected'))
    })
    
    device.on('login_request', (id, data) => {
        device.login_authorized(true)
    })

    //PING -> When the gps sends their position  
    device.on('ping', (data) => {
        console.log(data)
        return data
    })
})
