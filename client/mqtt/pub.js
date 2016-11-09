var mqtt = require('mqtt');
var uuid = require('uuid');

var client  = mqtt.connect(process.env.HOST || 'mqtt://localhost:1883', {
	clientId: uuid(),
	clean: true
})
 
client.on('connect', function () {
	console.log("connected")
})
 
client.on('message', function (topic, message) {
	console.log(message.toString())
})


client.subscribe('aaa', {qos:0}, function(err, granted) {
	console.log(err, granted)
})


var count = 1;
setInterval(function() {
	client.publish('aaa', 'Hello mqtt ' + count++, {qos:0}, function(err) {
		console.log(err)
	})
}, 1000);
