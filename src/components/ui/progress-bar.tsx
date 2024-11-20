import React from 'react';

export const ProgressBar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-blue-500">
      <div className="h-full bg-blue-700 animate-pulse" style={{ width: '100%' }} />
    </div>
  );
}; 