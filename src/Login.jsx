import { useState, useEffect } from 'react'

const USERS_KEY = 'snake_users'
const CURRENT_USER_KEY = 'snake_current_user'
const LEADERBOARD_KEY = 'snake_leaderboard'

const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const getCurrentUser = () => {
  return localStorage.getItem(CURRENT_USER_KEY)
}

const setCurrentUser = (username) => {
  localStorage.setItem(CURRENT_USER_KEY, username)
}

const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY)
}

const getLeaderboard = () => {
  const leaderboard = localStorage.getItem(LEADERBOARD_KEY)
  return leaderboard ? JSON.parse(leaderboard) : []
}

const saveLeaderboard = (leaderboard) => {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard))
}

const Login = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])

  useEffect(() => {
    setUsers(getUsers())
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Please fill in all fields')
      return
    }

    const user = users.find(u => u.username === username)
    
    if (!user) {
      setError('User not found')
      return
    }

    if (user.password !== password) {
      setError('Incorrect password')
      return
    }

    setCurrentUser(username)
    onLogin(username)
  }

  const handleRegister = (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Please fill in all fields')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (users.find(u => u.username === username)) {
      setError('Username already exists')
      return
    }

    const newUser = { username, password }
    const newUsers = [...users, newUser]
    saveUsers(newUsers)
    setUsers(newUsers)
    
    setCurrentUser(username)
    onRegister(username)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '30px',
          fontSize: '36px'
        }}>
          🐍 Snake Game
        </h1>

        <div style={{
          background: '#f0f0f0',
          padding: '10px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              padding: '10px 20px',
              background: isLogin ? '#667eea' : '#ddd',
              color: isLogin ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              padding: '10px 20px',
              background: !isLogin ? '#667eea' : '#ddd',
              color: !isLogin ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          {isLogin ? (
            <p>Don't have an account? <span style={{ color: '#667eea', cursor: 'pointer' }} onClick={() => setIsLogin(false)}>Register here</span></p>
          ) : (
            <p>Already have an account? <span style={{ color: '#667eea', cursor: 'pointer' }} onClick={() => setIsLogin(true)}>Login here</span></p>
          )}
        </div>
      </div>
    </div>
  )
}

export { Login, getLeaderboard, saveLeaderboard, getCurrentUser, clearCurrentUser }
