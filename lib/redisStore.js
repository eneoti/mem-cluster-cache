
'use strict'
var _ = require('lodash');
var pna = require('process-nextick-args')
var Redis = require('redis');

function RedisStore(options) {
    if (!(this instanceof RedisStore)) {
        return new RedisStore({ ...options, return_buffers: true })
    }
    this._db = Redis.createClient({ ...options, return_buffers: true })
    this._pipeline = null

    this._db.on("error", function (err) {
        console.log("Error " + err);
    });
}

RedisStore.prototype._getPipeline = function () {
    if (!this._pipeline) {
        this._pipeline = this._db.pipeline()
        pna.nextTick(execPipeline, this)
    }
    return this._pipeline
}



function execPipeline(that) {
    that._pipeline.exec()
    that._pipeline = null
}
RedisStore.prototype.remove = function (key) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self._db.del(key, function (err, type) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

RedisStore.prototype.removeByPattern = function (pattern) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self._db.keys('*', function (err, keys) {
            if (err) {
                return reject(err);
            };

            for (var i = 0, len = keys.length; i < len; i++) {
                if (keys[i].indexOf(pattern) > -1) {
                    self._db.del(keys[i], function (err, type) {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                }
            }
        });

        resolve();
    });
};

RedisStore.prototype.clear = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        self._db.keys('*', function (err, keys) {
            if (err) {
                return reject(err);
            };

            for (var i = 0, len = keys.length; i < len; i++) {
                self._db.del(keys[i], function (err, type) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }
        });

        resolve();
    });
};

module.exports = RedisStore;