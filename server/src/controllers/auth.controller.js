import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { registerUser, loginUser } from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, token } = await registerUser(name, email, password);

  return res
    .status(201)
    .json(new ApiResponse(201, { user, token }, 'User registered successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await loginUser(email, password);

  return res
    .status(200)
    .json(new ApiResponse(200, { user, token }, 'Login successful'));
});

export const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'User fetched successfully'));
});

export default { register, login, getMe };
