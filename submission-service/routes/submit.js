import express from 'express';
import { authenticateJWT } from 'shared';
import { getSubmissions, submit } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/submit', authenticateJWT, submit);

router.get('/submissions', getSubmissions);

export default router;
