import express from 'express';
import { getUserHistory } from '../controllers/history.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyJWT, getUserHistory);

export default router;
