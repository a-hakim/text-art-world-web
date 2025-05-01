import React from 'react';
import { useGame } from '../contexts/GameContext';

const EnemyStatsDisplay: React.FC = () => {
  const { enemyStats } = useGame();

  if (!enemyStats) {
    return null; // Or a placeholder if needed when no enemy is present
  }

  return (
    <div className="p-4 border border-red-500 rounded-lg bg-slate-800 shadow-md">
      <h3 className="text-xl font-semibold mb-3 text-red-500 border-b border-red-500/30 pb-2">Monster: {enemyStats.name}</h3>
      <div className="space-y-1 text-sm">
        <p><span className="font-medium text-slate-400 w-16 inline-block">Health:</span> {enemyStats.health}</p>
        <p><span className="font-medium text-slate-400 w-16 inline-block">Attack:</span> {enemyStats.attack}</p>
        <p><span className="font-medium text-slate-400 w-16 inline-block">Reward:</span> {enemyStats.reward} Gold</p>
        {/* Add Max Health if available in enemy stats */}
      </div>
    </div>
  );
};

export default EnemyStatsDisplay;
