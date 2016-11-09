module.exports = function() {
	return {
		subscribers: {},
		add: function(channel, uuid, callback) {
			if(!this.subscribers[channel]) {
				this.subscribers[channel] = {};
			}
			var subs = this.subscribers[channel];
			subs[uuid] = callback
		},
		remove: function(channel, uuid) {
			delete this.subscribers[channel][uuid];
		},
		size: function(channel) {
			if(!this.subscribers[channel]) {
				this.subscribers[channel] = {};
			}
			return Object.keys(this.subscribers[channel]).length;
		},
		send: function(channel, message) {
			if(!this.subscribers[channel]) {
				this.subscribers[channel] = [];
			}
			var subs = this.subscribers[channel];
			Object.keys(subs).forEach(function(uuid) {
				if(typeof subs[uuid] == "function") {
					var isContinue = subs[uuid](message);
					if(!isContinue) {
						delete subs[uuid];
					}
				}
			});
		}
	}
}