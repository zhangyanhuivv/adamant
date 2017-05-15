'use strict';

var redis = require('redis');

module.exports.connect = function (cacheEnabled, config, logger, cb) {

	var connectedOnBoot = false;

	if (cacheEnabled) {
		var client = redis.createClient(config);

		client.on('connect', function () {
			logger.info('App connected with redis server');
			connectedOnBoot = true;
			cb(null, { cacheEnabled: cacheEnabled, client: client });
		});

		client.on('error', function (err) {
			logger.error('Redis:', err);
			// Only throw an error if cache was enabled in config but were unable to connect application start
			if (!connectedOnBoot) {
				throw 'Unable to connect to redis server';
			}
		});

		client.monitor(function () {
			logger.info('Entering monitoring mode');
		});

		client.on('monitor', function (time, args, raw_reply) {
			logger.info('Redis:', time, args, raw_reply);
		});
	} else {
		cb(null, { cacheEnabled: cacheEnabled, client: null });
	}
};
