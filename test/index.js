process.env.NODE_ENV = "test";
var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');

var mocha = new Mocha;
var p = './test';
fs.readdirSync(p).filter(function(file){
    // Only keep the .js files
    return file.substr(-3) === '.js';

}).forEach(function(file){
    // Use the method "addFile" to add the file to mocha
    mocha.addFile(
        path.join(p, file)
    );
});

// Now, you can run the tests.
mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);
  });
});