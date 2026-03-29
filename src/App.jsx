import { useState, useEffect, useCallback, useRef } from 'react'
import Leaderboard, { getLeaderboard, saveLeaderboard } from './Leaderboard'

const GRID_SIZE = 25
const CELL_SIZE = 25
const DIFFICULTY_SPEEDS = {
  easy: 200,
  normal: 150,
  hard: 80
}

let audioContextRef = null

const getAudioContext = () => {
  if (!audioContextRef) {
    try {
      audioContextRef = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.warn('AudioContext not supported:', e)
      return null
    }
  }
  return audioContextRef
}

const playSound = (type) => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    if (type === 'eat') {
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.1)
    } else if (type === 'gameover') {
      oscillator.frequency.setValueAtTime(400, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    }
  } catch (e) {
    console.warn('Sound playback error:', e)
  }
}

const createBackgroundMusic = () => {
  const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66]
  let currentNote = 0
  let isPlaying = false
  let intervalId = null

  const play = () => {
    if (!isPlaying) return
    
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.setValueAtTime(notes[currentNote], ctx.currentTime)
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.3)
      
      currentNote = (currentNote + 1) % notes.length
    } catch (e) {
      console.warn('Background music error:', e)
    }
  }

  return {
    start: () => {
      if (isPlaying) return
      isPlaying = true
      intervalId = setInterval(play, 400)
    },
    stop: () => {
      isPlaying = false
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    },
    isPlaying: () => isPlaying
  }
}

const Particle = ({ x, y }) => {
  const [particles, setParticles] = useState([])
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * Math.PI * 2,
      speed: 2 + Math.random() * 2,
      color: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'][Math.floor(Math.random() * 4)]
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => setIsAnimating(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (!isAnimating) return null

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: x * CELL_SIZE + CELL_SIZE / 2,
            top: y * CELL_SIZE + CELL_SIZE / 2,
            width: '8px',
            height: '8px',
            background: p.color,
            borderRadius: '50%',
            transform: `translate(${Math.cos(p.angle) * p.speed * 20}px, ${Math.sin(p.angle) * p.speed * 20}px)`,
            opacity: 0.8,
            transition: 'all 0.5s ease-out',
            pointerEvents: 'none'
          }}
        />
      ))}
    </>
  )
}

const App = () => {
  const [snake, setSnake] = useState([{ x: 12, y: 12 }])
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(true)
  const [difficulty, setDifficulty] = useState('normal')
  const [showParticles, setShowParticles] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [musicEnabled, setMusicEnabled] = useState(true)

  const snakeRef = useRef(snake)
  const foodRef = useRef(food)
  const directionRef = useRef(direction)
  const isPlayingRef = useRef(isPlaying)
  const gameOverRef = useRef(gameOver)
  const isPausedRef = useRef(isPaused)
  const showDifficultyMenuRef = useRef(showDifficultyMenu)
  const scoreRef = useRef(score)
  const highScoreRef = useRef(highScore)
  const bgMusic = useRef(createBackgroundMusic())

  useEffect(() => {
    try {
      const saved = localStorage.getItem('snakeHighScore')
      if (saved) {
        setHighScore(parseInt(saved))
        highScoreRef.current = parseInt(saved)
      }
    } catch {}
  }, [])

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    snakeRef.current = snake
  }, [snake])

  useEffect(() => {
    foodRef.current = food
  }, [food])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    showDifficultyMenuRef.current = showDifficultyMenu
  }, [showDifficultyMenu])

  const generateFood = useCallback(() => {
    let newFood
    let attempts = 0
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
      attempts++
    } while (
      snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y) &&
      attempts < 100
    )
    return newFood
  }, [])

  const resetGame = useCallback(() => {
    setSnake([{ x: 12, y: 12 }])
    setFood(generateFood())
    setDirection({ x: 1, y: 0 })
    setScore(0)
    setGameOver(false)
    setIsPaused(false)
    setShowParticles(false)
    scoreRef.current = 0
  }, [generateFood])

  const startGame = useCallback(() => {
    resetGame()
    setShowDifficultyMenu(false)
    setIsPlaying(true)
    isPlayingRef.current = true
    if (musicEnabled) {
      try {
        bgMusic.current.start()
      } catch (e) {
        console.warn('Failed to start background music:', e)
      }
    }
  }, [resetGame, musicEnabled])

  const handleKeyPress = useCallback((e) => {
    if (gameOverRef.current || !isPlayingRef.current || showDifficultyMenuRef.current) return
    
    const currentDir = directionRef.current
    
    switch (e.key) {
      case 'ArrowUp':
        if (currentDir.y === 0 && !isPausedRef.current) {
          setDirection({ x: 0, y: -1 })
          directionRef.current = { x: 0, y: -1 }
        }
        break
      case 'ArrowDown':
        if (currentDir.y === 0 && !isPausedRef.current) {
          setDirection({ x: 0, y: 1 })
          directionRef.current = { x: 0, y: 1 }
        }
        break
      case 'ArrowLeft':
        if (currentDir.x === 0 && !isPausedRef.current) {
          setDirection({ x: -1, y: 0 })
          directionRef.current = { x: -1, y: 0 }
        }
        break
      case 'ArrowRight':
        if (currentDir.x === 0 && !isPausedRef.current) {
          setDirection({ x: 1, y: 0 })
          directionRef.current = { x: 1, y: 0 }
        }
        break
      case ' ':
        if (!isPausedRef.current) {
          setIsPaused(true)
          isPausedRef.current = true
        } else {
          setIsPaused(false)
          isPausedRef.current = false
        }
        break
      default:
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    const moveSnake = () => {
      if (!isPlayingRef.current || gameOverRef.current || isPausedRef.current || showDifficultyMenuRef.current) {
        return
      }

      try {
        const currentDir = directionRef.current
        const currentSnake = snakeRef.current
        const currentFood = foodRef.current

        const newHead = {
          x: currentSnake[0].x + currentDir.x,
          y: currentSnake[0].y + currentDir.y
        }

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true)
          gameOverRef.current = true
          
          try {
            playSound('gameover')
            bgMusic.current.stop()
          } catch {}
          
          if (scoreRef.current > highScoreRef.current) {
            setHighScore(scoreRef.current)
            highScoreRef.current = scoreRef.current
            try {
              localStorage.setItem('snakeHighScore', scoreRef.current.toString())
            } catch {}
          }
          return
        }

        const newSnake = [newHead, ...currentSnake]
        
        if (newHead.x === currentFood.x && newHead.y === currentFood.x) {
          setScore(s => {
            const newScore = s + 10
            scoreRef.current = newScore
            return newScore
          })
          setFood(generateFood())
          setShowParticles(true)
          setTimeout(() => setShowParticles(false), 600)
          try {
            playSound('eat')
          } catch {}
        } else {
          newSnake.pop()
        }

        setSnake(newSnake)
      } catch (error) {
        console.error('Game error:', error)
      }
    }

    const gameInterval = setInterval(moveSnake, DIFFICULTY_SPEEDS[difficulty])
    return () => clearInterval(gameInterval)
  }, [difficulty, generateFood])

  const saveScoreToLeaderboard = useCallback(() => {
    if (scoreRef.current === 0) return
    
    const leaderboard = getLeaderboard()
    const existingEntry = leaderboard.find(entry => entry.username === 'Player')
    
    if (existingEntry) {
      if (scoreRef.current > existingEntry.score) {
        existingEntry.score = scoreRef.current
        existingEntry.date = new Date().toISOString()
      }
    } else {
      leaderboard.push({
        username: 'Player',
        score: scoreRef.current,
        date: new Date().toISOString()
      })
    }
    
    leaderboard.sort((a, b) => b.score - a.score)
    saveLeaderboard(leaderboard)
  }, [])

  useEffect(() => {
    if (gameOver) {
      saveScoreToLeaderboard()
    }
  }, [gameOver, saveScoreToLeaderboard])

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '0 20px'
      }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '48px' }}>
          🐍 Snake Game
        </h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={() => setShowLeaderboard(true)}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            🏆 Leaderboard
          </button>
        </div>
      </div>

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}

      {showDifficultyMenu ? (
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '40px',
          borderRadius: '20px',
          display: 'inline-block'
        }}>
          <h2 style={{ color: 'white', marginBottom: '30px', fontSize: '32px' }}>
            Select Difficulty
          </h2>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
            {['easy', 'normal', 'hard'].map(level => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  background: difficulty === level ? '#4CAF50' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                {level === 'easy' ? '😊 Easy' : level === 'normal' ? '😐 Normal' : '😰 Hard'}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            style={{
              padding: '20px 50px',
              fontSize: '24px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            fontSize: '24px'
          }}>
            <span style={{ color: 'white' }}>Score: <strong style={{ color: '#ffd700' }}>{score}</strong></span>
            <span style={{ color: 'white' }}>High Score: <strong style={{ color: '#ffd700' }}>{highScore}</strong></span>
          </div>

          <div style={{
            position: 'relative',
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            background: '#1a1a2e',
            border: '3px solid #667eea',
            borderRadius: '10px',
            margin: '0 auto',
            overflow: 'hidden'
          }}>
            {snake.map((segment, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  background: index === 0 ? '#4CAF50' : '#6bcb77',
                  borderRadius: index === 0 ? '50%' : '4px',
                  margin: '1px',
                  transition: 'all 0.05s'
                }}
              />
            ))}

            <div
              style={{
                position: 'absolute',
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                background: '#ff6b6b',
                borderRadius: '50%',
                margin: '1px'
              }}
            />

            {showParticles && <Particle x={food.x} y={food.y} />}

            {gameOver && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white'
              }}>
                <h2 style={{ fontSize: '48px', marginBottom: '20px' }}>Game Over!</h2>
                <p style={{ fontSize: '24px', marginBottom: '30px' }}>Score: {score}</p>
                <button
                  onClick={() => {
                    resetGame()
                    setShowDifficultyMenu(true)
                    setIsPlaying(false)
                    isPlayingRef.current = false
                  }}
                  style={{
                    padding: '15px 40px',
                    fontSize: '20px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Play Again
                </button>
              </div>
            )}

            {isPaused && !gameOver && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold'
              }}>
                Paused
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px', color: 'white', fontSize: '16px' }}>
            <p>Use Arrow Keys to move • Space to Pause</p>
          </div>
        </>
      )}
    </div>
  )
}

export default App
