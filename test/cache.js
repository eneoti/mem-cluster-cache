'use strict'
var redis = require('../')
var dockerTest= require('docker-testing');
var docker=new dockerTest.DockerTest()

describe('redis', function () {
	before(async function(){
	  this.timeout(10000);
	  await(docker.RunContainer("redis:5.0-rc-alpine",6379,"redis-test"))

	  return new Promise(function (resolve,reject) {
	    setTimeout(function(){
	      resolve();
	    },5000)

	  })
	})
	after(async function() {
	    this.timeout(5000);
	   await(docker.StopContainer("redis-test"))
	  });
	describe('#connect', function () {
	    it('should return an CacheService when connect is called ', function (done) {
	     	var cacheService=new redis.CacheService({
				port: 6379,          
				host: "localhost"
			})
			cacheService._db.on('connect',function () {
				cacheService._db.disconnect()
				done();
			});
	    })
	})
})
