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
        data
      }
      
      if (tokens.includes('##')) {
        // is the first message
        // ##,imei:359586015829802,A;
        parts.device_id = tokens[1].split(':')[1]
        parts.action = 'login_request'
        parts.cmd = 'login_request'
      } else if (tokens.length === 1 ) {
        parts.device_id = tokens[0]
        parts.cmd = 'start_comunication'
        parts.action = 'start_comunication'
      } else if (tokens[1] == 'tracker') {
        parts.device_id = tokens[0].split(':')[1]
        parts.action = 'ping'
        parts.cmd = 'tracker'
      } else {
        parts.device_id = tokens[0].split(':')[1]
        parts.action = 'other'
        parts.cmd = tokens[1]
      }
  
      return parts
    }
    // Authorize the device
    this.authorize = function () {
      this.device.send('LOAD')
    }

    this.start_comunication = function () {
      this.device.send('ON')
    }

    // Run others commnds
    this.run_other = function (cmd, id) {
      this.send_commad(id, cmd)
    }

    this.send_commad = function (id, cmd) {
      const message = `**imei:${id},${cmd}`
      this.device.send(message)
    }

    this.get_ping_data = function (msgParts) {
      const str = msgParts.data
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