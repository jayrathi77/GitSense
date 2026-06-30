import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

export const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );

  return { user, token };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );

  return { user, token };
};

export default { registerUser, loginUser };
