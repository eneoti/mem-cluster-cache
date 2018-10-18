# Overview
Library for read, write redis 

#Support
* Save json object
* Get json object
* Remove
* Remove by pattern

# How to use
- Install
```
    npm install mem-cluster-cache
```

- Example
```
    cacheService=new redis.CacheService({
        port: 6379,          
        host: "localhost"
    })
    cacheService._db.on('connect',function () {
      ///
    });
    cacheService.saveObject("things","name",{name:"thing1", age:40}).then(function(){
        ///
    }).catch(function(err){
        ///
    })

```
