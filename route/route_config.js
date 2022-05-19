/*
Author: Raj Kumar
Despription: This code creates route mapping, injects the middleware to check the token
*/
const qData 	               = require('./route');
const ValidateMiddleware    = require('../common/validation');

exports.route = function(app){

  app.route('/movies')
  .get([
    ValidateMiddleware.isValidJWTToken,
    qData.getMovies
  ])
  .post([
    ValidateMiddleware.isValidJWTToken,
    qData.createMovie
  ]);
};
