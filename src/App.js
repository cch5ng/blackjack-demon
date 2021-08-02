import {useState} from 'react';

import Game from './components/Game';
import Rules from './components/Rules';
import './App.css';

function App() {
  const [showRules, setShowRules] = useState(true);
  const [isGamePaused, setIsGamePaused] = useState(false);

  const resumeGame = () => {
    setShowRules(false);
    setIsGamePaused(false);
  }

  const pauseGame = () => {
    setIsGamePaused(true);
  }

  const openRules = () => {
    setShowRules(true);
    pauseGame();
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="title">Blackjack Demon</div>
        <div><button className="btn" onClick={openRules}>Rules</button></div>
      </header>
      <main>
        <Game isGamePaused={isGamePaused}/>
        {showRules && (
          <Rules resumeGame={resumeGame} />
        )}
      </main>
    </div>
  );
}

export default App;
