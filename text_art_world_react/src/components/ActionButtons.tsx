import React from 'react';
import { useGame } from '../contexts/GameContext';

const ActionButtons: React.FC = () => {
  // Get isProcessingMessages from context
  const { handlePlayerAction, playerStats, isProcessingMessages } = useGame();

  const canHeal = playerStats.level >= 2;
  const canPoison = playerStats.level >= 4 && playerStats.gold >= 20;

  // Determine if any action is allowed (base condition + message processing check)
  const actionsDisabled = isProcessingMessages;

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={() => handlePlayerAction('attack')}
        // Disable if processing messages
        disabled={actionsDisabled}
        className={`px-5 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition duration-200 shadow-md flex-1 ${actionsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Attack
      </button>
      <button
        onClick={() => handlePlayerAction('heal')}
        // Disable if cannot heal OR processing messages
        disabled={!canHeal || actionsDisabled}
        className={`px-5 py-2 font-semibold rounded transition duration-200 shadow-md flex-1 ${canHeal && !actionsDisabled ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'}`}
        title={actionsDisabled ? "Processing..." : (canHeal ? "Heal (+10 Health)" : "Requires Level 2")}
      >
        Heal {canHeal ? '(Lvl 2+)' : ''}
      </button>
      <button
        onClick={() => handlePlayerAction('poison')}
        // Disable if cannot poison OR processing messages
        disabled={!canPoison || actionsDisabled}
        className={`px-5 py-2 font-semibold rounded transition duration-200 shadow-md flex-1 ${canPoison && !actionsDisabled ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'}`}
        title={actionsDisabled ? "Processing..." : (canPoison ? "Poison Enemy (-2 Attack, Cost: 20 Gold)" : (playerStats.level < 4 ? "Requires Level 4" : "Requires 20 Gold"))}
      >
        Poison {canPoison ? '(Lvl 4+, 20G)' : ''}
      </button>
    </div>
  );
};

export default ActionButtons;
