/*
Author: Raj Kumar
Despription: This code provides the business logic, interaction with DB and OMDB APIs
*/
  const logMsg    = require('../common/msgLog.js');
  const config 	  = require('../common/config');
  const models 	  = require('../common/models');
  const omdb 	    = require('./omdb');

  const querystring = require('querystring');
  const fetch       = require('node-fetch');

  const logName = 'query';
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

//Returns the list of movies for given userId
  queryData.getMovies = function (userID, index, count) {
    return new Promise((resolve, reject) => {
      console.log(userID);
        models.usermovie.aggregate([
            { $match: {userId:'' + userID} },
            {
                "$lookup": {
                    "from": "movies",
                    "localField": "imdbID",
                    "foreignField": "imdbID",
                    "as": "details"
                }
            },
            {$project: {
            details: "$details"
          }},
            {$sort: {"details.title": -1}}, { $skip: index }, {$limit: count}
         ]).exec(function(err, results){
             if(err != null)
             {
               console.log("error " + JSON.stringify(err));
               reject({error: err});
             }
             else
             {
              // console.log(results);
                resolve(results);
             }
          });
    });
  };

// seraches title in OMDB site and fetches the IMDBId,
//checks if the movie is present in the movie table if not fetch details and saves it in movie table
// If movie is already present in the DB add imdb id in usermovie table
  queryData.createMovie = function (userID, title, result, error) {
      omdb.searchMovie(title, function(data)
          {
            //check if movie imdbid is present in db, if so do not save it
            models.usermovie.find({imdbID:data.imdbID, userId: userID}, function (err, results) {
             if(err != null)
             {
               console.log("error " + JSON.stringify(err));
               error({msg: err});
             }
             else
             {
               if(results.length == 0)
               {
                 //check if movie is present in movies
                 models.movie.find({imdbID:data.imdbID}, function (err1, results1) {
                  if(err1 != null)
                  {
                    console.log("error " + JSON.stringify(err1));
                    error({msg: err1});
                  }
                  else
                  {
                    if(results1.length == 0)
                    {
                      omdb.getMovieDetails(data.imdbID, function (data1) {
                        //create movie in db
                         let dt = new Date(data1.Released);
                         var pl = new models.movie({imdbID: data.imdbID, title:data1.Title, genre: data1.Genre,
                         director:data1.Director, released:dt});
                         pl.save(function (err) {
                          if (err)
                          {
                            console.log("item save error");
                            error({msg:"Database movie add error"});
                          }
                          else {
                            //add movie id in usermovie table
                              queryData.addMovieUser(userID, data.imdbID, function (data2) { result(data2); },
                              function (err2) { error(err2); }
                            );
                          }
                        });
                      });
                    }
                    else
                    {
                      //add movie id in usermovie table
                        queryData.addMovieUser(userID, data.imdbID, function (data2) { result(data2); },
                        function (err2) { error(err2); }
                      );
                    }
                  }
                });
               }
               else
               {
                 error({msg:"Movie already present in database"});
               }
             }
            });
          },
          function(err)
          {
              error(err);
          }
        );
  };

// add movie id in usermovie table
  queryData.addMovieUser = function (userID, imdbID, result, error) {
    var pl = new models.usermovie({userId: userID, imdbID: imdbID});
    pl.save(function (err) {
     if (err)
     {
       console.log("item save error");
       error({msg:"Database movie add error"});
     }
     else {
        result({status:"success"});
     }
   });
  };

// returns the movie count for a given userID
  queryData.getMovieCount = function (userID, result, error) {
    models.usermovie.find({userId:userID}, function (err, results) {
     if(err != null)
     {
       console.log("error " + JSON.stringify(err));
       error({status:"error", msg: err});
     }
     else
     {
       result({count: results.length});
     }
    });
  };

  module.exports = queryData;
