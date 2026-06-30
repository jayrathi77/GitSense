import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { compareProfiles } from '../api/comparisonApi';
import { ArrowLeft, Search, Trophy, TrendingUp, Users, GitFork, Star, Code, FileText, Zap, Github } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Compare = () => {
  const navigate = useNavigate();
  const [usernameA, setUsernameA] = useState('');
  const [usernameB, setUsernameB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState(null);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!usernameA.trim() || !usernameB.trim()) return;

    setError('');
    setLoading(true);

    try {
      const response = await compareProfiles(usernameA, usernameB);
      setComparison(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const getWinnerBadge = (winner) => {
    if (winner === 'Profile A') return '🏆 Profile A';
    if (winner === 'Profile B') return '🏆 Profile B';
    return '🤝 Tie';
  };

  const getWinnerClass = (category, winner) => {
    if (winner === 'Tie') return 'bg-gray-100 dark:bg-gray-800';
    return winner === 'Profile A' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
  };

  if (comparison) {
    const { profileA, profileB, comparisonSummary } = comparison;

    const scoreComparisonData = [
      { category: 'Overall', ProfileA: profileA.scores.overallPlacementScore, ProfileB: profileB.scores.overallPlacementScore },
      { category: 'Backend', ProfileA: profileA.scores.backendScore, ProfileB: profileB.scores.backendScore },
      { category: 'Frontend', ProfileA: profileA.scores.frontendScore, ProfileB: profileB.scores.frontendScore },
      { category: 'Documentation', ProfileA: profileA.scores.documentationScore, ProfileB: profileB.scores.documentationScore },
      { category: 'Project Quality', ProfileA: profileA.scores.projectQualityScore, ProfileB: profileB.scores.projectQualityScore },
    ];

    const categoryData = [
      { label: 'Repositories', icon: <Code className="h-4 w-4" />, valueA: profileA.profileSnapshot.publicRepos, valueB: profileB.profileSnapshot.publicRepos, winner: comparisonSummary.categoryWinners.repositories },
      { label: 'Stars', icon: <Star className="h-4 w-4" />, valueA: profileA.totalStars, valueB: profileB.totalStars, winner: comparisonSummary.categoryWinners.stars },
      { label: 'Forks', icon: <GitFork className="h-4 w-4" />, valueA: profileA.totalForks, valueB: profileB.totalForks, winner: comparisonSummary.categoryWinners.forks },
      { label: 'Followers', icon: <Users className="h-4 w-4" />, valueA: profileA.profileSnapshot.followers, valueB: profileB.profileSnapshot.followers, winner: comparisonSummary.categoryWinners.followers },
      { label: 'Following', icon: <Users className="h-4 w-4" />, valueA: profileA.profileSnapshot.following, valueB: profileB.profileSnapshot.following, winner: comparisonSummary.categoryWinners.following },
      { label: 'Backend Skills', icon: <Zap className="h-4 w-4" />, valueA: profileA.scores.backendScore, valueB: profileB.scores.backendScore, winner: comparisonSummary.categoryWinners.backendSkills },
      { label: 'Frontend Skills', icon: <Zap className="h-4 w-4" />, valueA: profileA.scores.frontendScore, valueB: profileB.scores.frontendScore, winner: comparisonSummary.categoryWinners.frontendSkills },
      { label: 'Documentation', icon: <FileText className="h-4 w-4" />, valueA: profileA.scores.documentationScore, valueB: profileB.scores.documentationScore, winner: comparisonSummary.categoryWinners.documentation },
      { label: 'Project Quality', icon: <TrendingUp className="h-4 w-4" />, valueA: profileA.scores.projectQualityScore, valueB: profileB.scores.projectQualityScore, winner: comparisonSummary.categoryWinners.projectQuality },
      { label: 'Placement Score', icon: <Trophy className="h-4 w-4" />, valueA: profileA.scores.overallPlacementScore, valueB: profileB.scores.overallPlacementScore, winner: comparisonSummary.categoryWinners.placementScore },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setComparison(null);
                  setUsernameA('');
                  setUsernameB('');
                }}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                New Comparison
              </motion.button>
              <div className="text-sm text-gray-400">
                Profile Comparison
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overall Winner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Overall Winner</h2>
                <p className="text-blue-100 text-lg">{comparisonSummary.overallVerdict}</p>
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-5xl font-bold text-white"
              >
                {getWinnerBadge(comparisonSummary.winner)}
              </motion.div>
            </div>
          </motion.div>

          {/* Profile Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {/* Profile A */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-2xl shadow-2xl border-2 p-6 ${comparisonSummary.winner === 'Profile A' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700/50 bg-gray-800/50 backdrop-blur-xl'}`}
            >
              <div className="flex items-center mb-4">
                <div className="relative">
                  <img
                    src={profileA.profileSnapshot.avatarUrl}
                    alt={profileA.username}
                    className="h-20 w-20 rounded-full ring-4 ring-gray-700"
                  />
                  {comparisonSummary.winner === 'Profile A' && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">{profileA.username}</h3>
                  {profileA.profileSnapshot.bio && (
                    <p className="text-sm text-gray-400">{profileA.profileSnapshot.bio}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400">Followers</p>
                  <p className="font-semibold text-white">{profileA.profileSnapshot.followers}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400">Following</p>
                  <p className="font-semibold text-white">{profileA.profileSnapshot.following}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400">Repositories</p>
                  <p className="font-semibold text-white">{profileA.profileSnapshot.publicRepos}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400">Total Stars</p>
                  <p className="font-semibold text-white">{profileA.totalStars}</p>
                </div>
              </div>
            </motion.div>

            {/* Profile B */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-2xl shadow-2xl border-2 p-6 ${comparisonSummary.winner === 'Profile B' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700/50 bg-gray-800/50 backdrop-blur-xl'}`}
            >
              <div className="flex items-center mb-4">
                <div className="relative">
                  <img
                    src={profileB.profileSnapshot.avatarUrl}
                    alt={profileB.username}
                    className="h-20 w-20 rounded-full ring-4 ring-gray-700"
                  />
                  {comparisonSummary.winner === 'Profile B' && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">{profileB.username}</h3>
                  {profileB.profileSnapshot.bio && (
                    <p className="text-sm text-gray-400">{profileB.profileSnapshot.bio}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400">Followers</p>
                  <p className="font-semibold text-white">{profileB.profileSnapshot.followers}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400">Following</p>
                  <p className="font-semibold text-white">{profileB.profileSnapshot.following}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400">Repositories</p>
                  <p className="font-semibold text-white">{profileB.profileSnapshot.publicRepos}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400">Total Stars</p>
                  <p className="font-semibold text-white">{profileB.totalStars}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Score Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Score Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Bar dataKey="ProfileA" fill="#3B82F6" name={profileA.username} radius={[4, 4, 0, 0]} />
                <Bar dataKey="ProfileB" fill="#8B5CF6" name={profileB.username} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Comparisons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    category.winner === 'Profile A' 
                      ? 'border-blue-500/50 bg-blue-500/10' 
                      : category.winner === 'Profile B' 
                      ? 'border-purple-500/50 bg-purple-500/10' 
                      : 'border-gray-700/50 bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-400">{category.icon}</div>
                    <span className="font-medium text-white">{category.label}</span>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Profile A</p>
                      <p className="font-semibold text-white">{category.valueA}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Profile B</p>
                      <p className="font-semibold text-white">{category.valueB}</p>
                    </div>
                    <div className="text-sm font-bold">
                      {category.winner === 'Profile A' && <span className="text-blue-400">🏆 A</span>}
                      {category.winner === 'Profile B' && <span className="text-purple-400">🏆 B</span>}
                      {category.winner === 'Tie' && <span className="text-gray-400">🤝 Tie</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Key Differences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Key Differences</h3>
            <ul className="space-y-3">
              {comparisonSummary.keyDifferences?.map((difference, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="flex items-start text-gray-300"
                >
                  <span className="text-blue-400 mr-3 mt-1">•</span>
                  {difference}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
              Recommendation
            </h3>
            <p className="text-gray-300">{comparisonSummary.recommendation}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Compare GitHub Profiles
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enter two GitHub usernames to get an AI-powered side-by-side comparison of their developer skills and portfolio quality.
          </p>
        </div>

        {/* Comparison Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleCompare} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile A
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={usernameA}
                    onChange={(e) => setUsernameA(e.target.value)}
                    placeholder="Enter GitHub username"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-lg shadow-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile B
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={usernameB}
                    onChange={(e) => setUsernameB(e.target.value)}
                    placeholder="Enter GitHub username"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-lg shadow-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !usernameA.trim() || !usernameB.trim()}
              className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Comparing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Compare Profiles
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Compare;
