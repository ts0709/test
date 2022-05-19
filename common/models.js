/*
Author: Raj Kumar
Despription: This code creates the mongo DB schema
*/

var mongoose = require("mongoose");
const config = require('./config');
const conn = require('./dbconnection');

const Schema = mongoose.Schema;
var exportSchema = function(schm){
};

class Model {
    constructor(name, data) {
        this.data = data;
        return this.connection().model(name, data.schema);
    }

    connection() {
        if (this.data.connection) {
            return connection.on(this.data.connection);
        }

        return connection;
    }
}

function convertSecsToDate(d)
{
  try {
    let d1 = new Date();
    d1.setTime(d);
    return d1;
  } catch (e) {
    return;
  }
}

/*
Movie schema store the movie details
*/
const movie = new Schema({
  imdbID: {type: String, required: true, unique: true, index: true},
  title:{type: String},
  genre:{type: String},
  director:{type: String},
  released:{type: Date, default: Date.now, set: d => convertSecsToDate(d)}
}, {versionKey: false});

/*
  userMovie schema keeps track of which movies belongs to user
*/
const usermovie = new Schema({
  userId: {type: String, required: true, index: true},
  imdbID: {type: String, required: true}
}, {versionKey: false});

let con = conn;
config.mongo = conn;

exportSchema.movie = con.model("movies", movie);
exportSchema.usermovie = con.model("usermovies", usermovie);

module.exports = exportSchema;
