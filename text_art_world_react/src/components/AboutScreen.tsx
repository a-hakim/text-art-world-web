import React from 'react';
import { useGame } from '../contexts/GameContext';

const AboutScreen: React.FC = () => {
  const { setCurrentScreen } = useGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-amber-500">ABOUT</h1>
      <div className="p-6 border border-amber-500 rounded-lg bg-slate-800 shadow-lg max-w-md text-center space-y-2">
        <p>T.A.W : Text Art World.</p>
        <p>Version 3.12.15 Update U5 (React Remake).</p>
        <p>Copyright 2018 Bookklik Tech.</p>
        <p>All rights reserved.</p>
      </div>
      <button
        onClick={() => setCurrentScreen('MainMenu')}
        className="mt-6 px-6 py-2 bg-amber-500 text-slate-900 font-semibold rounded hover:bg-amber-600 transition duration-200"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default AboutScreen;
