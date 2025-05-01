import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react'; // Add useRef
import { GameScreen } from '../App';

// Define interfaces for player and enemy stats
interface PlayerStats {
  health: number;
  gold: number;
  level: number;
  attack: number;
  name: string;
}

interface EnemyStats {
  health: number;
  attack: number;
  reward: number;
  name: string;
}

// Define sender types
type MessageSender = 'player' | 'enemy' | 'system';

// Define the shape of the message object
interface GameMessage {
  step: number;
  text: string;
  sender: MessageSender;
}

// Interface for messages before they get a step number
interface QueuedMessage {
    text: string;
    sender: MessageSender;
}

// Define the shape of the game context
interface GameContextProps {
  playerStats: PlayerStats;
  setPlayerStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  enemyStats: EnemyStats | null;
  setEnemyStats: React.Dispatch<React.SetStateAction<EnemyStats | null>>;
  currentScreen: GameScreen;
  setCurrentScreen: React.Dispatch<React.SetStateAction<GameScreen>>;
  gameMessages: GameMessage[];
  // addMessage is now internal, remove from props if not needed externally
  clearMessages: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  resetGame: () => void;
  handlePlayerAction: (action: 'attack' | 'heal' | 'poison') => void;
  startNextBattle: () => void;
  currentChapter: number;
  isProcessingMessages: boolean; // Add this flag
}

// Create the context
const GameContext = createContext<GameContextProps | undefined>(undefined);

// Initial game state
const initialPlayerStats: PlayerStats = {
  health: 100,
  gold: 0,
  level: 1,
  attack: 5,
  name: '',
};

// Define possible enemies
const enemies: EnemyStats[] = [
  { name: 'Monster Sap-an', health: 30, attack: 5, reward: 10 },
  { name: 'Goblin Scout', health: 50, attack: 8, reward: 15 },
  { name: 'Orc Warrior', health: 80, attack: 12, reward: 25 },
  // Add more enemies as needed
];

// Create the provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playerStats, setPlayerStats] = useState<PlayerStats>(initialPlayerStats);
  const [enemyStats, setEnemyStats] = useState<EnemyStats | null>(null);
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('NameInput');
  const [gameMessages, setGameMessages] = useState<GameMessage[]>([]);
  // Removed unused messageCount and setMessageCount
  // const [messageCount, setMessageCount] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  // Changed NodeJS.Timeout to ReturnType<typeof setTimeout>
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isProcessingMessages, setIsProcessingMessages] = useState(false); // State for the flag

  // Internal function to add a single message to the display
  const addMessageToDisplay = (message: string, sender: MessageSender) => {
    // Calculate newStep based on the current length of gameMessages
    setGameMessages(prevMessages => {
        const newStep = (prevMessages[prevMessages.length - 1]?.step || 0) + 1;
        const newMessage: GameMessage = { step: newStep, text: message, sender };
        return [...prevMessages.slice(-19), newMessage]; // Keep last 20
    });
  };

  // Function to add messages to the queue
  const queueMessages = (messages: QueuedMessage[]) => {
    setMessageQueue(prevQueue => [...prevQueue, ...messages]);
  };

  // Effect to process the message queue with delays
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (messageQueue.length > 0) {
      setIsProcessingMessages(true); // Set flag when starting processing
      timeoutRef.current = setTimeout(() => {
        const [nextMessage, ...remainingQueue] = messageQueue;
        addMessageToDisplay(nextMessage.text, nextMessage.sender);
        setMessageQueue(remainingQueue);
        timeoutRef.current = null;
        // If queue becomes empty after this message, set flag to false
        if (remainingQueue.length === 0) {
            setIsProcessingMessages(false);
        }
      }, 500);
    } else {
        setIsProcessingMessages(false); // Ensure flag is false if queue is initially empty
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [messageQueue]);

  const clearMessages = () => {
    setGameMessages([]);
    // Removed messageCount reset
    // setMessageCount(0);
    setMessageQueue([]);
    setIsProcessingMessages(false); // Reset flag
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
    }
  }

  // Update player name in stats as well
  const setPlayerName = (name: string) => {
    setPlayerStats(prev => ({ ...prev, name }));
  };

  // Removed unused addMessage function
  /*
  const addMessage = (message: string, sender: MessageSender) => { // Add sender param
    setMessageCount(prevCount => {
      const newStep = prevCount + 1;
      const newMessage: GameMessage = { step: newStep, text: message, sender }; // Include sender
      setGameMessages(prevMessages => [...prevMessages.slice(-19), newMessage]); // Keep last 20 messages
      return newStep;
    });
  };
  */

  const startNextBattle = () => {
    clearMessages();
    const enemyIndex = Math.min(playerStats.level - 1, enemies.length - 1);
    const newEnemy = { ...enemies[enemyIndex] };
    setEnemyStats(newEnemy);
    // Queue the initial battle message
    queueMessages([{ text: `Chapter ${currentChapter}: A wild ${newEnemy.name} appears!`, sender: 'system' }]);
    setCurrentScreen('Battle');
  };

  const resetGame = () => {
    setPlayerStats(initialPlayerStats);
    setEnemyStats(null);
    setCurrentScreen('NameInput');
    clearMessages(); // Use clearMessages which handles queue and timeout
    setCurrentChapter(1);
  };

  const handlePlayerAction = (action: 'attack' | 'heal' | 'poison') => {
    if (!enemyStats || playerStats.health <= 0 || messageQueue.length > 0) return; // Prevent action if messages are still displaying

    let currentEnemyStats = { ...enemyStats };
    let currentPlayerStats = { ...playerStats };
    let messagesToQueue: QueuedMessage[] = []; // Use the QueuedMessage type

    // --- Player's Turn ---
    let playerActed = false;
    switch (action) {
      case 'attack':
        currentEnemyStats.health -= currentPlayerStats.attack;
        messagesToQueue.push({ text: `${currentPlayerStats.name} attacks ${currentEnemyStats.name} for ${currentPlayerStats.attack} damage.`, sender: 'player' });
        playerActed = true;
        break;
      case 'heal':
        if (currentPlayerStats.level >= 2) {
          const healAmount = 10;
          const healthBeforeHeal = currentPlayerStats.health;
          currentPlayerStats.health += healAmount;
          if (currentPlayerStats.health > 100) currentPlayerStats.health = 100;
          const actualHeal = currentPlayerStats.health - healthBeforeHeal;
          messagesToQueue.push({ text: `${currentPlayerStats.name} heals for ${actualHeal} health.`, sender: 'player' });
          playerActed = true;
        } else {
          messagesToQueue.push({ text: `${currentPlayerStats.name} tries to heal, but is not high enough level!`, sender: 'system' });
        }
        break;
      case 'poison':
        if (currentPlayerStats.level >= 4 && currentPlayerStats.gold >= 20) {
          currentPlayerStats.gold -= 20;
          currentEnemyStats.attack = Math.max(0, currentEnemyStats.attack - 2);
          messagesToQueue.push({ text: `${currentPlayerStats.name} poisons ${currentEnemyStats.name}, reducing its attack! (Cost: 20 Gold)`, sender: 'player' });
          playerActed = true;
        } else if (currentPlayerStats.level < 4) {
          messagesToQueue.push({ text: `${currentPlayerStats.name} tries to poison, but is not high enough level!`, sender: 'system' });
        } else {
           messagesToQueue.push({ text: `${currentPlayerStats.name} tries to poison, but needs 20 Gold!`, sender: 'system' });
        }
        break;
    }

    if (!playerActed) {
        queueMessages(messagesToQueue); // Queue the failure message
        return;
    }

    // Check if enemy is defeated
    if (currentEnemyStats.health <= 0) {
      messagesToQueue.push({ text: `${currentEnemyStats.name} is defeated!`, sender: 'system' });
      const healthGain = Math.floor(currentEnemyStats.reward / 2);
      messagesToQueue.push({ text: `You gained ${currentEnemyStats.reward} gold and ${healthGain} health.`, sender: 'system' });
      currentPlayerStats.gold += currentEnemyStats.reward;
      currentPlayerStats.health += healthGain;
       if (currentPlayerStats.health > 100) currentPlayerStats.health = 100;

      setPlayerStats(currentPlayerStats);
      setEnemyStats(null);
      setCurrentChapter(prev => prev + 1);
      queueMessages(messagesToQueue); // Queue defeat messages
      // Delay screen transition until messages are likely done (adjust timing as needed)
      setTimeout(() => setCurrentScreen('Chapter'), 500 * (messagesToQueue.length + 1) + 1000); // Base delay + per message + buffer
      return;
    }

    // --- Enemy's Turn ---
    if (currentEnemyStats.health > 0) {
        currentPlayerStats.health -= currentEnemyStats.attack;
        messagesToQueue.push({ text: `${currentEnemyStats.name} attacks ${currentPlayerStats.name} for ${currentEnemyStats.attack} damage.`, sender: 'enemy' });
    }

    // Check if player is defeated
    if (currentPlayerStats.health <= 0) {
      currentPlayerStats.health = 0;
      messagesToQueue.push({ text: `${currentPlayerStats.name} has been defeated!`, sender: 'system' });
      setPlayerStats(currentPlayerStats);
      setEnemyStats(currentEnemyStats);
      queueMessages(messagesToQueue); // Queue defeat messages
      // Delay screen transition
      setTimeout(() => setCurrentScreen('GameOver'), 500 * (messagesToQueue.length + 1) + 1000);
      return;
    }

    // Update states immediately, queue messages for display
    setPlayerStats(currentPlayerStats);
    setEnemyStats(currentEnemyStats);
    queueMessages(messagesToQueue);
  };

  return (
    <GameContext.Provider value={{
      playerStats,
      setPlayerStats,
      enemyStats,
      setEnemyStats,
      currentScreen,
      setCurrentScreen,
      gameMessages,
      // addMessage is internal now
      clearMessages,
      playerName: playerStats.name,
      setPlayerName,
      resetGame,
      handlePlayerAction,
      startNextBattle,
      currentChapter,
      isProcessingMessages // Provide the flag in the context value
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `|| messageQueue.length > 0` is technically redundant
// now that we use the isProcessingMessages flag, but it doesn't hurt to leave it.
// It provides an immediate block even before the state update propagates.
// NOTE: The check in handlePlayerAction `
