import jwt from 'jsonwebtoken';
import nconf from 'server/config';
/**
 * JWT authentication middleware
 * Checks for a JWT header and validates the content with the local
 * JWT secret
 */

export default (req, res, next) => {
  const header = req.headers['authorization'];
  const token = header.split(' ')[1];
  jwt.verify(token, nconf.get('jwtCert'), (err, payload) => {
    if (err || !payload.canUseApi) {
      res.statusCode = 403;
      res.json({message: 'Forbidden'});
    }
    next();
  });
};
