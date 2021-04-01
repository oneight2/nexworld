const jwt = require('jsonwebtoken');

function authToken(roles = {permissions: ['user']}) {
	return function(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if(err){
        res.status(403).send(err.toString());
      }
      if(roles.permissions.find(role => role == user.role)){
        req.user = user;
        next()
      } else {
        res.send('Unauthorized! Your session either expired or invalid. Please login with a valid account.')
      }
    })
  }
}

module.exports = {
  authToken
}