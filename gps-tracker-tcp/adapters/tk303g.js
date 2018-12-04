const protocol = 'GPSTK303g'
const model_name= 'TK303g'
const compatible_hardware = ["TK303g/supplier"]

const adapter = function (device) {
    if(!(this instanceof adapter)) return new adapter(device)
    
    //Code that parses and respond to commands
    this.parse_data =  function (data) {
      data = data.toString()
      tokens = data.split(',')
      const parsedData = {}

      if (data.includes('##')) {
        // is the first message
        // ##,imei:359586015829802,A;
        parsedData.device_id = tokens[1].split(':')[1]
        parsedData.cmd = 'login_request'
        parsedData.data = data
      } else if (tokens.length == 1) {
        // is the second message
        // 359586015829802
        parsedData.device_id = tokens[1].split(':')[1]
        parsedData.cmd = 'heartbeat'
        parsedData.data = data
      } else {
        parsedData.device_id = tokens[1].split(':')[1]
        parsedData.cmd = 'ping'
        parsedData.data = data
      }
    }

    // Login device
    this.authorize = function () {
      this.device.send('LOAD')
    }

    // Start initialize traking
    this.initialize = function () {
      this.device.send('ON')
    }

}

module.exports = {
  protocol,
  model_name,
  compatible_hardware,
  adapter
}