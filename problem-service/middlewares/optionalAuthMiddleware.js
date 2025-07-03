import jwt from 'jsonwebtoken';

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    } catch (err) {
      req.userId = null;
    }
  } else {
    req.userId = null;
  }

  next();
}
