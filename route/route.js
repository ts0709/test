/*
Author: Raj Kumar
Despription: This code parses the query string and body data, does validation and call db functions and other business apis
*/
const query 	  = require('../src/query');
const logMsg       = require('../common/msgLog.js');
const config 	  = require('../common/config');
const MOVIE_BASIC_LIMIT = 5;

const logName = 'route';
function log(txt) {
  if(config.logType == 1)
  {
        logMsg.log(logName, txt);
  }
  else
  {
    console.log(txt);
  }
}

  var queryData = function(fw){
  };

  queryData.getMovies = function (req, res) {
    let index = parseInt(req.query.index);
    let count = parseInt(req.query.count);
    query.getMovies(req.jwt.userId, index, count).then((data) => {
        res.send(JSON.stringify(data));
    },
    (error) =>
    {
      res.send(JSON.stringify({status:"error", msg:error}));
    }
  );
  }

queryData.createNewMovie = function (userId, title, result) {
  query.createMovie(userId, title, function(data){
    result({status:"success"});
  },
  function(error){
    result({status:"error", msg:error.msg});
  }
  );
}

queryData.createMovie = function (req, res) {
  let title = req.body.title;
  let userID = req.jwt.userId;
//  console.log(userID);
  if(req.jwt.role == 'basic')
  {
    // check for n movies limit
    query.getMovieCount(userID, function (ret)
      {
    //    console.log(ret);
        if(ret.count < MOVIE_BASIC_LIMIT)
        {
          queryData.createNewMovie(userID, title, function (data) {
            res.send(JSON.stringify(data));
          });
        }
        else
        {
          res.send(JSON.stringify({status:"error", msg:"Movie limit exceeds, present limit is " + MOVIE_BASIC_LIMIT + " movies"}));
        }
      },
      function (err)
      {
        res.send(JSON.stringify({status:"error", msg:err.msg}));
      }
    );
  }
  else
  {
    queryData.createNewMovie(userID, title, function (data) {
      res.send(JSON.stringify(data));
    });
  }
}

module.exports = queryData;
