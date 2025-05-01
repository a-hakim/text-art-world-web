import React from 'react';
import { useGame } from '../contexts/GameContext';

const GameOverScreen: React.FC = () => {
  const { resetGame } = useGame();

  const handleBackToMenu = () => {
    resetGame(); // Reset game state before going to menu
    // setCurrentScreen('MainMenu') is handled by resetGame setting screen to 'NameInput' then App.tsx logic
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
      <h1 className="text-4xl font-bold mb-8 text-red-500 tracking-widest">G A M E   O V E R</h1>
      <div className="p-6 border border-red-500 rounded-lg bg-slate-800 shadow-lg max-w-md text-center mb-6">
        <p className="text-lg">You have been defeated.</p>
        <p className="text-slate-400 mt-2">Better luck next time!</p>
      </div>
      <button
        onClick={handleBackToMenu}
        className="mt-6 px-8 py-3 bg-amber-500 text-slate-900 font-semibold rounded hover:bg-amber-600 transition duration-200 shadow-md"
      >
        Return to Main Menu
      </button>
    </div>
  );
};

export default GameOverScreen;