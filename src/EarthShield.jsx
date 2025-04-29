import React, { useState, useEffect } from 'react';
import './EarthShield.css';

const EarthShield = () => {
  const [playerPosition, setPlayerPosition] = useState(375);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft' && playerPosition > 0) {
        setPlayerPosition(prev => prev - 10);
      }
      if (e.key === 'ArrowRight' && playerPosition < 750) {
        setPlayerPosition(prev => prev + 10);
      }
      if (e.key === ' ') {
        setBullets(prev => [...prev, { x: playerPosition + 22.5, y: 550 }]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const spawnEnemies = setInterval(() => {
      const x = Math.random() * 760;
      setEnemies(prev => [...prev, { x, y: 0 }]);
    }, 2000);
    return () => clearInterval(spawnEnemies);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const gameLoop = setInterval(() => {
      setBullets(prevBullets => {
        let updatedBullets = prevBullets
          .map(bullet => ({ ...bullet, y: bullet.y - 10 }))
          .filter(bullet => bullet.y > 0);

        let remainingBullets = []; // تم تعريف المتغير هنا
        let newScore = score;

        setEnemies(prevEnemies => {
          let updatedEnemies = prevEnemies
            .map(enemy => ({ ...enemy, y: enemy.y + 5 }))
            .filter(enemy => enemy.y < 600);

          // Enemy shooting logic
          const newEnemyBullets = updatedEnemies
            .filter(() => Math.random() < 0.01)
            .map(enemy => ({ x: enemy.x + 17.5, y: enemy.y + 40 }));

          setEnemyBullets(prev => [
            ...prev.map(b => ({ ...b, y: b.y + 5 })),
            ...newEnemyBullets
          ].filter(b => b.y < 600));

          // Collision detection
          updatedBullets.forEach(bullet => {
            const hitEnemyIndex = updatedEnemies.findIndex(enemy => 
              bullet.x >= enemy.x && 
              bullet.x <= enemy.x + 40 && 
              bullet.y >= enemy.y && 
              bullet.y <= enemy.y + 40
            );

            if (hitEnemyIndex !== -1) {
              updatedEnemies.splice(hitEnemyIndex, 1);
              newScore += 10;
            } else {
              remainingBullets.push(bullet);
            }
          });

          // Check if enemies reached bottom
          if (updatedEnemies.some(enemy => enemy.y >= 550)) {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) setGameOver(true);
              return newLives;
            });
          }

          return updatedEnemies.filter(enemy => enemy.y < 550);
        });

        setScore(newScore);
        return remainingBullets;
      });
    }, 50);
    return () => clearInterval(gameLoop);
  }, [score, gameOver]);

  const restartGame = () => {
    setPlayerPosition(375);
    setBullets([]);
    setEnemies([]);
    setEnemyBullets([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
  };

  return (
    <div className="game-container">
      <div className="game-canvas">
        <div className="score-board">Score: {score}</div>
        <div className="lives">Lives: {lives}</div>
        <div className="player" style={{ left: `${playerPosition}px` }} />
        {bullets.map((bullet, i) => (
          <div key={`b-${i}`} className="bullet" style={{ left: `${bullet.x}px`, top: `${bullet.y}px` }} />
        ))}
        {enemies.map((enemy, i) => (
          <div key={`e-${i}`} className="enemy" style={{ left: `${enemy.x}px`, top: `${enemy.y}px` }} />
        ))}
        {enemyBullets.map((bullet, i) => (
          <div key={`eb-${i}`} className="enemy-bullet" style={{ left: `${bullet.x}px`, top: `${bullet.y}px` }} />
        ))}
        {gameOver && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>Score: {score}</p>
            <button onClick={restartGame}>Restart</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarthShield;