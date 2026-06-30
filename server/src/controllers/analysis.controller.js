import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Analysis from '../models/Analysis.model.js';
import RepoSnapshot from '../models/RepoSnapshot.model.js';
import * as githubService from '../services/github.service.js';
import * as geminiService from '../services/gemini.service.js';
import * as scoringService from '../services/scoring.service.js';
import logger from '../utils/logger.js';

export const analyzeProfile = asyncHandler(async (req, res) => {
  const { username } = req.body;
  const userId = req.user._id;

  // Check for cached analysis (not expired)
  const cachedAnalysis = await Analysis.findOne({
    githubUsername: username,
    requestedBy: userId,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (cachedAnalysis) {
    logger.info('Returning cached analysis', { username, userId });
    return res
      .status(200)
      .json(new ApiResponse(200, { ...cachedAnalysis.toObject(), isCached: true, lastAnalyzed: cachedAnalysis.createdAt }, 'Analysis retrieved from cache'));
  }

  // Fetch GitHub data
  logger.info('Generating fresh analysis', { username, userId });
  const profileSnapshot = await githubService.fetchUserProfile(username);
  const repos = await githubService.fetchUserRepos(username, 30);
  const enrichedRepos = await githubService.enrichRepoDetails(username, repos);

  // Prepare summary for AI
  const profileSummary = scoringService.prepareProfileSummary(
    { githubUsername: username, profileSnapshot },
    enrichedRepos
  );

  // Get AI analysis
  const aiAnalysis = await geminiService.analyzeWithGemini(profileSummary, profileSummary.reposSummary);

  // Validate scores
  const validatedScores = scoringService.validateScores(aiAnalysis.scores);

  // Calculate chart data
  const chartData = scoringService.calculateChartData(enrichedRepos, aiAnalysis);

  // Create analysis document
  const analysis = await Analysis.create({
    requestedBy: userId,
    githubUsername: username,
    profileSnapshot,
    scores: validatedScores,
    aiInsights: {
      recruiterVerdict: aiAnalysis.recruiterVerdict,
      interviewReadiness: aiAnalysis.interviewReadiness,
      strengths: aiAnalysis.strengths,
      weaknesses: aiAnalysis.weaknesses,
      missingSkills: aiAnalysis.missingSkills,
      recommendedTechnologies: aiAnalysis.recommendedTechnologies,
      learningRoadmap: aiAnalysis.learningRoadmap,
      suitableRoles: aiAnalysis.suitableRoles,
      recommendedCompanies: aiAnalysis.recommendedCompanies,
    },
    chartData,
  });

  // Create repo snapshots
  const repoSnapshots = await RepoSnapshot.insertMany(
    enrichedRepos.map((repo) => ({
      analysisId: analysis._id,
      repoName: repo.name,
      description: repo.description,
      stars: repo.stars,
      forks: repo.forks,
      size: repo.size,
      primaryLanguage: repo.primaryLanguage,
      languages: repo.languages,
      topics: repo.topics,
      hasReadme: repo.hasReadme,
      readmeQualityNote: repo.hasReadme ? 'README present' : 'No README',
      lastUpdated: repo.updatedAt,
    }))
  );

  // Update analysis with repo snapshot IDs
  analysis.repoSnapshotIds = repoSnapshots.map((snapshot) => snapshot._id);
  await analysis.save();

  return res
    .status(201)
    .json(new ApiResponse(201, { ...analysis.toObject(), isCached: false }, 'Analysis completed successfully'));
});

export const getAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const analysis = await Analysis.findOne({
    _id: id,
    requestedBy: userId,
  }).populate('repoSnapshotIds');

  if (!analysis) {
    throw new ApiError(404, 'Analysis not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, analysis, 'Analysis retrieved successfully'));
});

export default { analyzeProfile, getAnalysis };
