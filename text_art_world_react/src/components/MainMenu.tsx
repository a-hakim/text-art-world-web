import React from 'react';
import { useGame } from '../contexts/GameContext';

const MainMenu: React.FC = () => {
  const { setCurrentScreen, resetGame, playerName } = useGame();

  const handleStart = () => {
    // Reset parts of the game state if needed before starting/restarting
    // For now, just go to the first chapter screen
    setCurrentScreen('Chapter');
  };

  const handleAbout = () => {
    setCurrentScreen('About');
  };

  const handleCredits = () => {
    setCurrentScreen('Credits');
  };

  const handleQuit = () => {
    // Reset the entire game state and go back to name input
    resetGame();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
      <h1 className="text-4xl font-bold mb-8 text-amber-500 tracking-widest">T E X T   A R T   W O R L D</h1>
      <p className="mb-6 text-lg">Welcome, {playerName}!</p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleStart}
          className="px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded hover:bg-amber-600 transition duration-200 shadow-md"
        >
          Start Game
        </button>
        <button
          onClick={handleAbout}
          className="px-6 py-3 bg-slate-700 text-amber-500 font-semibold rounded hover:bg-slate-600 transition duration-200 shadow-md"
        >
          About
        </button>
        <button
          onClick={handleCredits}
          className="px-6 py-3 bg-slate-700 text-amber-500 font-semibold rounded hover:bg-slate-600 transition duration-200 shadow-md"
        >
          Credits
        </button>
        <button
          onClick={handleQuit}
          className="px-6 py-3 bg-red-600 text-slate-100 font-semibold rounded hover:bg-red-700 transition duration-200 shadow-md mt-4"
        >
          Quit (Reset Game)
        </button>
      </div>
      <p className="mt-8 text-sm text-slate-500">Version: 1.0.0 (React Remake)</p>
    </div>
  );
};

export default MainMenu;
