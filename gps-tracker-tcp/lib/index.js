const util = require('util');
const chalk = require('chalk');
const EventEmitter = require('events').EventEmitter;
const net = require('net');
const extend = require('node.extend');
const functions = require('./functions');
const Device = require('./device');

util.inherits(Server, EventEmitter);

function Server(opts, callback) {
  if (!(this instanceof Server)) {
    return new Server(opts, callback);
  }

  EventEmitter.call(this);
  var defaults = {
    debug: false,
    port: 8080,
    device_adapter: false,
  };

  //Merge default options with user options
  this.opts = extend(defaults, opts);

  var _this = this;
  this.devices = [];

  this.server = false;
  this.availableAdapters = {
    TK103: './adapters/tk103',
    TK510: './adapters/tk510',
    GT02A: './adapters/gt02a',
    GT06: './adapters/gt06',
    TK303G: './adapters/tk303g'
  };

  /****************************
   SOME FUNCTIONS
   *****************************/
  /* */
  this.setAdapter = function (adapter) {
    if (typeof adapter.adapter !== 'function') {
      throw 'The adapter needs an adapter() method to start an instance of it';
    }

    this.device_adapter = adapter;
  };

  this.getAdapter = function () {
    return this.device_adapter;
  };

  this.addAdaptar = function (model, Obj) {
    this.availableAdapters.push(model);
  };

  this.init = function (cb) {
    //Set debug
    _this.setDebug(this.opts.debug);

    /*****************************
     DEVICE ADAPTER INITIALIZATION
     ******************************/
    if (_this.opts.device_adapter === false)
      throw 'The app don\'t set the device_adapter to use. Which model is sending data to this server?';

    if (typeof _this.opts.device_adapter === 'string') {

      //Check if the selected model has an available adapter registered
      if (typeof this.availableAdapters[this.opts.device_adapter] === 'undefined')
        throw 'The class adapter for ' + this.opts.device_adapter + ' doesn\'t exists';

      //Get the adapter
      var adapterFile = (this.availableAdapters[this.opts.device_adapter]);

      this.setAdapter(require(adapterFile));

    } else {
      //IF THE APP PASS THE ADEPTER DIRECTLY
      _this.setAdapter(this.opts.device_adapter);
    }

    _this.emit('before_init');
    if (typeof cb === 'function') cb();
    _this.emit('init');

    /* FINAL INIT MESSAGE */
    console.log(chalk.cyan('\n=================================================\nGPS LISTENER running at port ' + _this.opts.port + '\nEXPECTING DEVICE MODEL:  ' + _this.getAdapter().model_name + '\n=================================================\n'));
  };

  this.addAdaptar = function (model, Obj) {
    this.adapters.push(model);
  };

  this.do_log = function (msg, from) {
    //If debug is disabled, return false
    if (this.getDebug() === false) return false;

    //If from parameter is not set, default is server.
    if (typeof from === 'undefined') {
      from = 'SERVER';
    }

    msg = '#' + from + ': ' + msg;
    console.log(msg);

  };

  /****************************************
   SOME SETTERS & GETTERS
   ****************************************/
  this.setDebug = function (val) {
    this.debug = (val === true);
  };

  this.getDebug = function () {
    return this.debug;
  };

  //Init app
  this.init(function () {
    /*************************************
     AFTER INITIALIZING THE APP...
     *************************************/
    _this.server = net.createServer(function (connection) {
      //Now we are listening!

      //We create an new device and give the an adapter to parse the incomming messages
      connection.device = new Device(_this.getAdapter(), connection, _this);
      _this.devices.push(connection);

      //Once we receive data...
      connection.on('data', function (data) {
        connection.device.emit('data', data);
      });

      // Remove the device from the list when it leaves
      connection.on('end', function () {
        _this.devices.splice(_this.devices.indexOf(connection), 1);
        connection.device.emit('disconnected');
      });

      connection.on('error', function (error) {
        console.log(chalk.red('Error: ') + error)
      })

      connection.on('close', function () {
        _this.devices.splice(_this.devices.indexOf(connection), 1);
        console.log(chalk.red('Device disconnected \n'));
      })

      callback(connection.device, connection);

      connection.device.emit('connected');
    }).listen(opts.port);
  });

  /*Lisen http server */
  this.listen_http_server = function (port, host) {
    if ((host == 'localhost' || host == '127.0.0.1') && port == opts.port) {
      console.log(chalk.red('HTTP listen port cant be the same as TCP server port in localhost'))
      return
    }

    console.log(chalk.green('TCP server to listen HTTP server created successful \n'))
    const server = net.createServer(connection => {

      connection.on('data', data => {
        console.log(chalk.magenta('New data from http server: ') + data + '\n')
        data = JSON.parse(data)
        if (data.cmd) {
          this.send_to(data.imei, `**,imei:${data.imei},${data.cmd}`)
        }
      })

      connection.on('end', () => {
        console.log(chalk.red('HTTP server disconnected'))
      })

      connection.on('error', (error) => {
        console.log(chalk.red('Error: ') + error)
      })

      connection.on('close', () => {
        console.log(chalk.red('HTTP server disconected \n'))
      })
    })

    server.on('connection', socket => {
      console.log(chalk.green('HTTP server connected'))
    })

    server.listen(port, host)
  }

  /* Search a device by ID */
  this.find_device = function (deviceId) {
    for (var i in this.devices) {
      var dev = this.devices[i].device;
      if (dev.uid === deviceId) {
        return dev;
      }
    }

    return false;
  };

  /* SEND A MESSAGE TO DEVICE ID X */
  this.send_to = function (deviceId, msg) {
    const dev = this.find_device(deviceId);
    if (!dev) return console.log('Device not found') 
    dev.send(msg);
  };

  return this;
}

exports.server = Server;
exports.version = require('../package').version;
