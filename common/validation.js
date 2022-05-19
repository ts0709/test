/*
Author: Raj Kumar
Despription: This code extracts the token from req header and validate, if valid calls further apis
*/

const jwt         = require('jsonwebtoken');
models            = require('./models');

var validator = function(){
};

validator.isValidJWTToken = (req, res, next) => {
  // check authorization key in header
    if (req.headers['authorization']) {
        try {
          // get token string
            let auth = req.headers['authorization'];
            const splitArray = auth.split(" ");
            if(splitArray.length < 2)
            {
              res.json({"status":"token_missing"});
              return;
            }

            let token = splitArray[1];
            if (token == '') {
                console.log('Missing token');
                res.json({"status":"token_missing"});
            } else
            {
                try {
                      var decoded = jwt.decode(token, {complete: true});
                      let salt = process.env.JWT_SECRET;
                      // verify the toekn, this also checks the validity of token, in case of invalid expired throws exception
                      req.jwt = jwt.verify(token, salt);
                      return next();
                    }
                    catch (e) {
                        console.log('exception ' + e);
                        res.json({"status":"token_expired"});
                    } finally {
                    }
            }
        } catch (err1) {
          console.log('exception ' + err1);
            res.json({"status":"token_invalid"});
        }
    } else {
      console.log('Missing token');
        res.json({"status":"token_missing"});
    }
};

module.exports = validator;
