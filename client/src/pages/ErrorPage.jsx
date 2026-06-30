import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

const ErrorPage = ({ 
  code = 500, 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred. Please try again later.',
  showRetry = false,
  onRetry = null 
}) => {
  const navigate = useNavigate();

  const errorConfig = {
    404: {
      icon: AlertCircle,
      title: 'Page Not Found',
      message: 'The page you are looking for does not exist or has been moved.',
    },
    500: {
      icon: AlertCircle,
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
    },
    403: {
      icon: AlertCircle,
      title: 'Access Denied',
      message: 'You do not have permission to access this resource.',
    },
  };

  const config = errorConfig[code] || errorConfig[500];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center animate-slide-up">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Icon className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {code}
          </h1>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {title || config.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {message || config.message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition-all duration-200 button-hover"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </button>
            
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 button-hover"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
