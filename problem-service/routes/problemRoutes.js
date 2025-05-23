import express from 'express';
import * as problemController from '../controllers/problemController.js';
import multer from 'multer';

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

router.get('/', problemController.getProblems);
router.get('/:id', problemController.getProblem);
// secure routes only accessed from secure url with authentication token
router.post('/', upload.single('testcases'), problemController.createProblem);
router.put('/:id', problemController.updateProblem);
router.post('/:id', upload.single('testcases'), problemController.addTestCase);
router.delete('/:id', problemController.deleteProblem);

export default router;