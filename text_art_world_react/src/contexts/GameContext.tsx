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
  { name: 'Weak Goblin', health: 20, attack: 4, reward: 20 },      // Monster 1
  { name: 'Slime', health: 30, attack: 6, reward: 30 },          // Monster 2
  { name: 'Goblin Scout', health: 45, attack: 8, reward: 40 },   // Monster 3
  { name: 'Orc Grunt', health: 60, attack: 12, reward: 60 },     // Monster 4
  { name: 'Orc Warrior', health: 70, attack: 16, reward: 80 },    // Monster 5
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
    // Select enemy based on the current chapter number (adjusting for 0-based array index)
    const enemyIndex = Math.min(currentChapter - 1, enemies.length - 1);
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
          let healAmount = 0; // Initialize healAmount
          // Determine heal amount based on level
          if (currentPlayerStats.level === 4) {
            healAmount = 20;
          } else if (currentPlayerStats.level === 3) {
            healAmount = 15;
          } else { // Level 2 or potentially other levels if logic expands
            healAmount = 10;
          }

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
      // const healthGain = Math.floor(currentEnemyStats.reward / 2); // Removed health gain calculation
      // messagesToQueue.push({ text: `You gained ${currentEnemyStats.reward} gold and ${healthGain} health.`, sender: 'system' }); // Updated message
      messagesToQueue.push({ text: `You gained ${currentEnemyStats.reward} gold.`, sender: 'system' }); // Only mention gold gain
      currentPlayerStats.gold += currentEnemyStats.reward;
      // currentPlayerStats.health += healthGain; // Removed health increase
      // if (currentPlayerStats.health > 100) currentPlayerStats.health = 100; // Removed health capping as it's no longer needed here

      // --- Add Level and Attack Progression Logic --- 
      const previousLevel = currentPlayerStats.level;

      // GOLD X LEVEL
      if (currentPlayerStats.gold >= 100) {
        currentPlayerStats.level = 4;
      } else if (currentPlayerStats.gold >= 50) {
        currentPlayerStats.level = 3;
      } else if (currentPlayerStats.gold >= 25) {
        currentPlayerStats.level = 2;
      }

      // LEVEL X ATTACK
      if (currentPlayerStats.level === 4) {
        currentPlayerStats.attack = 20;
      } else if (currentPlayerStats.level === 3) {
        currentPlayerStats.attack = 15;
      } else if (currentPlayerStats.level === 2) {
        currentPlayerStats.attack = 10;
      } // Assuming level 1 attack remains the initial value (5)

      // Check if player leveled up and add message
      if (currentPlayerStats.level > previousLevel) {
        messagesToQueue.push({ text: `Level Up! You reached level ${currentPlayerStats.level}! Attack increased to ${currentPlayerStats.attack}.`, sender: 'system' });
      }
      // --- End Progression Logic ---

      setPlayerStats(currentPlayerStats);
      setEnemyStats(null);

      // --- Check if the defeated enemy is the final boss --- 
      if (currentEnemyStats.name === 'Orc Warrior') {
        messagesToQueue.push({ text: `Congratulations! You have defeated the final boss!`, sender: 'system' });
        queueMessages(messagesToQueue);
        // Delay screen transition to Game Over (Win state)
        setTimeout(() => setCurrentScreen('GameOver'), 500 * (messagesToQueue.length + 1) + 1000);
      } else {
        // --- Continue to next chapter if not the final boss --- 
        setCurrentChapter(prev => prev + 1);
        queueMessages(messagesToQueue); // Queue defeat and level up messages
        // Delay screen transition until messages are likely done
        setTimeout(() => setCurrentScreen('Chapter'), 500 * (messagesToQueue.length + 1) + 1000);
      }
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