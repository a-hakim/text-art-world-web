import React from 'react';
import { useGame } from '../contexts/GameContext';

const PlayerStatsDisplay: React.FC = () => {
  const { playerStats } = useGame();

  return (
    <div className="p-4 border border-amber-500 rounded-lg bg-slate-800 shadow-md">
      <h3 className="text-xl font-semibold mb-3 text-amber-500 border-b border-amber-500/30 pb-2">Player: {playerStats.name}</h3>
      <div className="space-y-1 text-sm">
        <p><span className="font-medium text-slate-400 w-16 inline-block">Health:</span> {playerStats.health} / 100</p>
        <p><span className="font-medium text-slate-400 w-16 inline-block">Gold:</span> {playerStats.gold}</p>
        <p><span className="font-medium text-slate-400 w-16 inline-block">Level:</span> {playerStats.level}</p>
        <p><span className="font-medium text-slate-400 w-16 inline-block">Attack:</span> {playerStats.attack}</p>
      </div>
    </div>
  );
};

export default PlayerStatsDisplay;
