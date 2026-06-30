import ApiError from '../utils/ApiError.js';

export const prepareProfileSummary = (profileData, enrichedRepos) => {
  const totalStars = enrichedRepos.reduce((sum, repo) => sum + repo.stars, 0);
  const totalForks = enrichedRepos.reduce((sum, repo) => sum + repo.forks, 0);
  
  // Aggregate languages across all repos
  const languageMap = {};
  enrichedRepos.forEach((repo) => {
    repo.languageDistribution.forEach(({ language, percentage }) => {
      if (!languageMap[language]) {
        languageMap[language] = 0;
      }
      languageMap[language] += percentage;
    });
  });

  const languageDistribution = Object.entries(languageMap)
    .map(([language, totalPercentage]) => ({
      language,
      percentage: Math.round(totalPercentage / enrichedRepos.length),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Extract unique technologies from topics and languages
  const technologies = new Set();
  enrichedRepos.forEach((repo) => {
    repo.topics.forEach((topic) => technologies.add(topic));
    repo.languages.forEach((lang) => technologies.add(lang));
  });

  // Calculate repo growth by year
  const yearMap = {};
  enrichedRepos.forEach((repo) => {
    const year = new Date(repo.createdAt).getFullYear();
    yearMap[year] = (yearMap[year] || 0) + 1;
  });

  const repoGrowthByYear = Object.entries(yearMap)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  // Prepare repo summary for AI (limit to top 10 most relevant repos)
  const reposSummary = enrichedRepos
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 10)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stars,
      forks: repo.forks,
      primaryLanguage: repo.primaryLanguage,
      languages: repo.languages,
      topics: repo.topics,
      hasReadme: repo.hasReadme,
      readmePreview: repo.content || '',
    }));

  return {
    username: profileData.githubUsername,
    bio: profileData.profileSnapshot.bio,
    followers: profileData.profileSnapshot.followers,
    following: profileData.profileSnapshot.following,
    publicRepos: profileData.profileSnapshot.publicRepos,
    accountAge: calculateAccountAge(profileData.profileSnapshot.accountCreatedAt),
    totalStars,
    totalForks,
    reposSummary,
  };
};

export const calculateAccountAge = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const years = Math.floor((now - created) / (365.25 * 24 * 60 * 60 * 1000));
  if (years < 1) {
    const months = Math.floor((now - created) / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  return `${years} year${years !== 1 ? 's' : ''}`;
};

export const calculateChartData = (enrichedRepos, aiInsights) => {
  // Language distribution
  const languageMap = {};
  enrichedRepos.forEach((repo) => {
    repo.languageDistribution.forEach(({ language, percentage }) => {
      languageMap[language] = (languageMap[language] || 0) + percentage;
    });
  });

  const languageDistribution = Object.entries(languageMap)
    .map(([language, totalPercentage]) => ({
      language,
      percentage: Math.round(totalPercentage / enrichedRepos.length),
    }))
    .filter((item) => item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);

  // Repo growth by year
  const yearMap = {};
  enrichedRepos.forEach((repo) => {
    const year = new Date(repo.createdAt).getFullYear();
    yearMap[year] = (yearMap[year] || 0) + 1;
  });

  const repoGrowthByYear = Object.entries(yearMap)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  // Technology usage from AI recommendations
  const technologyUsage = (aiInsights.recommendedTechnologies || []).map((tech) => ({
    tech,
    count: 1,
  }));

  return {
    languageDistribution,
    repoGrowthByYear,
    technologyUsage,
  };
};

export const validateScores = (scores) => {
  const scoreKeys = [
    'overallPlacementScore',
    'backendScore',
    'frontendScore',
    'databaseScore',
    'githubPortfolioScore',
    'documentationScore',
    'projectQualityScore',
    'openSourceScore',
  ];

  for (const key of scoreKeys) {
    if (typeof scores[key] !== 'number' || scores[key] < 0 || scores[key] > 100) {
      throw new ApiError(500, `Invalid score value for ${key}`);
    }
  }

  return scores;
};

export default {
  prepareProfileSummary,
  calculateAccountAge,
  calculateChartData,
  validateScores,
};
