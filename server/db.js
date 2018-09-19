var mongoose = require('mongoose');
var conf = require('./conf');
var fs = require('fs');
const join = require('path').join;

const models = join(__dirname, './models');

fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

function connect () {
    var options = {
        useMongoClient:true,
        socketTimeoutMS: 0,
        keepAlive: true,
        reconnectTries: 30,
        reconnectInterval: 1000, // 1s
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: 0,
    };

    return mongoose.connect(conf.db, options);
}


module.exports.init = () => {
    connect().then(res => {
        console.log('mongodb is connected');
    }, console.log);
};
