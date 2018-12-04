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
        cmd: 'A',
        data
      }
      
      if (tokens.includes('##')) {
        // is the first message
        // ##,imei:359586015829802,A;
        parts.action = 'login_request'
      } else if (tokens.length === 1 ) {
        parts.action = 'other'
      } else {
        console.log('holi')
        parts.action = 'ping'
      }
      console.log(parts)
      return parts
    }
    // Authorize the device
    this.authorize = function () {
      this.device.send('LOAD')
    }

    // Run others commnds
    this.run_other = function (cmd, msg_parts) {
      switch (cmd) {
        case 'A':
          this.device.send('ON')
          break
      }
    }

    this.send_commad = function () {

    }

    this.get_ping_data = function (msg_parts) {
      return msg_parts.data
    }

}

module.exports = {
  protocol,
  model_name,
  compatible_hardware,
  adapter
}