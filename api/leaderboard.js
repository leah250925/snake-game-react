const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 初始化 Supabase 客户端
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database configuration missing' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    if (req.method === 'GET') {
      // 获取排行榜
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(100)

      if (error) throw error
      return res.status(200).json(data)

    } else if (req.method === 'POST') {
      // 提交分数
      const { username, score } = req.body

      if (!username || score === undefined) {
        return res.status(400).json({ error: 'Username and score required' })
      }

      // 检查是否已存在该用户
      const { data: existing } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('username', username)
        .single()

      if (existing) {
        // 更新最高分
        if (score > existing.score) {
          const { data: updated, error } = await supabase
            .from('leaderboard')
            .update({ score, updated_at: new Date().toISOString() })
            .eq('username', username)
            .select()
          
          if (error) throw error
          return res.status(200).json(updated[0])
        }
        return res.status(200).json(existing)
      } else {
        // 创建新记录
        const { data: created, error } = await supabase
          .from('leaderboard')
          .insert([{ username, score, created_at: new Date().toISOString() }])
          .select()

        if (error) throw error
        return res.status(201).json(created[0])
      }
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
