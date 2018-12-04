'use strict'

const gps = require("gps-tracking");
const tk303g = require('./adapters/tk303g')
const options = {
    'debug': true,
    'port': process.env.PORT || 9000,
    'device_adapter': tk303g
}

const server = gps.server(options, (device, connection) => {
    device.on("login_request", (device_id, msg_parts) => {
      device.authorize()
    })

    device.on('heartbeat', (id, data) => {
        console.log(id, data)
    })

    //PING -> When the gps sends their position  
    device.on("ping", data => {
        //After the ping is received, but before the data is saved
        console.log(data);
    })
})
