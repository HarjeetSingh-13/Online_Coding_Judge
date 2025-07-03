import express from 'express';
import { authenticateJWT } from 'shared';
import { getSubmissions, submit,getSubmissionById, getSubmissionByUserId, getSubmissionByProblemId, getSubmissionByUserIdAndProblemId, getStatus } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/', authenticateJWT, submit);

router.get('/', getSubmissions);

router.get('/user/:id', getSubmissionByUserId);

router.get('/problem/:id', getSubmissionByProblemId); 

router.get('/user/:userId/problem/:problemId', getSubmissionByUserIdAndProblemId);

router.get('/status', authenticateJWT, getStatus);

router.get('/:id', getSubmissionById);


export default router;
