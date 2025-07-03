import express from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import { authenticateJWT } from 'shared';


const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/me', authenticateJWT, userController.getMe);
router.post('/change-password', authenticateJWT, userController.changePassword);
router.get('/:id', userController.getUserById);

// submission service
// submit getsubmissions 

// problem service
// create delete update add getproblems getbyid

// tags rating createdby filters(tags, rating)

// user sevice
// register login logout

// heatmap profile problemSolved 

// judge service

export default router;