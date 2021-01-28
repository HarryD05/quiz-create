const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  //retrieves the authorization attribute of the request made

  //if there is no authorization attribute, then the user isn't authenticated
  if (!authHeader) {
    //attaching not authenticated to the request object that will be passed onto the next functions
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(' ')[1];
  //the authorization attirbute has the template 'bearer token'
  //so this variable will be set to the jsonwebtoken that the authenticated user has

  //if there is no jsonwebtoken then the user isn't authenticated
  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }

  //Decoding the jsonwebtoken attached to the requires to get the user ID
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.secretOrKey);
  } catch (error) {
    //an invalid jsonwebtoken so they aren't authorized
    req.isAuth = false;
    return next();
  }

  //an invalid jsonwebtoken so they aren't authorized
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  //if reached here then the user has a valid jsonwebtoken
  //is authenticated is attached to the request object which will be passed onto the next functions
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
}

