import React from 'react';
import { useGame } from '../contexts/GameContext';

const ChapterScreen: React.FC = () => {
  // Import startNextBattle from the context
  // Removed unused setCurrentScreen
  const { currentChapter, startNextBattle } = useGame();

  // Placeholder for chapter-specific content/story
  const getChapterContent = (chapter: number) => {
    switch (chapter) {
      case 1:
        return {
          title: 'Chapter 1: The Beginning',
          story: 'You awaken in a strange world made of text. An Orc blocks your path.',
        };
      // Add more cases for other chapters
      default:
        return {
          title: `Chapter ${chapter}`,
          story: 'The journey continues...',
        };
    }
  };

  const chapterData = getChapterContent(currentChapter);

  const handleStartBattle = () => {
    // Call startNextBattle to set enemy and navigate
    startNextBattle();
    // Remove the direct navigation
    // setCurrentScreen('Battle'); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
      <h1 className="text-3xl font-bold mb-4 text-amber-500">{chapterData.title}</h1>
      <div className="p-6 border border-amber-500 rounded-lg bg-slate-800 shadow-lg max-w-md text-center mb-6">
        <p>{chapterData.story}</p>
      </div>
      <button
        onClick={handleStartBattle}
        className="px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition duration-200 shadow-md"
      >
        Start Battle
      </button>
      {/* Optionally add a button to go back to the main menu? */}
      {/* <button
        onClick={() => setCurrentScreen('MainMenu')}
        className="mt-4 px-4 py-2 bg-slate-600 text-slate-100 font-semibold rounded hover:bg-slate-700 transition duration-200"
      >
        Main Menu
      </button> */}
    </div>
  );
};

export default ChapterScreen;
