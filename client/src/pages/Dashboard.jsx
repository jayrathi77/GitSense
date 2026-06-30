import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyzeProfile } from '../api/analysisApi';
import { motion } from 'framer-motion';
import { Search, History, LogOut, Github, User, GitBranch, FileText, Trophy, Zap, Target, BookOpen, BarChart3, Shield, GraduationCap, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setError('');
    setLoading(true);

    try {
      const response = await analyzeProfile(username);
      navigate(`/analysis/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navbar */}
      <nav className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Github className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">
                GitSense
              </span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/history')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              >
                <History className="h-4 w-4 mr-2" />
                History
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/compare')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Compare
              </motion.button>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">{user?.name}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Analyze GitHub Profiles
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            AI-powered developer analysis with placement readiness scores, skill assessment, and recruiter insights.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-20"
        >
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username (e.g., torvalds)"
                className="w-full pl-14 pr-6 py-5 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white text-lg shadow-2xl transition-all duration-300 focus:shadow-blue-500/10"
                disabled={loading}
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full flex items-center justify-center px-8 py-5 border border-transparent rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="rounded-full h-5 w-5 border-b-2 border-white mr-3"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-3" />
                  Analyze Profile
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Premium Feature Grid - 10 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[
            { icon: Github, title: 'GitHub Integration', desc: 'Real-time data fetch', gradient: 'from-blue-500 to-blue-600' },
            { icon: Zap, title: 'AI Analysis', desc: 'Gemini-powered insights', gradient: 'from-purple-500 to-purple-600' },
            { icon: History, title: 'Smart Caching', desc: '7 Days storage', gradient: 'from-green-500 to-green-600' },
            { icon: Trophy, title: 'Placement Readiness', desc: 'Recruiter metrics', gradient: 'from-yellow-500 to-orange-500' },
            { icon: FileText, title: 'Export PDF Report', desc: 'Downloadable analysis', gradient: 'from-red-500 to-red-600' },
            { icon: GitBranch, title: 'Compare Profiles', desc: 'Side-by-side analysis', gradient: 'from-cyan-500 to-cyan-600' },
            { icon: BarChart3, title: 'Advanced Analytics', desc: 'Deep insights', gradient: 'from-pink-500 to-pink-600' },
            { icon: BookOpen, title: 'Analysis History', desc: 'Track progress', gradient: 'from-indigo-500 to-indigo-600' },
            { icon: Shield, title: 'Secure Authentication', desc: 'JWT protected', gradient: 'from-teal-500 to-teal-600' },
            { icon: GraduationCap, title: 'AI Interview Prep', desc: 'Learning roadmap', gradient: 'from-amber-500 to-amber-600' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              className="group relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 cursor-pointer overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className={`bg-gradient-to-br ${feature.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-${feature.gradient.split(' ')[0]}/25`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {feature.desc}
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Learn more
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
