import { useState, useEffect, useCallback, useRef } from 'react'
import { Login, getLeaderboard, saveLeaderboard, getCurrentUser, clearCurrentUser } from './Login'
import Leaderboard from './Leaderboard'

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

const bgMusic = createBackgroundMusic()

const App = () => {
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [showLogin, setShowLogin] = useState(!currentUser)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  
  const [snake, setSnake] = useState([{ x: 12, y: 12 }])
  const [food, setFood] = useState({ x: 18, y: 12 })
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('snakeHighScore')
      return saved ? parseInt(saved) : 0
    } catch {
      return 0
    }
  })
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [difficulty, setDifficulty] = useState('normal')
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [musicEnabled, setMusicEnabled] = useState(true)

  const gameLoopRef = useRef(null)
  const directionRef = useRef(direction)
  const directionChangedRef = useRef(false)
  const scoreRef = useRef(0)
  const highScoreRef = useRef(highScore)
  const snakeRef = useRef([{ x: 12, y: 12 }])
  const foodRef = useRef({ x: 18, y: 12 })
  const isPlayingRef = useRef(false)
  const gameOverRef = useRef(false)
  const isPausedRef = useRef(false)
  const showDifficultyMenuRef = useRef(true)
  const showLoginRef = useRef(showLogin)

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    highScoreRef.current = highScore
  }, [highScore])

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

  useEffect(() => {
    showLoginRef.current = showLogin
  }, [showLogin])

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
        bgMusic.start()
      } catch (e) {
        console.warn('Failed to start background music:', e)
      }
    }
  }, [resetGame, musicEnabled])

  const handleLogin = useCallback((username) => {
    setCurrentUser(username)
    setShowLogin(false)
  }, [])

  const handleRegister = useCallback((username) => {
    setCurrentUser(username)
    setShowLogin(false)
  }, [])

  const handleLogout = useCallback(() => {
    try {
      clearCurrentUser()
    } catch {}
    setCurrentUser(null)
    setShowLogin(true)
    setIsPlaying(false)
    isPlayingRef.current = false
    try {
      bgMusic.stop()
    } catch {}
  }, [])

  const handleKeyPress = useCallback((e) => {
    if (gameOverRef.current || !isPlayingRef.current || showDifficultyMenuRef.current || showLoginRef.current) return
    
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

  const saveScoreToLeaderboard = useCallback(() => {
    if (!currentUser || scoreRef.current === 0) return
    
    // Save to local storage as backup
    try {
      const leaderboard = getLeaderboard()
      const existingEntry = leaderboard.find(entry => entry.username === currentUser)
      
      if (existingEntry) {
        if (scoreRef.current > existingEntry.score) {
          existingEntry.score = scoreRef.current
          existingEntry.date = new Date().toISOString()
        }
      } else {
        leaderboard.push({
          username: currentUser,
          score: scoreRef.current,
          date: new Date().toISOString()
        })
      }
      
      leaderboard.sort((a, b) => b.score - a.score)
      saveLeaderboard(leaderboard)
    } catch (e) {
      console.warn('Failed to save local leaderboard:', e)
    }

    // Save to global leaderboard API
    fetch('/api/leaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: currentUser,
        score: scoreRef.current
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to save score')
      return response.json()
    })
    .then(data => {
      console.log('Score saved to global leaderboard:', data)
    })
    .catch(error => {
      console.warn('Failed to save to global leaderboard:', error)
    })
  }, [currentUser])

  useEffect(() => {
    const moveSnake = () => {
      if (!isPlayingRef.current || gameOverRef.current || isPausedRef.current || showDifficultyMenuRef.current || showLoginRef.current) {
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
            bgMusic.stop()
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

        if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
          const newScore = scoreRef.current + 10
          scoreRef.current = newScore
          setScore(newScore)
          
          const newFood = generateFood()
          setFood(newFood)
          foodRef.current = newFood
          
          try {
            playSound('eat')
          } catch {}
          
          setShowParticles(true)
          setTimeout(() => {
            setShowParticles(false)
          }, 600)
        } else {
          newSnake.pop()
        }

        setSnake(newSnake)
        snakeRef.current = newSnake
      } catch (e) {
        console.warn('Game loop error:', e)
      }
    }

    const speed = DIFFICULTY_SPEEDS[difficulty]
    gameLoopRef.current = setInterval(moveSnake, speed)
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
    }
  }, [difficulty, generateFood])

  useEffect(() => {
    if (gameOver) {
      saveScoreToLeaderboard()
    }
  }, [gameOver, saveScoreToLeaderboard])

  useEffect(() => {
    return () => {
      try {
        bgMusic.stop()
      } catch {}
    }
  }, [])

  const handleRestart = () => {
    resetGame()
    setShowDifficultyMenu(true)
    setIsPlaying(false)
    isPlayingRef.current = false
    try {
      bgMusic.stop()
    } catch {}
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {showLogin ? (
        <Login onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        <>
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
              <span style={{ color: '#ffd700', fontSize: '20px', fontWeight: 'bold' }}>
                👤 {currentUser}
              </span>
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
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Logout
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
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                }}
              >
                Start Game
              </button>

              <div style={{ marginTop: '30px' }}>
                <label style={{ color: 'white', fontSize: '18px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={musicEnabled}
                    onChange={(e) => setMusicEnabled(e.target.checked)}
                    style={{ marginRight: '10px', transform: 'scale(1.5' }}
                  />
                  Background Music
                </label>
              </div>
            </div>
          ) : (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '40px',
                marginBottom: '20px'
              }}>
                <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                  Score: {score}
                </div>
                <div style={{ color: '#ffd700', fontSize: '24px', fontWeight: 'bold' }}>
                  Best: {highScore}
                </div>
              </div>

              <div style={{
                position: 'relative',
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE,
                background: '#1a1a2e',
                border: '3px solid #4a4a6a',
                borderRadius: '10px',
                margin: '0 auto'
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
                      background: index === 0 ? '#00ff00' : '#00cc00',
                      borderRadius: '4px',
                      border: '1px solid #009900'
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
                    background: '#ff0000',
                    borderRadius: '50%',
                    border: '1px solid #cc0000',
                    boxShadow: '0 0 10px #ff0000'
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
                    background: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '10px'
                  }}>
                    <h2 style={{ color: '#ff4444', fontSize: '42px', marginBottom: '20px', textShadow: '0 0 20px #ff0000' }}>
                      Game Over!
                    </h2>
                    <p style={{ color: 'white', fontSize: '28px', marginBottom: '10px' }}>
                      Score: {score}
                    </p>
                    {score >= highScore && score > 0 && (
                      <p style={{ color: '#ffd700', fontSize: '22px', marginBottom: '20px' }}>
                        🏆 New High Score!
                      </p>
                    )}
                    <button
                      onClick={handleRestart}
                      style={{
                        padding: '15px 30px',
                        fontSize: '20px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
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
                    borderRadius: '10px'
                  }}>
                    <h2 style={{ color: '#ffff00', fontSize: '42px', textShadow: '0 0 20px #ffff00' }}>
                      Paused
                    </h2>
                  </div>
                )}
              </div>

              <div style={{ 
                color: 'white', 
                marginTop: '20px', 
                fontSize: '16px',
                opacity: 0.8
              }}>
                <p>Use Arrow Keys to move | Space to pause</p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App
