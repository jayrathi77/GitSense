import * as githubService from './github.service.js';
import * as geminiService from './gemini.service.js';
import * as scoringService from './scoring.service.js';
import ApiError from '../utils/ApiError.js';

export const compareProfiles = async (usernameA, usernameB) => {
  // Fetch data for both profiles
  const [profileA, profileB] = await Promise.all([
    fetchProfileData(usernameA),
    fetchProfileData(usernameB),
  ]);

  // Generate AI comparison summary
  const comparisonSummary = await generateComparisonSummary(profileA, profileB);

  return {
    profileA,
    profileB,
    comparisonSummary,
  };
};

const fetchProfileData = async (username) => {
  try {
    const profileSnapshot = await githubService.fetchUserProfile(username);
    const repos = await githubService.fetchUserRepos(username, 30);
    const enrichedRepos = await githubService.enrichRepoDetails(username, repos);

    const profileSummary = scoringService.prepareProfileSummary(
      { githubUsername: username, profileSnapshot },
      enrichedRepos
    );

    const aiAnalysis = await geminiService.analyzeWithGemini(profileSummary, profileSummary.reposSummary);
    const validatedScores = scoringService.validateScores(aiAnalysis.scores);

    return {
      username,
      profileSnapshot,
      scores: validatedScores,
      enrichedRepos,
      totalStars: enrichedRepos.reduce((sum, repo) => sum + repo.stars, 0),
      totalForks: enrichedRepos.reduce((sum, repo) => sum + repo.forks, 0),
      languages: getLanguageStats(enrichedRepos),
    };
  } catch (error) {
    throw new ApiError(404, `Failed to fetch profile for ${username}: ${error.message}`);
  }
};

const getLanguageStats = (repos) => {
  const languageMap = {};
  repos.forEach((repo) => {
    repo.languageDistribution.forEach(({ language, percentage }) => {
      languageMap[language] = (languageMap[language] || 0) + percentage;
    });
  });

  return Object.entries(languageMap)
    .map(([language, totalPercentage]) => ({
      language,
      percentage: Math.round(totalPercentage / repos.length),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
};

const generateComparisonSummary = async (profileA, profileB) => {
  const prompt = `You are an expert technical recruiter. Compare these two GitHub profiles and provide a comprehensive analysis.

PROFILE A: ${profileA.username}
- Followers: ${profileA.profileSnapshot.followers}
- Following: ${profileA.profileSnapshot.following}
- Public Repos: ${profileA.profileSnapshot.publicRepos}
- Total Stars: ${profileA.totalStars}
- Total Forks: ${profileA.totalForks}
- Overall Placement Score: ${profileA.scores.overallPlacementScore}
- Backend Score: ${profileA.scores.backendScore}
- Frontend Score: ${profileA.scores.frontendScore}
- Documentation Score: ${profileA.scores.documentationScore}
- Project Quality Score: ${profileA.scores.projectQualityScore}
- Top Languages: ${profileA.languages.map(l => l.language).join(', ')}

PROFILE B: ${profileB.username}
- Followers: ${profileB.profileSnapshot.followers}
- Following: ${profileB.profileSnapshot.following}
- Public Repos: ${profileB.profileSnapshot.publicRepos}
- Total Stars: ${profileB.totalStars}
- Total Forks: ${profileB.totalForks}
- Overall Placement Score: ${profileB.scores.overallPlacementScore}
- Backend Score: ${profileB.scores.backendScore}
- Frontend Score: ${profileB.scores.frontendScore}
- Documentation Score: ${profileB.scores.documentationScore}
- Project Quality Score: ${profileB.scores.projectQualityScore}
- Top Languages: ${profileB.languages.map(l => l.language).join(', ')}

TASK: Provide a JSON comparison with the following structure:
{
  "winner": "Profile A" or "Profile B" or "Tie",
  "overallVerdict": "Brief 2-3 sentence overall verdict",
  "categoryWinners": {
    "repositories": "Profile A" or "Profile B",
    "stars": "Profile A" or "Profile B",
    "forks": "Profile A" or "Profile B",
    "followers": "Profile A" or "Profile B",
    "following": "Profile A" or "Profile B",
    "backendSkills": "Profile A" or "Profile B",
    "frontendSkills": "Profile A" or "Profile B",
    "documentation": "Profile A" or "Profile B",
    "projectQuality": "Profile A" or "Profile B",
    "placementScore": "Profile A" or "Profile B"
  },
  "keyDifferences": ["difference1", "difference2", ...],
  "recommendation": "Which profile is stronger and why"
}

IMPORTANT: Return ONLY valid JSON. No markdown formatting, no explanations outside the JSON.`;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const config = await import('../config/env.js');
    const genAI = new GoogleGenerativeAI(config.default.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const comparison = JSON.parse(cleanedText);

    if (!comparison.winner || !comparison.categoryWinners) {
      throw new ApiError(500, 'Invalid AI comparison response structure');
    }

    return comparison;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ApiError(500, 'Failed to parse AI comparison response as JSON');
    }
    throw new ApiError(500, `AI comparison failed: ${error.message}`);
  }
};

export default {
  compareProfiles,
};
