import express from 'express';
import { compareProfiles } from '../controllers/comparison.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, compareProfiles);

export default router;
