/*
Author: Raj Kumar
Despription: This code logs the console mesage, debug logs
*/
var debug = require('debug');
var query = debug('log:query')
  , route = debug('log:route')
  , omdb = debug('log:omdb');

debug.enable('log:*'); //('worker:*,-worker:b');

var Logger = function(log){
};

Logger.extend = function (name) {
  const extended = query.extend(name);
  return extended;
};

Logger.enable = function (context, flag) {
  if(flag == true)
  {
    debug.enable(context);
  }
  else
  {
      debug.disable(context);
  }
}

Logger.log = function (context, msg) {
  if(context == 'query')
  {
    query(msg);
  }
  else if(context == 'route')
  {
    route(msg);
  }
  else if(context == 'omdb')
  {
    omdb(msg);
  }
}

module.exports = Logger;
