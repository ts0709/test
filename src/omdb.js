/*
Author: Raj Kumar
Despription: This code provides the business logic, interaction with OMDB APIs
*/
  const logMsg    = require('../common/msgLog.js');
  const config 	  = require('../common/config');
  const models 	  = require('../common/models');
  const querystring = require('querystring');
  const fetch      = require('node-fetch');

  const logName = 'omdb';
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

  var queryData = function(fw){};

// it serches the omdbapi.com finds the imdbID
  queryData.searchMovie = function (title, result, error) {
    const q = querystring.stringify({s:title});
    let url = config.OMDB_API_URL + process.env.OMDb_APIKEY + "&" + q;

    fetch(url)
    .then(res => res.json())
    .then(json => {
      if(json.hasOwnProperty("Search") == true)
      {
        let search = json.Search;
        if(search.length > 0)
        {
          if(search[0].hasOwnProperty("imdbID") == true)
          {
            result({imdbID: search[0].imdbID});
          }
          else {
            error({"msg":"imdbID not found"});
          }
        }
        else
        {
          error({"msg":"Search result not found"});
        }
      }
      else {
        error({"msg":"Search result not found"});
      }

    });
  }

  // Fetch the movie details for the given imdbID
    queryData.getMovieDetails = function (imdbID, result) {
      let url = config.OMDB_API_URL  + process.env.OMDb_APIKEY + "&i=" + imdbID;
      fetch(url)
      .then(res => res.json())
      .then(json => {
        result(json);
      });
    }

  module.exports = queryData;
