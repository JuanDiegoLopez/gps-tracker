'use strict'
const chalk = require('chalk')

const protocol = 'GPSTK303g'
const model_name= 'TK303g'
const compatible_hardware = ["TK303g/supplier"]

const adapter = function (device) {
    if(!(this instanceof adapter)) return new adapter(device)
    this.device = device
    
    //Code that parses and respond to commands
    this.parse_data =  function (data) {
      data = data.toString()
      console.log(chalk.yellow(data))
      const tokens = data.split(',')

      const parts = {
        device_id: tokens[1] ? tokens[1].split(':')[1] : tokens[0],
        data
      }
      
      if (tokens.includes('##')) {
        // is the first message
        // ##,imei:359586015829802,A;
        parts.action = 'login_request'
        parts.cmd = 'login_request'
      } else if (tokens.length === 1 ) {
        parts.cmd = 'login'
        parts.action = 'other'
      } else {
        parts.action = 'ping'
        parts.cmd = 'tracker'
      }
      return parts
    }
    // Authorize the device
    this.authorize = function () {
      this.device.send('LOAD')
    }

    // Run others commnds
    this.run_other = function (cmd, msg_parts) {
      switch (cmd) {
        case 'login':
          this.device.send('ON')
          break

        case 'arm':
          this.device.send('')
          break
      }
    }

    this.send_commad = function () {

    }

    this.get_ping_data = function (msg_parts) {
      const str = msg_parts.data
      const tokens = str.split(',')

      const data = {
        latitude: tokens[7],
        longitude: tokens[9],
        date: tokens[2],
        phone: tokens[3],
        signalGPS: tokens[4] == 'F' ? true : false,
        time: tokens[5],
        speed: tokens[11]
      }

      return data
    }

}

module.exports = {
  protocol,
  model_name,
  compatible_hardware,
  adapter
}