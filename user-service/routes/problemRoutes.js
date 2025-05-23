import express from 'express';
import * as problemController from '../controllers/problemController.js';
import * as submissionController from '../controllers/submissionController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/problems', problemController.getProblems);
router.get('/problem/:id', problemController.getProblemById);
router.post('/submit', authenticateJWT, submissionController.submitSolution); 
router.get('/submissions', submissionController.getSubmissions);

export default router;