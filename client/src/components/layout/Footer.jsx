import React from 'react';
import { Github, Heart, Code, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Github className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                GitSense
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered GitHub profile analysis for recruiters and developers.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-primary-500" />
                AI-Powered Analysis
              </li>
              <li className="flex items-center">
                <Code className="h-4 w-4 mr-2 text-primary-500" />
                Profile Comparison
              </li>
              <li className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-primary-500" />
                Recruiter Insights
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Built With</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              React, Node.js, MongoDB, Gemini AI
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} GitSense. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
