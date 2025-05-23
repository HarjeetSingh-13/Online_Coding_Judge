import { verifyToken } from '../utils/jwt.js';
import prisma from '../db/client.js';
import { getUserById } from '../services/userServices.js';

export async function authenticateJWT(req, res, next) {
 try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    const verified = verifyToken(token);
    if (!verified) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }
    // Get user id from token
    const user = await getUserById(verified.userId);
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }
}
