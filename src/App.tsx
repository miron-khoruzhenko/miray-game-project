import React, { useEffect, useState, useRef } from "react";
import own_img from "./assets/owl.png";
import forest_background from "./assets/bg.jpg";

interface Obstacle {
  x: number;
  width: number;
  topHeight: number;
  bottomHeight: number;
  counted?: boolean;
}

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function App() {
  const [birdY, setBirdY] = useState<number>(250); // Initial vertical position
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [backgroundX, setBackgroundX] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const gravity = 9; // Adjusted gravity force
  const jumpHeight = 1000; // Adjusted jump height
  const obstacleWidth = 60; // Width of the obstacles
  const obstacleGap = 300; // Gap between top and bottom obstacles

  const gameLoopRef = useRef<number | null>(null);
  const obstacleTimerRef = useRef<number>(0);
  const owlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameOver) {
      // Start the game loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      // Clean up the game loop
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameOver]);

  const gameLoop = () => {
    if (!gameOver) {
      // Move background
      setBackgroundX((prevX) => prevX - 2);

      // Apply gravity to the bird
      setBirdY((prevY) => prevY + gravity);

      // Move obstacles
      setObstacles((prevObstacles) =>
        prevObstacles.map((obs) => ({ ...obs, x: obs.x - 2 }))
      );

      // Remove obstacles that are off-screen
      setObstacles((prevObstacles) =>
        prevObstacles.filter((obs) => obs.x + obs.width > 0)
      );

      // Handle obstacle generation timing using a ref
      obstacleTimerRef.current += 1;

      if (obstacleTimerRef.current >= 300) {
        generateObstacle();
        obstacleTimerRef.current = 0;
      }

      // Increase score when the bird passes an obstacle
      setObstacles((prevObstacles) => {
        const updatedObstacles = prevObstacles.map((obs) => {
          if (!obs.counted && obs.x + obs.width < 100) {
            setScore((prevScore) => prevScore + 1);
            return { ...obs, counted: true };
          }
          return obs;
        });
        return updatedObstacles;
      });

      // Collision detection
      checkCollision();

      // Check if bird hits the ground or goes off the screen
      if (birdY >= window.innerHeight - 100 || birdY <= 0) {
        setGameOver(true);
      }

      // Continue the game loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const generateObstacle = () => {
    const minHeight = 50;
    const maxHeight = window.innerHeight - obstacleGap - minHeight;

    const topHeight = Math.floor(
      Math.random() * (maxHeight - minHeight + 1) + minHeight
    );
    const bottomHeight = window.innerHeight - topHeight - obstacleGap;

    const newObstacle: Obstacle = {
      x: window.innerWidth,
      width: obstacleWidth,
      topHeight,
      bottomHeight,
    };

    setObstacles((prevObstacles) => [...prevObstacles, newObstacle]);
  };

  const checkCollision = () => {
    if (owlRef.current) {
      const owlRect = owlRef.current.getBoundingClientRect();

      for (const obs of obstacles) {
        const obsX = obs.x;
        const obsWidth = obstacleWidth;

        // Top obstacle
        const topObsRect: Rect = {
          left: obsX,
          right: obsX + obsWidth,
          top: 0,
          bottom: obs.topHeight,
        };

        // Bottom obstacle
        const bottomObsRect: Rect = {
          left: obsX,
          right: obsX + obsWidth,
          top: obs.topHeight + obstacleGap,
          bottom: window.innerHeight,
        };

        if (
          rectsOverlap(owlRect, topObsRect) ||
          rectsOverlap(owlRect, bottomObsRect)
        ) {
          setGameOver(true);
          break;
        }
      }
    }
  };

  const rectsOverlap = (rect1: DOMRect | Rect, rect2: Rect): boolean => {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.key === " " || event.key === "ArrowUp") && !gameOver) {
      // Make the bird jump
      setBirdY((prevY) => prevY - jumpHeight);
    } else if ((event.key === "r" || event.key === "R")) {
      // Restart the game
      restartGame();
    }
  };

  const restartGame = () => {
    setBirdY(250);
    setObstacles([]);
    obstacleTimerRef.current = 0;
    setBackgroundX(0);
    if (gameOver){
      setGameOver(false);
    } else {
      setGameOver(true);
    }
    setScore(0);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver]);

  return (
    <div
      style={{
        backgroundImage: `url(${forest_background})`,
        backgroundSize: "cover",
        backgroundPosition: `${backgroundX}px 0`,
      }}
      className="transition-all h-screen w-screen bg-neutral-800 text-white flex relative justify-center items-center overflow-hidden"
    >
      {/* Score Counter */}
      <div className="absolute top-4 right-4 text-2xl font-bold">
        Score: {score}
      </div>

      {/* Owl */}
      <div
        ref={owlRef}
        style={{
          top: birdY,
        }}
        className="w-[100px] h-[100px] absolute left-[100px] transition-all"
      >
        <img
          src={own_img}
          alt="owl"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Obstacles */}
      {obstacles.map((obs, index) => (
        <div key={index}>
          {/* Top Obstacle */}
          <div
            style={{
              left: `${obs.x}px`,
              width: `${obstacleWidth}px`,
              height: `${obs.topHeight}px`,
            }}
            className="bg-green-700 absolute top-0"
          ></div>
          {/* Bottom Obstacle */}
          <div
            style={{
              left: `${obs.x}px`,
              width: `${obstacleWidth}px`,
              height: `${obs.bottomHeight}px`,
              top: `${obs.topHeight + obstacleGap}px`,
            }}
            className="bg-green-700 absolute"
          ></div>
        </div>
      ))}

      {/* Game Over Message */}
      {gameOver && (
        <div className="absolute text-4xl font-bold text-red-600 text-center">
          Game Over
          <div className="text-xl mt-4">Press 'R' to Restart</div>
        </div>
      )}
    </div>
  );
}

export default App;
