// Removed unused React import
import MainMenu from './components/MainMenu';
import BattleScreen from './components/BattleScreen';
import AboutScreen from './components/AboutScreen';
import CreditsScreen from './components/CreditsScreen';
import GameOverScreen from './components/GameOverScreen';
import ChapterScreen from './components/ChapterScreen';
import NameInputScreen from './components/NameInputScreen'; // Import the new component
import { GameProvider, useGame } from './contexts/GameContext';

export type GameScreen = 'MainMenu' | 'NameInput' | 'Chapter' | 'Battle' | 'About' | 'Credits' | 'GameOver' | 'Victory';

function AppContent() {
  const { currentScreen, setCurrentScreen, playerName } = useGame();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'NameInput':
        return <NameInputScreen />; // Use the imported component
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
