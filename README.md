# Node.js Task

This is node.js test app to build Movie API. It provides two endpoints:

1. `POST /movies`
   1. Allows creating a movie object based on movie title passed in the request body
   2. Based on the title additional movie details should be fetched from
      https://omdbapi.com/ and saved to the database. Data we would like you to
      fetch from OMDb API:
   ```
     Title: string
     Released: date
     Genre: string
     Director: string
   ```
   3. Only authorized users can create a movie.
   4. `Basic` users are restricted to create 5 movies per month (calendar
      month). `Premium` users have no limits.
1. `GET /movies`
   1. Should fetch a list of all movies created by an authorized user.


Authorization JWT token is passed in request header authorization key as below

```
Authorization: Bearer <token>
```

# Authorization service

Authorization JWT tokens are generated from auth service.

## Prerequisites

You need to have `NodeJS`, `docker` and `docker-compose` installed on your computer to run the service

## Run locally

1. Clone this repository
1. Run from root dir

```
JWT_SECRET=secret OMDb_APIKEY=80c497b8 docker-compose up -d --build

```

The movie service starts on port `8500`
The auth service starts on port `3000`

To stop the movie service run

```
docker-compose down
```

## JWT Secret

To verify the tokens in Movie service `JWT_SECRET` is needed in env variable.
It should be a string value and also needed in
the Auth service.

## OMDB APIKEY

To search title and fetch the movie data in movie service you need to provide env variable
`OMDb_APIKEY`. It should be a string value. for testing purpose you can use 80c497b8 or generate one from https://omdbapi.com/

## We have tested with following Users

The auth service defines two user accounts that I am going to use for testing

1. `Basic` user

```
 username: 'basic-thomas'
 password: 'sR-_pcoow-27-6PAwCD8'
```

1. `Premium` user

```
username: 'premium-jim'
password: 'GBLtTyq3E_UNjFnpo9m6'
```

## Token payload

Decoding the auth token gives access to basic information about the
user, including its role.

```
{
  "userId": 123,
  "name": "Basic Thomas",
  "role": "basic",
  "iat": 1606221838,
  "exp": 1606223638,
  "iss": "https://www.netguru.com/",
  "sub": "123"
}
```

## Example request

To authorize user calls the auth service using for example `curl`.

Request

```
curl --location --request POST '0.0.0.0:3000/auth' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "basic-thomas",
    "password": "sR-_pcoow-27-6PAwCD8"
}'
```

Response

```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywibmFtZSI6IkJhc2ljIFRob21hcyIsInJvbGUiOiJiYXNpYyIsImlhdCI6MTYwNjIyMTgzOCwiZXhwIjoxNjA2MjIzNjM4LCJpc3MiOiJodHRwczovL3d3dy5uZXRndXJ1LmNvbS8iLCJzdWIiOiIxMjMifQ.KjZ3zZM1lZa1SB8U-W65oQApSiC70ePdkQ7LbAhpUQg"
}
```

## Testing
The project contains test.js file, to test the solution simply run the following command
1) Launch command prompt, change the directory to project root dir
2) Change the server.env file to point the right auth and server IP and port number
3) run command node test

Test result: test result is shown on the console, wait till you see 'Test execution Done!' message ( it takes aprox 30 sec )

Example test result: test result console dump in `TestConsoleDump.odt` file, located in root folder
## APIs

There are two APIs
## API 1
url: http://localhost:8500/movies
Method: /movies ( POST )
Body JSON:
```
{
"title":"Batman: Mask of the Phantasm"
}
```

Response JSON: returns the execution status success or error
success case
```
{
  "status": "success"
}
```

Error case
```
{
  "status": "error",
  "msg": "Movie limit exceeds, present limit is 5 movies"
}
```

## API 2
url: http://localhost:8500/movies?index=2&count=10
Method: /movies  ( GET )
Query string: ?index=0&count=10
where index is the starting record index and count is the number of records t fetch

Response JSON: returns the array of movie objects
```
[
  {
    _id: '6284eab373f5fc331c2b044b',
    userId: '434',
    imdbID: 'tt0147746',
    title: 'Batman Beyond',
    genre: 'Animation, Action, Adventure',
    director: 'N/A',
    released: '1999-01-09T18:30:00.000Z'
  },
  {
    _id: '6284eab073f5fc331c2b0445',
    userId: '434',
    imdbID: 'tt0372784',
    title: 'Batman Begins',
    genre: 'Action, Crime, Drama',
    director: 'Christopher Nolan',
    released: '2005-06-14T18:30:00.000Z'
  }
]
```

## Token verification errors
If passed token is valid server allows the API execution and return the result,
in case of token missing, invalid or expired following error response is returned

expired token case
```
{
  "status": "token_expired"
}
```

Invalid token case
```
{
  "status": "token_invalid"
}
```

Missing token case
```
{
  "status": "token_missing"
}
```
