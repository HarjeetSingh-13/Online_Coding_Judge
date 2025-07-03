import express from 'express';
import * as problemController from '../controllers/problemController.js';
import multer from 'multer';
import { authenticateJWT } from 'shared';
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware.js';
import { optionalAuth } from '../middlewares/optionalAuthMiddleware.js';

const router = express.Router();
const upload = multer({ 
    dest: '../../uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only zip files are allowed.'));
        }
        cb(null, true);
    }, 
});

router.get('/', optionalAuth, problemController.getProblems);
router.get('/:id', optionalAuth, problemController.getProblem);

router.post('/', authenticateJWT, authorizationMiddleware, upload.single('testcases'), problemController.createProblem);
router.put('/:id', authenticateJWT, authorizationMiddleware, problemController.updateProblem);
router.post('/addtestcase/:id', authenticateJWT, authorizationMiddleware, upload.single('testcases'), problemController.addTestCase);
router.delete('/:id', authenticateJWT, authorizationMiddleware, problemController.deleteProblem);

export default router;