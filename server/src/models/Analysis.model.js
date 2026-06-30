import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    githubUsername: {
      type: String,
      required: true,
      index: true,
    },
    profileSnapshot: {
      avatarUrl: String,
      bio: String,
      followers: Number,
      following: Number,
      publicRepos: Number,
      accountCreatedAt: Date,
    },
    scores: {
      overallPlacementScore: { type: Number, min: 0, max: 100 },
      backendScore: { type: Number, min: 0, max: 100 },
      frontendScore: { type: Number, min: 0, max: 100 },
      databaseScore: { type: Number, min: 0, max: 100 },
      githubPortfolioScore: { type: Number, min: 0, max: 100 },
      documentationScore: { type: Number, min: 0, max: 100 },
      projectQualityScore: { type: Number, min: 0, max: 100 },
      openSourceScore: { type: Number, min: 0, max: 100 },
    },
    aiInsights: {
      recruiterVerdict: String,
      interviewReadiness: String,
      strengths: [String],
      weaknesses: [String],
      missingSkills: [String],
      recommendedTechnologies: [String],
      learningRoadmap: [String],
      suitableRoles: [String],
      recommendedCompanies: [String],
    },
    chartData: {
      languageDistribution: [{ language: String, percentage: Number }],
      repoGrowthByYear: [{ year: Number, count: Number }],
      technologyUsage: [{ tech: String, count: Number }],
    },
    repoSnapshotIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RepoSnapshot',
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  },
  {
    timestamps: true,
  }
);

// Index for cache lookup
analysisSchema.index({ githubUsername: 1, createdAt: -1 });

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
