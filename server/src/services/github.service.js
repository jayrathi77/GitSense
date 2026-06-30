import githubClient from '../config/githubClient.js';
import ApiError from '../utils/ApiError.js';

export const fetchUserProfile = async (username) => {
  try {
    const response = await githubClient.get(`/users/${username}`);
    return {
      avatarUrl: response.data.avatar_url,
      bio: response.data.bio,
      followers: response.data.followers,
      following: response.data.following,
      publicRepos: response.data.public_repos,
      accountCreatedAt: response.data.created_at,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new ApiError(404, `GitHub user '${username}' not found`);
    }
    throw new ApiError(500, `Failed to fetch GitHub profile: ${error.message}`);
  }
};

export const fetchUserRepos = async (username, maxRepos = 30) => {
  try {
    const repos = [];
    let page = 1;
    const perPage = 100;

    while (repos.length < maxRepos) {
      const response = await githubClient.get(`/users/${username}/repos`, {
        params: {
          page,
          per_page: perPage,
          sort: 'updated',
          direction: 'desc',
        },
      });

      if (response.data.length === 0) break;

      repos.push(...response.data);
      page++;

      if (response.data.length < perPage) break;
    }

    return repos.slice(0, maxRepos).map((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      size: repo.size,
      primaryLanguage: repo.language,
      topics: repo.topics || [],
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
    }));
  } catch (error) {
    throw new ApiError(500, `Failed to fetch repositories: ${error.message}`);
  }
};

export const fetchRepoReadme = async (owner, repo) => {
  try {
    const response = await githubClient.get(`/repos/${owner}/${repo}/readme`);
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    return {
      hasReadme: true,
      content: content.substring(0, 5000), // Limit to first 5000 chars for token efficiency
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { hasReadme: false, content: null };
    }
    return { hasReadme: false, content: null };
  }
};

export const fetchRepoLanguages = async (owner, repo) => {
  try {
    const response = await githubClient.get(`/repos/${owner}/${repo}/languages`);
    const languages = Object.keys(response.data);
    const totalBytes = Object.values(response.data).reduce((sum, bytes) => sum + bytes, 0);

    const languageDistribution = languages.map((lang) => ({
      language: lang,
      percentage: Math.round((response.data[lang] / totalBytes) * 100),
    }));

    return {
      languages,
      languageDistribution,
    };
  } catch (error) {
    return { languages: [], languageDistribution: [] };
  }
};

export const enrichRepoDetails = async (username, repos) => {
  const enrichedRepos = await Promise.all(
    repos.map(async (repo) => {
      const [readmeData, languagesData] = await Promise.all([
        fetchRepoReadme(username, repo.name),
        fetchRepoLanguages(username, repo.name),
      ]);

      return {
        ...repo,
        ...readmeData,
        ...languagesData,
      };
    })
  );

  return enrichedRepos;
};

export default {
  fetchUserProfile,
  fetchUserRepos,
  fetchRepoReadme,
  fetchRepoLanguages,
  enrichRepoDetails,
};
