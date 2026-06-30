import express from 'express';
import { analyzeProfile, getAnalysis } from '../controllers/analysis.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { analyzeSchema } from '../validators/analysis.validator.js';

const router = express.Router();

router.post('/', verifyJWT, validate(analyzeSchema), analyzeProfile);
router.get('/:id', verifyJWT, getAnalysis);

export default router;
