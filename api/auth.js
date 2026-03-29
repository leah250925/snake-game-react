const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database configuration missing' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { action, username, password } = req.body

    if (action === 'register') {
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (existing) {
        return res.status(400).json({ error: 'Username already exists' })
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{ username, password, created_at: new Date().toISOString() }])
        .select()

      if (error) throw error
      return res.status(201).json({ username })

    } else if (action === 'login') {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' })
      }

      return res.status(200).json({ username })
    }

  } catch (error) {
    console.error('Auth Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
