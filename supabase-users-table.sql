-- 创建用户表
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允许任何人读取用户信息
CREATE POLICY "Allow public read access" ON users
  FOR SELECT
  USING (true);

-- 允许任何人插入新用户（注册）
CREATE POLICY "Allow public insert access" ON users
  FOR INSERT
  WITH CHECK (true);
