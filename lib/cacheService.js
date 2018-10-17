'use strict'

var RedisStore = require("./redisStore");
var util = require('util');
var statusKey = 'connections';
var msgpack = require('msgpack-lite');
function CacheService() {
	var self=this;
	RedisStore.apply(this, arguments);
	this.saveObject=function(objectKey, propertyName,object){
		return new Promise(function (resolve, reject) {
			if(!objectKey||!propertyName||!object){
				reject(new Error('can not cached empty data'));
			}
			self._getPipeline().hsetBuffer(objectKey, object[propertyName],msgpack.encode(object), function(err,result){
				if(err)
				{
					return  reject(err);
				}
				resolve()
			});
		})
	}
	this.getObjectItem=function(objectKey,propertyValue){
		return new Promise(function (resolve, reject) {
			if(!objectKey||!propertyValue){
				reject(new Error('propertyValue is null'));
			}
			self._getPipeline().hgetBuffer(objectKey,propertyValue, function(err,result){
				if(err)
				{
					return  reject(err);
				}
				try{
					var data=null;
					if(result){
						data =msgpack.decode(result);
					}
					return resolve(data);
				}
				catch(err){
					return  reject(err);
				}
			});
		});
	}
	this.getObjectItems=function(objectKey,propertyValues){
		return new Promise(function (resolve, reject) {
			if(!objectKey||!propertyValue||propertyValues.length==0){
				return reject(new Error('propertyValues is null or empty'));
			}
			var multi = this._db.multi();
			for (var i = 0; i < propertyValues.length; i++) {
				multi.hgetBuffer(objectKey, propertyValues[i]);
			}
			multi.exec(function (err, results) {
			if (err) {
				return reject(err)
			}
			var data = {};
			for (var i = 0; i < propertyValues.length; i++) {
				if(!propertyValues[i]){
					continue;
				}
				var formated = {
					"value": "unrecognizable"
				};

				if (results[i][1]){
					formated = msgpack.decode(results[i][1]);
				}
				data[propertyValues[i]] = formated;
			}
			resolve(data)
		});
		});
	}
	this.getObject = function(objectKey) {
		return new Promise(function (resolve, reject) {
			if(!objectKey){
				reject(new Error('objectKey is null'));
			}
			self._db.hgetallBuffer(objectKey, function (err, result) {
				if (err) {
					return callback(err);
				}
				for (var key in result) {
					result[key] = msgpack.decode(result[key]);
				};
				callback(null, result);
			});
		});

		
	}
	
	
}

util.inherits(CacheService, RedisStore);
module.exports = CacheService;
