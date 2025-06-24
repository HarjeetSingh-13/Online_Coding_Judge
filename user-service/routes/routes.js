import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateJWT } from 'shared';


const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

export default router;