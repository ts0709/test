const http       = require('http');
const fetch      = require('node-fetch');
const config 	   = require('./common/config.js');

initEnvData();

var auth_server_url = process.env.authserver_host;
var auth_server_port = process.env.authserver_port;

var movie_server_url = process.env.movieserver_host;
var movie_server_port = process.env.movieserver_port;

var Titles = [
  "Batman",
  "Batman: Gotham Knight 1111",  // wrong title, it should show error title not found or limit exceeds error
  "Batman: Year One",
  "Batman Beyond",
  "Batman: Mask of the Phantasm",
  "Batman: The Killing Joke",
  "Batman: The Dark Knight Returns, Part 2",
  "Batman: Gotham Knight"
  ];
var user_Type = ["basic", "premium"];

setTimeout(()=>
{
  // basic user type test cases
  runTest(user_Type[0]);
}, 1000);

setTimeout(()=>
{
  // premium user type test cases
  runTest(user_Type[1]);
}, 15000);

setTimeout(()=>
{
  console.log("--------------------------------------");
  console.log("Test execution Done!");
}, 30000);

function runTest(userType)
{
      getAuthToken(userType, function (tokenObj) {
        if(tokenObj == null)
        {
            console.log("Unable to get the auth token, check if server is running");
            process.exit(0);
        }
      //  console.log(tokenObj);
        if(tokenObj.status == 'success')
        {
          setTimeout(()=>
          {
            // add title in db
              executeTest(true, userType, tokenObj);
          }, 1000);

          setTimeout(()=>
          {
            // get movies of this user type
              executeTest(false, userType, tokenObj);
          }, 10000);
        }
        else
        {
          console.log("Error in getting auth token");
          console.log(tokenObj.msg);
        //  exit(0);
        }
      });
}

function executeTest(bCreate, userType, tokenObj)
{
  console.log('USER_TYPE: '+ userType + "\n");
  if(bCreate == false)
  {
    console.log('Get movie records for user type: '+ userType + "\n");
    getMovies('Bearer ' + tokenObj.data.token, (result)=>{
        console.log('Total movies: ' + result.length);
        for(let i = 0; i < result.length; i++)
        {
            console.log(result[i].details[0]);
        }

     });
  }
  else
  {
    if(userType == 'basic')
    {
      console.log('Upto 5 title should be added successfully, after that it should show limit error');
    }
    else
    {
      console.log('Any number of title should be added successfully');
    }

   for(let j = 0; j < Titles.length; j++)
   {
     setTimeout((counter)=>
     {
          console.log('Adding title \'' + Titles[counter] + "\'");
          if(userType == 'basic')
           {
             if(counter == 1)
             {
               console.log('Should show error title not found or limit exceeds');

             }
             else if(counter < 6)
             {
               console.log('Should be added successfully');
             }
             else {
               console.log('Should show limit error');
             };
           }
           else
           {
             if(counter == 1)
             {
               console.log('Should show error title not found');
             }
             else {
               console.log('Should be added successfully');
             };
           }

           createMovie( userType, Titles[counter], 'Bearer ' + tokenObj.data.token, (result)=>{

               if(result == null)
               {
                   console.log("Unable to connect movie service, check if server is running");
                   process.exit(0);
               }

               if(result.status == 'success')
               {
                 console.log('added successfully');
               }
               else
               {
                 console.log(result);
               }
           } );
      }, j*1000, j);
   }
  }
}
//create movie in movie server
function createMovie( userType, title, token, result )
{
    let dataString = JSON.stringify({"title": title});
    // prepare the header
    var postheaders = {
      'Authorization' : token,
      'Content-Type' : 'application/json',
      'Content-Length' : Buffer.byteLength(dataString, 'utf8')
    };

  // the post options
  var optionspost = {
      host : movie_server_url,
      port : movie_server_port,
      path : '/movies',
      method : 'POST',
      headers : postheaders
  };

  var reqPost = http.request(optionspost, function(res) {
      res.on('data', function(d) {
        //  console.log('POST result:\n' + d);
          let tok = JSON.parse(d);
          result(tok);
      });
  });

  // write the json data
  reqPost.write(dataString);
  reqPost.end();
  reqPost.on('error', function(e) {
    //  console.log(e);
      let err = JSON.parse(e);
      result(err)
  });
}

//create movie in movie server
function getMovies( token, result )
{
    let dataString = JSON.stringify({});
    // prepare the header
    var postheaders = {
      'Authorization' : token,
      'Content-Type' : 'application/json',
      'Content-Length' : Buffer.byteLength(dataString, 'utf8')
    };

  // the post options
  var optionspost = {
      host : movie_server_url,
      port : movie_server_port,
      path : '/movies?index=0&count=10',
      method : 'GET',
      headers : postheaders
  };

  var reqPost = http.request(optionspost, function(res) {
      res.on('data', function(d) {
        //  console.log('POST result:\n' + d);
          let tok = JSON.parse(d);
          result(tok);
      });
  });

  // write the json data
  reqPost.write(dataString);
  reqPost.end();
  reqPost.on('error', function(e) {
    //  console.log(e);
      let err = JSON.parse(e);
      result(err)
  });
}

// Get auth tokens from auth server
function getAuthToken( userType, result )
{
  let dataJSON = {};
  if(userType == 'basic')
  {
    dataJSON =  { "username": "basic-thomas",
                  "password": "sR-_pcoow-27-6PAwCD8" };
  }
  else
  {
    dataJSON =  { "username": "premium-jim",
                  "password": "GBLtTyq3E_UNjFnpo9m6" };
  }

  let dataString = JSON.stringify(dataJSON);
  // prepare the header
  var postheaders = {
    'Content-Type' : 'application/json',
    'Content-Length' : Buffer.byteLength(dataString, 'utf8')
  };

// the post options
var optionspost = {
    host : auth_server_url,
    port : auth_server_port,
    path : '/auth',
    method : 'POST',
    headers : postheaders
};

var reqPost = http.request(optionspost, function(res) {
    res.on('data', function(d) {
      //  console.log('POST result:\n' + d);
        let tok = JSON.parse(d);
        result({status:'success', data:tok});
    });
});

// write the json data
reqPost.write(dataString);
reqPost.end();
reqPost.on('error', function(e) {
  //  console.log(e);
    result(null, {status:'failed', msg: e})
});
}

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
