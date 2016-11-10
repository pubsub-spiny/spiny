//var http = require('http2').raw;
var http = require('http');
var chord = require('./chord');
var MQTTServer = require('mqtt-server');
var url = require('url');
var querystring = require('querystring');
var remoteSubscribers = require('./subscribers')();
var localSubscribers = require('./subscribers')();
var subscribeTimers = {};


module.exports = {
	start: function(settings) {
		var chordSend = chord.Chord(settings.port,
	        20,
	        settings.seed,
	        on_message);


		var mqttServer = MQTTServer({
			mqtt: 'tcp://localhost:' + settings.mqtt_port
		}, {
			emitEvents: true
		}, mqttHandler);
		mqttServer.listen(function() {
			console.log('ready mqtt')
		});

		var server = http.createServer(httpHandler);
		server.listen(settings.http_port, '0.0.0.0');


		function on_message(from, id, message, reply) {
			if(message.t == 'p') {
				remoteSubscribers.send(message.c, {t:'pp', c:message.c, d:message.d});
			} else if(message.t == 's') {
				console.log(from.id, id, message);
				remoteSubscribers.add(message.c, from.id, function(message) {
					chordSend(from, null, message);
					return true;
				});
			} else if(message.t == 'u') {

			} else if(message.t == 'pp') {
				localSubscribers.send(message.c, message);
			}
		}

		function httpHandler(req, res) {
			var matched = req.url.match(/\/pub\/(v1)\/(\w+)/);
			var matchedSub = req.url.match(/\/sub\/(v1)\/(\w+)/);
			if(matched) {
				var version = matched[1];
				var channel = matched[2];
				var urlParams = url.parse(req.url);
				var query = querystring.parse(urlParams.query);
				var value = query.v;
				var params = publish(version, channel, value);
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(params);
			}else if(matchedSub){
				var urlParams = url.parse(req.url);
				var query = querystring.parse(urlParams.query);
				var version = matchedSub[1];
				var channel = matchedSub[2];
				if(res.push) {
					var push = res.push(req.url)
					//push.write("push");
				}
				var result = subscribe(version, channel, query.uuid, function(content) {
					res.writeHead(200, {'Content-Type': 'application/json'});
					res.write(JSON.stringify(content));
					res.end();
					return false;
				});
				//res.writeHead(200, {'Content-Type': 'application/json'});
				//res.end(JSON.stringify(result));
			}else{
				res.writeHead(404, {'Content-Type': 'application/json'});
				res.end(JSON.stringify({err:"not found"}));
			}	
		}



		function mqttHandler(client) {
			var connect = null;
			client.on('connect', function(_connect) {
				connect = _connect;
				client.connack({
					returnCode: 0
				});
			});
			client.on('publish', function (packet) {
				publish('key', packet.topic, String(packet.payload));
			});
			client.on('subscribe', function (packet) {
				// send a suback with messageId and granted QoS level
				subscribe('v1', packet.subscriptions[0].topic, connect.clientId, function(m) {
					client.publish({
						topic: m.c,
						payload: m.d,
						qos: 0
					});
					return true;
				});
				client.suback({ granted: [packet.qos], messageId: packet.messageId })
			})
		}




		function publish(version, channel, value) {
			var params = {
				t: 'p',
				v: version,
				c: channel,
				d: value,
				ts: new Date().getTime()
			}
			chordSend(null, channel, params);
			var stringified = JSON.stringify(params);
			return stringified;
		}
		function subscribe(version, channel, uuid, cb) {
			var params = {
				t: 's',
				v: version,
				c: channel,
				uuid: uuid
			}

			localSubscribers.add(channel, uuid, cb);
			if(!subscribeTimers[channel]) {
				register_subscriber(channel, 0);
			}
			var stringified = JSON.stringify(params);
			return stringified;
		}
		function unsubscribe(version, channel, uuid, cb) {
			var params = {
				t: 'u',
				v: version,
				c: channel,
				uuid: uuid
			}
			chordSend(null, channel, params);
			localSubscribers.remove(channel, uuid);
			var stringified = JSON.stringify(params);
			return stringified;
		}
		
		function register_subscriber(channel, ts) {
			if(localSubscribers.size(channel) <= 0) return;
			chordSend(null, channel, {t: 's',c:channel,ts:ts||0});
			subscribeTimers[channel] = setTimeout(function() {
				register_subscriber(channel, ts);
			}, 5000);
		}


	}
}