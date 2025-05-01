import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';

const NameInputScreen: React.FC = () => {
  const { setPlayerName, setCurrentScreen } = useGame();
  // Set the default value for the name state
  const [name, setName] = useState('Satria Awang');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setPlayerName(name.trim());
      setCurrentScreen('MainMenu');
    } else {
      // Optional: Add some feedback if the name is empty
      alert('Please enter your name.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-amber-500">Enter Your Name</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20} // Limit name length
          className="px-4 py-2 w-full bg-slate-700 border border-slate-600 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Hero Name"
          required
        />
        <button
          type="submit"
          className="px-6 py-3 w-full bg-amber-500 text-slate-900 font-semibold rounded hover:bg-amber-600 transition duration-200 shadow-md"
        >
          Begin Adventure
        </button>
      </form>
    </div>
  );
};

export default NameInputScreen;
