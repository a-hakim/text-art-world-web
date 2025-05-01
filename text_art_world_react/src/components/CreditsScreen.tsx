import React from 'react';
import { useGame } from '../contexts/GameContext';

const CreditsScreen: React.FC = () => {
  const { setCurrentScreen } = useGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-amber-500">CREDITS</h1>
      <div className="p-6 border border-amber-500 rounded-lg bg-slate-800 shadow-lg max-w-md text-center space-y-2">
        <p>Game Design & Programming:</p>
        <p className="text-amber-400">Bookklik Technologies</p>
        <p className="mt-4">Based on the original C++ version by A.Hakim Noor (2015).</p>
        <p>Special Thanks:</p>
        <p className="text-amber-400">React Community, Tailwind CSS</p>
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

export default CreditsScreen;
