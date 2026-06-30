import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const buildAnalysisPrompt = (profileData, reposSummary) => {
  return `You are an expert technical recruiter and code reviewer. Analyze this GitHub profile and provide a comprehensive evaluation.

PROFILE DATA:
- Username: ${profileData.username}
- Bio: ${profileData.bio || 'No bio'}
- Followers: ${profileData.followers}
- Following: ${profileData.following}
- Public Repositories: ${profileData.publicRepos}
- Account Age: ${profileData.accountAge}

TOP REPOSITORIES (by stars/activity):
${reposSummary.map((repo, i) => `
${i + 1}. ${repo.name}
   - Description: ${repo.description || 'No description'}
   - Stars: ${repo.stars}, Forks: ${repo.forks}
   - Primary Language: ${repo.primaryLanguage || 'Unknown'}
   - Languages: ${repo.languages.join(', ') || 'None detected'}
   - Topics: ${repo.topics.join(', ') || 'None'}
   - Has README: ${repo.hasReadme ? 'Yes' : 'No'}
   ${repo.hasReadme ? `- README Preview: ${repo.readmePreview.substring(0, 200)}...` : ''}
`).join('\n')}

TASK: Provide a JSON analysis with the following structure:
{
  "scores": {
    "overallPlacementScore": 0-100,
    "backendScore": 0-100,
    "frontendScore": 0-100,
    "databaseScore": 0-100,
    "githubPortfolioScore": 0-100,
    "documentationScore": 0-100,
    "projectQualityScore": 0-100,
    "openSourceScore": 0-100
  },
  "recruiterVerdict": "Brief 2-3 sentence verdict from a recruiter's perspective",
  "interviewReadiness": "Assessment of readiness for technical interviews (Ready/Needs Preparation/Not Ready)",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "recommendedTechnologies": ["tech1", "tech2", ...],
  "learningRoadmap": ["Day 1-5: ...", "Day 6-10: ...", "Day 11-20: ...", "Day 21-30: ..."],
  "suitableRoles": ["role1", "role2", ...],
  "recommendedCompanies": ["company1", "company2", ...]
}

SCORING CRITERIA:
- overallPlacementScore: Composite score indicating overall employability and placement potential
- backendScore: Evidence of backend skills (APIs, databases, server-side logic, microservices)
- frontendScore: Evidence of frontend skills (UI/UX, frameworks, responsive design, state management)
- databaseScore: Evidence of database skills (SQL, NoSQL, ORM, data modeling, query optimization)
- githubPortfolioScore: Quality and consistency of GitHub portfolio (activity, variety, presentation)
- documentationScore: Quality of READMEs, code comments, and project descriptions
- projectQualityScore: Code quality, architecture patterns, best practices in projects
- openSourceScore: Contributions to open source, community engagement, collaborative development

IMPORTANT: Return ONLY valid JSON. No markdown formatting, no explanations outside the JSON. The response must be parseable by JSON.parse().`;
};

export const analyzeWithGemini = async (profileData, reposSummary) => {
  try {
    const prompt = buildAnalysisPrompt(profileData, reposSummary);

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    // Clean the response - remove markdown code blocks if present
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

    // Parse JSON
    const analysis = JSON.parse(cleanedText);

    // Validate structure
    if (!analysis.scores || !analysis.strengths || !analysis.weaknesses) {
      throw new ApiError(500, 'Invalid AI response structure');
    }

    return analysis;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ApiError(500, 'Failed to parse AI response as JSON');
    }
    if (error.status === 401) {
      throw new ApiError(401, 'Invalid Gemini API key');
    }
    if (error.status === 429) {
      throw new ApiError(429, 'Gemini API rate limit exceeded');
    }
    throw new ApiError(500, `AI analysis failed: ${error.message}`);
  }
};

export default {
  analyzeWithGemini,
};
