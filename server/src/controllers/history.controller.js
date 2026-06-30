import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Analysis from '../models/Analysis.model.js';

export const getUserHistory = asyncHandler(async (req, res) => {
  const analyses = await Analysis.find({ requestedBy: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('githubUsername scores createdAt profileSnapshot');

  return res
    .status(200)
    .json(new ApiResponse(200, analyses, 'History fetched successfully'));
});

export default { getUserHistory };
