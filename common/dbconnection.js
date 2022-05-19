/*
Author: Raj Kumar
Despription: This code manages mongo DB connection
*/

const mongoose = require('mongoose');
const config = require('./config.js');

mongoose.Promise = global.Promise;
var numConnections = 0;

var conn_options = {
  autoIndex: false, // Don't build indexes
  reconnectInterval: 800, // Reconnect every 500ms
  poolSize: config.connectionPool, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: false,
  socketTimeoutMS: 75000,
  keepAlive: true,
  keepAliveInitialDelay: 300000,
  reconnectTries: 30000,
  useFindAndModify: false
};

function createConnection() {
  let con = mongoose.createConnection(config.DBURI, conn_options);
  con.on('error', (error) => console.error(error));
  con.on('open', () =>
  {
    numConnections++;
    console.log('connected to mongo database ' + numConnections);
  });
  con.on('disconnected', () =>
  {
    numConnections--;
    console.log('disconnected from mongo database ' + numConnections);
  });

  con.on('reconnected', () => {
  console.log('Mongoose connection reconnected');
});

  return con;
}

module.exports = createConnection();
module.exports.on = createConnection;
