import React from 'react';
import { Inbox, Search, FileText, Users } from 'lucide-react';

const EmptyState = ({ 
  icon = 'inbox', 
  title = 'No data found', 
  description = 'There is no data to display at the moment.',
  action = null 
}) => {
  const icons = {
    inbox: Inbox,
    search: Search,
    file: FileText,
    users: Users,
  };

  const Icon = icons[icon] || Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
        <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <div className="animate-slide-up">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
