import { useState } from 'react'

const API_URL = '/api/auth'
const CURRENT_USER_KEY = 'snake_current_user'
const USERS_DB_KEY = 'snake_users_db'

const getUsersDB = () => {
  try {
    const data = localStorage.getItem(USERS_DB_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

const saveUsersDB = (users) => {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users))
  } catch (e) {
    console.error('Failed to save users:', e)
  }
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

const Login = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCurrentUser(username)
        onLogin(username)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      if (err.message.includes('users') || err.message.includes('table')) {
        const users = getUsersDB()
        const user = users.find(u => u.username === username && u.password === password)
        if (user) {
          setCurrentUser(username)
          onLogin(username)
          setLoading(false)
          return
        }
        setError('Invalid username or password')
      } else {
        setError(err.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCurrentUser(username)
        onRegister(username)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      if (err.message.includes('users') || err.message.includes('table')) {
        const users = getUsersDB()
        const existing = users.find(u => u.username === username)
        if (existing) {
          setError('Username already exists')
        } else {
          users.push({ username, password, createdAt: new Date().toISOString() })
          saveUsersDB(users)
          setCurrentUser(username)
          onRegister(username)
        }
      } else {
        setError(err.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
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
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
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

export { Login, getCurrentUser, clearCurrentUser }
