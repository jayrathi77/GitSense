import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as comparisonService from '../services/comparison.service.js';

export const compareProfiles = asyncHandler(async (req, res) => {
  const { usernameA, usernameB } = req.body;

  if (!usernameA || !usernameB) {
    throw new ApiError(400, 'Both usernames are required');
  }

  if (usernameA === usernameB) {
    throw new ApiError(400, 'Cannot compare the same profile');
  }

  const comparison = await comparisonService.compareProfiles(usernameA, usernameB);

  return res
    .status(200)
    .json(new ApiResponse(200, comparison, 'Profiles compared successfully'));
});

export default { compareProfiles };
