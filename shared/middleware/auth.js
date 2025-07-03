import { verifyToken } from '../utils/jwt.js';

export async function authenticateJWT(req, res, next) {
 try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, please login" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    req.userId = decoded.userId;
    req.userRole = decoded.userRole;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }
}
