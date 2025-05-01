import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { useGame } from '../contexts/GameContext';
import PlayerStatsDisplay from './PlayerStatsDisplay';
import EnemyStatsDisplay from './EnemyStatsDisplay';
import ActionButtons from './ActionButtons';
import MessageLog from './MessageLog';
import LoadingScreen from './LoadingScreen';

const BattleScreen: React.FC = () => {
  const { enemyStats, gameMessages, currentChapter } = useGame();
  const [isPlayerVibrating, setIsPlayerVibrating] = useState(false);
  const [isEnemyVibrating, setIsEnemyVibrating] = useState(false);

  // Effect to trigger vibration on damage
  useEffect(() => {
    if (gameMessages.length > 0) {
      const lastMessage = gameMessages[gameMessages.length - 1];

      if (lastMessage.sender === 'enemy' && lastMessage.text.includes('attacks')) {
        setIsPlayerVibrating(true);
        const timer = setTimeout(() => setIsPlayerVibrating(false), 300); // Duration of animation
        return () => clearTimeout(timer);
      }

      if (lastMessage.sender === 'player' && lastMessage.text.includes('attacks')) {
        setIsEnemyVibrating(true);
        const timer = setTimeout(() => setIsEnemyVibrating(false), 300); // Duration of animation
        return () => clearTimeout(timer);
      }
    }
  }, [gameMessages]); // Rerun effect when gameMessages change

  if (!enemyStats) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-slate-900 text-slate-100 p-4 pt-10">
      <h1 className="text-3xl font-bold mb-6 text-amber-400 tracking-wide">Chapter {currentChapter}: Battle!</h1>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Player Stats - Add conditional class */}
        <div className={`md:col-span-1 grid ${isPlayerVibrating ? 'animate-shake' : ''}`}>
          <PlayerStatsDisplay />
        </div>

        {/* Enemy Stats - Add conditional class */}
        <div className={`md:col-span-1 grid ${isEnemyVibrating ? 'animate-shake' : ''}`}>
          <EnemyStatsDisplay />
        </div>
      </div>

      {/* Message Log */}
      <div className="w-full max-w-4xl mb-6">
        <MessageLog messages={gameMessages} />
      </div>

      {/* Action Buttons */}
      <div className="md:col-span-1 flex flex-col justify-center">
        <ActionButtons />
      </div>
    </div>
  );
};

export default BattleScreen;
