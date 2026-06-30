import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../api/analysisApi';
import { ArrowLeft, Clock, Star, User, Moon, Sun, Trophy } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory();
        setAnalyses(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analysis History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your recent GitHub profile analyses
          </p>
        </div>

        {analyses.length === 0 ? (
          <EmptyState
            icon="clock"
            title="No analyses yet"
            description="Start by analyzing a GitHub profile from the dashboard"
            action={
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition-all duration-200 button-hover"
              >
                Go to Dashboard
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis, index) => (
              <div
                key={analysis._id}
                onClick={() => navigate(`/analysis/${analysis._id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer card-hover animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={analysis.profileSnapshot.avatarUrl}
                      alt={analysis.githubUsername}
                      className="h-12 w-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                    />
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {analysis.githubUsername}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {analysis.scores && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center">
                        <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                        Placement Score
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analysis.scores.overallPlacementScore || analysis.scores.developerScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.scores.overallPlacementScore || analysis.scores.developerScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Star className="h-4 w-4 mr-1" />
                    {analysis.profileSnapshot.followers} followers
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {analysis.profileSnapshot.publicRepos} repos
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
