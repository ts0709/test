/*
Author: Raj Kumar
Despription: This code creates the server, set routing, CORS, loads env settings
*/
const express            = require('express');
const http               = require('http');
const cluster            = require('cluster');
const os                 = require('os');
var compression 	       = require('compression');
const bodyParser         = require('body-parser');
const config 	           = require('./common/config.js');

var numCPUs            = 1;//os.cpus().length; // umcomment to create cluster and bind with each core cpu

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET env var. Set it and restart the server");
}

const { OMDb_APIKEY } = process.env;

if (!OMDb_APIKEY) {
  throw new Error("Missing OMDb_APIKEY env var. Set it and restart the server");
}

process.env["JWT_SECRET"] =  JWT_SECRET;
process.env["OMDb_APIKEY"] = OMDb_APIKEY;

const routes 	           = require('./route/route_config');
const app                = express();

var cleanupExit = function() {
  console.log('cleanup and Exit');
  if(config.mongo != null)
  {
    config.mongo.close(function () {
      console.log('Mongoose is disconnected through app termination');
      process.exit(0);
    });
  }
  else
  {
      process.exit(0);
  }
}

//handle exit signal and cleanup db
process.on('SIGINT', cleanupExit).on('SIGTERM', cleanupExit);

// handle CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, content, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    else {
      return next();
    }
});

// handle compression
app.use(compression());
//body parser
app.use(bodyParser.urlencoded({limit: '20mb', extended: true}));
app.use(bodyParser.json({limit: '10mb', extended: true}));

// set route
routes.route(app);

// create cluster server and bind each process with a core cpu
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

// hanlde child process exit
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    if(signal == 'SIGKILL')
    {
      process.exit(0);
    }
    else
    {
        cluster.fork();
    }
    console.log('Starting a new worker ');

  });
} else {
    http.createServer(app).listen(config.server_port, config.server_host, () => {
      console.log('HTTP Server live on ' + config.server_port);
    });
    console.log(`Worker ${process.pid} started`);
}

process.on('uncaughtException', function(error) {
  console.log('uncaughtException ' + error);
  });

  process.on('unhandledRejection', function(reason, p){
      console.log('unhandledRejection ' + reason);
  });

// init .env data
  function initEnvData()
  {
  //  let dir = path.dirname(process.execPath);
    let dir = __dirname;
    const result = require('dotenv').config({ path: dir + '/server.env' });
    if (result.error) {
      throw result.error
    }
  }
