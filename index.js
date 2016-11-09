var server = require('./server');


var settings = {
	port: Number(process.env.PORT || '3000'),
	http_port: Number(process.env.HTTP_PORT || '8000'),
	mqtt_port: Number(process.env.MQTT_PORT || '1883'),
	seed: {address:'127.0.0.1', port:3000}
}


server.start(settings);
 