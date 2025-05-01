import { useState } from 'react';
import MainMenu from './components/MainMenu';
import BattleScreen from './components/BattleScreen';
import AboutScreen from './components/AboutScreen';
import CreditsScreen from './components/CreditsScreen';
import GameOverScreen from './components/GameOverScreen';
import VictoryScreen from './components/VictoryScreen';
import ChapterScreen from './components/ChapterScreen';
import NameInputScreen from './components/NameInputScreen'; // Import the new component
import { GameProvider, useGame } from './contexts/GameContext';

export type GameScreen = 'MainMenu' | 'NameInput' | 'Chapter' | 'Battle' | 'About' | 'Credits' | 'GameOver' | 'Victory';

function AppContent() {
  const { currentScreen, setCurrentScreen, playerName, setPlayerName } = useGame();
  // Remove unused state and handler
  // const [nameInput, setNameInput] = useState('');

  // const handleNameSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (nameInput.trim()) {
  //     setPlayerName(nameInput.trim());
  //     setCurrentScreen('MainMenu');
  //   }
  // };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'NameInput':
        return <NameInputScreen />; // Use the imported component
      // Remove the old inline implementation
      /*
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
            <h1 className="text-3xl font-bold mb-6 text-amber-500">T E X T   A R T   W O R L D</h1>
            <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-4 p-6 border border-amber-500 rounded-lg bg-slate-800 shadow-lg">
              <label htmlFor="playerName" className="text-lg">Please insert your name:</label>
              <input
                id="playerName"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-4 py-2 rounded bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                maxLength={48}
                required
              />
              <button type="submit" className="px-6 py-2 bg-amber-500 text-slate-900 font-semibold rounded hover:bg-amber-600 transition duration-200">
                Start
              </button>
            </form>
          </div>
        );
      */
      case 'MainMenu':
        return <MainMenu />;
      case 'Chapter':
        return <ChapterScreen />;
      case 'Battle':
        return <BattleScreen />;
      case 'About':
        return <AboutScreen />;
      case 'Credits':
        return <CreditsScreen />;
      case 'GameOver':
        return <GameOverScreen />;
      case 'Victory':
        return <VictoryScreen />;
      default:
        return <MainMenu />;
    }
  };

  // Initially, ask for player name if not set
  if (!playerName && currentScreen !== 'NameInput') {
     setCurrentScreen('NameInput');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-mono">
      {renderScreen()}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
