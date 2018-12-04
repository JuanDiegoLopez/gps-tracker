'use strict'

const net = require('net')

const client = new net.Socket()

const port = process.env.PORT || 9000
const host = process.env.HOST || 'localhost'


client.connect(port, host, () => {
	console.log('Connected')
	client.write('##,imei:359586015829802,A;')
})

client.on('data', data => {
	console.log('Received: ' + data)
	if (data == 'LOAD') {
		client.write('359586015829802')
		//return
	} else if (data == 'ON') {
		console.log('holi')
		client.write('imei:359587010124900,tracker,0809231929,13554900601,F,112909.397,A,2234.4669,N,11354.3287,E,0.11,;')
		//return	
	} else {
		 client.destroy() // kill client after server's response
	}
})

client.on('end', () => {
	console.log('Connection end')
})

client.on('close', () => {
	console.log('Connection closed')
})
