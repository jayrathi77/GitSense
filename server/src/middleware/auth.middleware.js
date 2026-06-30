import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decodedToken.userId).select('-password');

    if (!user) {
      throw new ApiError(401, 'Invalid access token');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, error?.message || 'Invalid access token'));
  }
};

export default verifyJWT;
