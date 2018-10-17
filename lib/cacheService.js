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
			if(!object){
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
	this.getObject=function(objectKey,propertyValue){
		return new Promise(function (resolve, reject) {
			if(!propertyValue){
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
	
}

util.inherits(CacheService, RedisStore);
module.exports = CacheService;
