import mongoose from 'mongoose';

const repoSnapshotSchema = new mongoose.Schema(
  {
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      required: true,
      index: true,
    },
    repoName: {
      type: String,
      required: true,
    },
    description: String,
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    size: Number,
    primaryLanguage: String,
    languages: [String],
    topics: [String],
    hasReadme: { type: Boolean, default: false },
    readmeQualityNote: String,
    lastUpdated: Date,
  },
  {
    timestamps: true,
  }
);

const RepoSnapshot = mongoose.model('RepoSnapshot', repoSnapshotSchema);

export default RepoSnapshot;
