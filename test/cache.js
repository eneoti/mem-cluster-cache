'use strict'
var redis = require('../')
var dockerTest= require('docker-testing');
var docker=new dockerTest.DockerTest();
var cacheService;
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
	describe('#cacheService', function () {
	    it('should receive event connect when init CacheService ', function (done) {
	     	cacheService=new redis.CacheService({
				port: 6379,          
				host: "localhost"
			})
			cacheService._db.on('connect',function () {
				done();
			});
	    })
	    it('save object json into redis ', function (done) {
	     	cacheService.saveObject("things","name",{name:"thing1", age:40}).then(function(){
	     		cacheService.saveObject("things","name",{name:"thing2", age:30}).then(function(){
	     			done();
	     		})
	     	}).catch(function(err){
	     		cacheService._db.disconnect()
	     	})
	    })
	    it('read object json should same with saveObject before ', function (done) {
	     	cacheService.getObject("things","thing1").then(function(result){
	     		if(result.name=="thing1"){
	     			done();
	     		}
	     		cacheService._db.disconnect()
	     	}).catch(function(err){
	     		cacheService._db.disconnect()
	     	})
	    })
	})

})
