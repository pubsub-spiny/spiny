//var http2 = require('http2').raw;
var http2 = require('http');
var querystring = require('querystring');
var uuid = require('uuid');

function Client() {
	this.topics = [];
}

Client.prototype._reconnect = function() {
	console.log("reconnect")
	setTimeout(() => {
		this.on(topic, cb);
	}, 1000);
}

Client.prototype.on = function(topic, cb) {
	if(this.topics.indexOf(topic) < 0)
		this.topics.push(topic);
	this.listener = cb;
	this._startSubscribeLoop(topic)
}

Client.prototype._startSubscribeLoop = function() {
	this._stopSubscribeLoop();
	var topics = []
	this.topics.forEach(topic => topics.push(topic));
	this._subscribeCall = this._call(topics[0], this._handleResponse.bind(this));
}

Client.prototype._stopSubscribeLoop = function() {
	if(this._subscribeCall) {
		this._subscribeCall.abort();
		this._subscribeCall = null;
	}
}

Client.prototype._handleResponse = function(err, data) {
	if(err) {
		this._startSubscribeLoop();
	}else{
		if(this.listener) this.listener(data);
		this._startSubscribeLoop();
	}
}

Client.prototype._call = function(topic, cb) {
	console.log("_call", topic);
	var t = new Date().getTime();
	var qs = querystring.stringify({t:t,uuid:uuid()});
	var req = http2.get('http://localhost:8000/sub/v1/'+topic + '?' + qs, (response) => {
		response.on('error', (err) => {
			console.log("error", err);
		});
		response.on('data', function(data) {
			cb(null, data.toString())
		});
		response.on('end', function(data) {
			console.log("end");
		});
		response.on('close', function(data) {
			console.log("close", data);
		});
		response.on('aborted', function(data) {
			console.log("aborted", data);
		});
	})
	req.on('error', (err) => {
		console.log("error", err);
		cb(err);
	})
	return req;
	//req.end();

}

var client = new Client();
client.on('aaa', function(data) {
	console.log(data);
})