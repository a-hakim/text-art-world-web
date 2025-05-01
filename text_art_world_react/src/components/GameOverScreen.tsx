import React from 'react';
import { useGame } from '../contexts/GameContext';

const GameOverScreen: React.FC = () => {
  // Get playerStats and resetGame from the context
  const { playerStats, resetGame } = useGame();

  // Determine if the player won (health > 0 when reaching this screen)
  const playerWon = playerStats.health > 0;

  const handleBackToMenu = () => {
    resetGame();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
      {/* Conditionally render title based on win/loss */}
      <h1 className={`text-4xl font-bold mb-8 tracking-widest ${playerWon ? 'text-green-500' : 'text-red-500'}`}>
        {playerWon ? 'Y O U   W O N !' : 'G A M E   O V E R'}
      </h1>
      {/* Conditionally render message box content and style */}
      <div className={`p-6 border ${playerWon ? 'border-green-500' : 'border-red-500'} rounded-lg bg-slate-800 shadow-lg max-w-md text-center mb-6`}>
        {playerWon ? (
          <>
            <p className="text-lg">Congratulations!</p>
            <p className="text-slate-400 mt-2">You have defeated the strongest monster!</p>
          </>
        ) : (
          <>
            <p className="text-lg">You have been defeated.</p>
            <p className="text-slate-400 mt-2">Better luck next time!</p>
          </>
        )}
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