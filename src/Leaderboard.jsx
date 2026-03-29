import { useState, useEffect } from 'react'

const LEADERBOARD_API = '/api/leaderboard'

const Leaderboard = ({ onClose }) => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(LEADERBOARD_API)
      if (!response.ok) throw new Error('Failed to fetch leaderboard')
      const data = await response.json()
      setLeaderboard(data.slice(0, 20))
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      // Fallback to local storage if API fails
      const leaderboardData = localStorage.getItem('snake_leaderboard')
      if (leaderboardData) {
        const parsed = JSON.parse(leaderboardData)
        const sorted = parsed.sort((a, b) => b.score - a.score)
        setLeaderboard(sorted.slice(0, 20))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{
            color: '#333',
            fontSize: '32px',
            margin: 0
          }}>
            🏆 Global Leaderboard
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>Loading...</p>
            <p>Fetching global scores</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>No scores yet</p>
            <p>Be the first to set a record!</p>
          </div>
        ) : (
          <div style={{
            overflowY: 'auto',
            flex: 1,
            paddingRight: '10px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '18px'
            }}>
              <thead>
                <tr style={{ borderBottom: '3px solid #667eea' }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '15px 10px',
                    color: '#333',
                    fontWeight: 'bold'
                  }}>
                    Rank
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '15px 10px',
                    color: '#333',
                    fontWeight: 'bold'
                  }}>
                    Player
                  </th>
                  <th style={{
                    textAlign: 'right',
                    padding: '15px 10px',
                    color: '#333',
                    fontWeight: 'bold'
                  }}>
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: '1px solid #eee',
                      background: index === 0 ? '#fff3cd' : index === 1 ? '#e2e3e5' : index === 2 ? '#d1ecf1' : 'transparent'
                    }}
                  >
                    <td style={{
                      padding: '15px 10px',
                      fontWeight: 'bold',
                      color: index === 0 ? '#ffc107' : index === 1 ? '#6c757d' : index === 2 ? '#17a2b8' : '#333'
                    }}>
                      {index + 1}
                      {index === 0 ? ' 🥇' : index === 1 ? ' 🥈' : index === 2 ? ' 🥉' : ''}
                    </td>
                    <td style={{
                      padding: '15px 10px',
                      color: '#333'
                    }}>
                      {entry.username}
                    </td>
                    <td style={{
                      padding: '15px 10px',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#667eea'
                    }}>
                      {entry.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {leaderboard.length > 20 && (
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            color: '#666',
            fontSize: '14px'
          }}>
            Showing top 20 players
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
