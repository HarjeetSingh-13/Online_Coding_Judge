import express from 'express';
import { authenticateJWT } from 'shared';
import { getSubmissions, submit } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/', authenticateJWT, submit);

router.get('/', getSubmissions);

export default router;
