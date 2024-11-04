import { useEffect, useState, useRef } from "react";
// import own_img from "./assets/owl.png";
import own_img from "./assets/myowl.png";
// import own_img from "./assets/myowl2.png";
import boold from './assets/myblood.png'

import col_up from './assets/col_up.png'
import col_down from './assets/col_down.png'

// import forest_background from "./assets/bg.jpg";
// import forest_background from "./assets/bg1.jpg";
import forest_background from "./assets/bg2.jpg";

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

  const gravity = 10; // Adjusted gravity force
  const jumpHeight = 1000; // Adjusted jump height
  const obstacleWidth = 100; // Width of the obstacles
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
      setObstacles((prevObstacles) => {
        checkCollision(prevObstacles);
        return prevObstacles.map((obs) => ({ ...obs, x: obs.x - 2 }))
      }
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


    setObstacles((prevObstacles) => {
      return [...prevObstacles, newObstacle];
    });
  };

  const checkCollision = (prevObstacles: Obstacle[]) => {
    if (owlRef.current) {
      const owlRect = owlRef.current.getBoundingClientRect();

      if (owlRect.top <= 0 || owlRect.bottom >= window.innerHeight) {
        setGameOver(true);
      }
      console.log(prevObstacles);
      for (const obs of prevObstacles) {
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

        // console.log(owlRect, topObsRect, bottomObsRect);

        if (
          rectsOverlap(owlRect, topObsRect) ||
          rectsOverlap(owlRect, bottomObsRect)
        ) {
          setBirdY(owlRect.top);
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
    setBirdY(window.innerHeight / 2);
    // setObstacles([]);
    obstacleTimerRef.current = 0;
    setBackgroundX(0);
    if (gameOver) {
      setGameOver(false);
    } else {
      setGameOver(true);
    }
    setScore(0);
    window.location.reload();
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
        backgroundSize: "100%",
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
        className="w-[120px] h-[90px] absolute left-[100px] transition-all"
      >
        <img
          src={own_img}
          alt="owl"
          className="w-full h-full object-fill"
        />
      </div>

      {/* Owl */}
      {gameOver && <div
        ref={owlRef}
        style={{
          top: birdY + 65,
        }}
        className="w-[120px] h-[90px] absolute left-[100px] transition-all"
      >
        <img
          src={boold}
          alt="owl"
          className="w-full h-full object-cover"
        />
      </div>}

      {/* Obstacles */}
      {obstacles.map((obs, index) => (
        <div key={index}>
          {/* Top Obstacle */}
          <div
            style={{
              left: `${obs.x}px`,
              width: `${obstacleWidth}px`,
              height: `${obs.topHeight}px`,
              backgroundImage: 'url(' + col_up + ')',
              backgroundSize: '100% 100%  ',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'bottom',
            }}
            className=" absolute top-0"
          ></div>
          {/* Bottom Obstacle */}
          <div
            style={{
              left: `${obs.x}px`,
              width: `${obstacleWidth}px`,
              height: `${obs.bottomHeight}px`,
              top: `${obs.topHeight + obstacleGap}px`,
              backgroundImage: 'url(' + col_down + ')',
              backgroundSize: '100% 100%  ',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top',
            }}
            className=" absolute"
          ></div>
        </div>
      ))}

      {/* Game Over Message */}
      {gameOver && (
        <div className="fixed w-screen h-screen bg-black/40 flex items-center justify-center">
          <div className=" text-4xl font-bold text-white text-center bg-red-700 px-12 py-8 rounded-lg">
            Game Over
            <div className="text-xl mt-4">Press 'R' to Restart</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
