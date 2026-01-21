
import React, { useState, useEffect, useCallback } from 'react';
import { fetchNewCharacter, validateGuess } from './services/geminiService';
import { Character, GameStatus, GameState } from './types';
import HintCard from './components/HintCard';
import GameStats from './components/GameStats';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [gameState, setGameState] = useState<GameState>({
    currentCharacter: null,
    revealedHints: 1,
    score: 0,
    isGameOver: false,
    hasWon: false,
    attempts: 0,
    history: []
  });
  const [guess, setGuess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  const startNewGame = async () => {
    setStatus(GameStatus.LOADING);
    try {
      const excludeList = gameState.history.map(h => h.name);
      const character = await fetchNewCharacter(excludeList);
      setGameState(prev => ({
        ...prev,
        currentCharacter: character,
        revealedHints: 1,
        isGameOver: false,
        hasWon: false,
        attempts: 0
      }));
      setStatus(GameStatus.PLAYING);
      setErrorMsg('');
      setGuess('');
    } catch (error) {
      console.error(error);
      setErrorMsg('Vaya, algo ha fallado al buscar al personaje. ¡Reintenta!');
      setStatus(GameStatus.IDLE);
    }
  };

  const handleRevealHint = () => {
    if (gameState.revealedHints < 5) {
      setGameState(prev => ({
        ...prev,
        revealedHints: prev.revealedHints + 1,
      }));
    }
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || isVerifying || !gameState.currentCharacter) return;

    setIsVerifying(true);
    try {
      const isCorrect = await validateGuess(guess, gameState.currentCharacter.name);
      
      if (isCorrect) {
        const finalScore = (6 - gameState.revealedHints) * 100;
        setGameState(prev => ({
          ...prev,
          score: prev.score + finalScore,
          isGameOver: true,
          hasWon: true,
          history: [...prev.history, { name: prev.currentCharacter!.name, won: true, score: finalScore }]
        }));
        setStatus(GameStatus.FINISHED);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setGameState(prev => ({ ...prev, attempts: prev.attempts + 1 }));
        setGuess('');
        // Auto reveal hint on wrong guess
        if (gameState.revealedHints < 5) {
          handleRevealHint();
        } else if (gameState.attempts >= 2) {
           // Game over after some failures at max hints
           setGameState(prev => ({
             ...prev,
             isGameOver: true,
             hasWon: false,
             history: [...prev.history, { name: prev.currentCharacter!.name, won: false, score: 0 }]
           }));
           setStatus(GameStatus.FINISHED);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 px-4 sm:px-6 flex flex-col items-center">
      {/* Header */}
      <header className="py-8 text-center max-w-2xl w-full">
        <h1 className="text-6xl sm:text-8xl font-impact text-red-600 drop-shadow-lg tracking-tighter uppercase mb-2">
          ¿Quién Soy?
        </h1>
        <div className="inline-block bg-yellow-400 px-4 py-1 -rotate-2 transform">
          <span className="font-comic text-red-800 text-xl font-bold">Edición Española 🇪🇸</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl w-full">
        {status === GameStatus.IDLE && (
          <div className="text-center py-12 bg-white rounded-3xl shadow-xl border-8 border-yellow-400 p-8">
            <p className="text-xl text-gray-700 mb-8 font-comic">
              ¿Cuánto sabes de los iconos de nuestra tierra? Pon a prueba tu cultura española.
            </p>
            <button 
              onClick={startNewGame}
              className="bg-red-600 hover:bg-red-700 text-white font-impact text-3xl px-12 py-4 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95"
            >
              ¡EMPEZAR JUEGO!
            </button>
            <GameStats history={gameState.history} />
          </div>
        )}

        {status === GameStatus.LOADING && (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-24 w-24 border-t-8 border-b-8 border-red-600 mb-6"></div>
            <p className="font-comic text-2xl text-red-600 animate-pulse">Buscando en la hemeroteca...</p>
          </div>
        )}

        {status === GameStatus.PLAYING && gameState.currentCharacter && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-2xl shadow-inner font-impact text-xl">
              <div>Categoría: <span className="text-yellow-300">{gameState.currentCharacter.category}</span></div>
              <div>Puntos: {gameState.score}</div>
            </div>

            <div className="space-y-4">
              {gameState.currentCharacter.hints.map((hint, idx) => (
                <HintCard 
                  key={idx} 
                  text={hint} 
                  index={idx} 
                  isRevealed={idx < gameState.revealedHints} 
                />
              ))}
            </div>

            <div className="sticky bottom-4 z-10 pt-4">
              <form onSubmit={handleGuess} className={`flex flex-col gap-3 ${shake ? 'shake' : ''}`}>
                <input 
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="¿Quién es? Escribe el nombre..."
                  disabled={isVerifying}
                  className="w-full text-2xl font-comic p-4 rounded-2xl border-4 border-blue-500 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                />
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    disabled={isVerifying || !guess.trim()}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-impact text-2xl py-3 rounded-2xl shadow-lg disabled:opacity-50 transition transform hover:-translate-y-1"
                  >
                    {isVerifying ? 'COMPROBANDO...' : '¡LO TENGO!'}
                  </button>
                  {gameState.revealedHints < 5 && (
                    <button 
                      type="button"
                      onClick={handleRevealHint}
                      className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-impact text-2xl px-6 py-3 rounded-2xl shadow-lg transition transform hover:-translate-y-1"
                    >
                      PISTA (+{gameState.revealedHints + 1})
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {status === GameStatus.FINISHED && gameState.currentCharacter && (
          <div className={`p-8 rounded-3xl shadow-2xl border-8 text-center animate-bounce-slow ${
            gameState.hasWon ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
          }`}>
            <h2 className="text-5xl font-impact mb-4 text-gray-800">
              {gameState.hasWon ? '¡MAGNÍFICO!' : '¡QUÉ LÁSTIMA!'}
            </h2>
            <div className="bg-white p-6 rounded-2xl mb-6 shadow-md">
              <p className="text-lg text-gray-500 font-bold uppercase tracking-widest mb-2">Era nada menos que...</p>
              <h3 className="text-4xl font-impact text-blue-700 mb-2">{gameState.currentCharacter.name}</h3>
              <p className="font-comic text-gray-700 leading-snug">{gameState.currentCharacter.description}</p>
              <div className="mt-4 flex justify-center">
                 <img 
                  src={`https://picsum.photos/seed/${gameState.currentCharacter.name}/400/300`} 
                  alt={gameState.currentCharacter.name}
                  className="rounded-xl border-4 border-gray-200 grayscale-0 hover:grayscale transition-all duration-500"
                 />
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={startNewGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-impact text-3xl py-4 rounded-full shadow-xl transform transition hover:scale-105"
              >
                ¿OTRO PERSONAJE?
              </button>
              <div className="text-2xl font-impact text-gray-600">
                Puntos totales: {gameState.score}
              </div>
            </div>
          </div>
        )}
      </main>

      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl z-50">
          {errorMsg}
        </div>
      )}
      
      <footer className="mt-auto pt-12 pb-6 text-gray-400 font-comic text-sm">
        Desarrollado con ❤️ y Gemini 2.5 • {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
