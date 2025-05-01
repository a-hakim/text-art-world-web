import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mb-4"></div>
      <p className="text-xl text-slate-300 tracking-wider">Loading...</p>
    </div>
  );
};

export default LoadingScreen;