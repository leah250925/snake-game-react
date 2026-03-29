# 🌍 全球排行榜部署指南

## 第一步：创建 Supabase 数据库（免费）

### 1. 注册 Supabase
1. 访问 https://supabase.com
2. 点击 "Start your project" 或 "Sign Up"
3. 用 GitHub 账号登录（推荐）或邮箱注册

### 2. 创建新项目
1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: `snake-game`（或其他你喜欢的名字）
   - **Database Password**: 创建一个强密码（请保存好！）
   - **Region**: 选择离你最近的地区
3. 点击 "Create new project"
4. 等待 1-2 分钟项目创建完成

### 3. 创建数据表
1. 进入项目后，点击左侧 **Table Editor**
2. 点击 "New Table"
3. 填写表信息：
   - **Name**: `leaderboard`
   - **Enable Row Level Security**: ✅ 勾选
4. 添加列：
   - `id`: int8 (主键，默认就有)
   - `username`: varchar(50) - 不允许 NULL
   - `score`: int8 - 不允许 NULL，默认值 0
   - `created_at`: timestamptz - 默认 `now()`
   - `updated_at`: timestamptz - 默认 `now()`

5. 点击 "Save"

### 4. 设置 Row Level Security (RLS) 策略
1. 点击左侧 **Authentication** → **Policies**
2. 找到 `leaderboard` 表
3. 点击 "New Policy"
4. 创建以下策略：

**策略 1：允许任何人读取**
- Policy type: `SELECT`
- Policy name: `Allow public read access`
- Target roles: `postgres`, `anon`, `authenticated`
- Policy definition:
  ```sql
  true
  ```

**策略 2：允许任何人插入**
- Policy type: `INSERT`
- Policy name: `Allow public insert access`
- Target roles: `postgres`, `anon`, `authenticated`
- Policy definition:
  ```sql
  true
  ```

**策略 3：允许任何人更新**
- Policy type: `UPDATE`
- Policy name: `Allow public update access`
- Target roles: `postgres`, `anon`, `authenticated`
- Policy definition:
  ```sql
  true
  ```

5. 点击 "Review" 然后 "Save Policy"

### 5. 获取 API 密钥
1. 点击左侧 **Settings** → **API**
2. 复制以下两个值：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public**: 类似 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 第二步：配置 Vercel 环境变量

### 方法 1：通过 Vercel 控制台（推荐）

1. 登录 https://vercel.com
2. 导入你的项目后，进入项目设置
3. 点击 **Settings** → **Environment Variables**
4. 添加以下环境变量：

```
SUPABASE_URL = https://你的项目 ID.supabase.co
SUPABASE_ANON_KEY = 你的 anon 密钥
```

5. 点击 "Save"

### 方法 2：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 设置环境变量
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# 部署到生产环境
vercel --prod
```

---

## 第三步：本地测试（可选）

### 1. 安装依赖
```bash
npm install @supabase/supabase-js
```

### 2. 创建本地环境变量文件
创建 `.env.local` 文件：
```env
SUPABASE_URL=https://你的项目 ID.supabase.co
SUPABASE_ANON_KEY=你的 anon 密钥
```

### 3. 本地运行 API
```bash
# 安装 vercel 本地开发工具
npm install -g vercel

# 运行本地开发服务器
vercel dev
```

访问 `http://localhost:3000/api/leaderboard` 测试 API

---

## 第四步：部署到 Vercel

### 1. 提交代码到 Git
```bash
git init
git add .
git commit -m "Add global leaderboard with Supabase"
```

### 2. 推送到 GitHub
```bash
git remote add origin https://github.com/你的用户名/snake-game-react.git
git push -u origin main
```

### 3. 在 Vercel 部署
1. 访问 https://vercel.com/new
2. 选择你的 GitHub 仓库
3. 配置环境变量（如上所述）
4. 点击 "Deploy"
5. 等待 1-2 分钟

### 4. 获取你的游戏链接
部署完成后，你会得到类似这样的链接：
```
https://snake-game-react.vercel.app
```

分享给任何人即可访问！🎮

---

## 第五步：验证全球排行榜

1. 打开你部署的游戏链接
2. 登录或注册账号
3. 玩一局游戏
4. 游戏结束后查看排行榜
5. 让朋友也玩一局，看是否出现在同一个排行榜上

---

## 🎉 完成！

现在你的贪吃蛇游戏拥有：
- ✅ 真正的全球排行榜
- ✅ 所有玩家共享分数排名
- ✅ 通过 Vercel 免费托管
- ✅ 通过 Supabase 免费数据库
- ✅ 任何人访问链接即可游玩

---

## 常见问题

**Q: Supabase 免费额度够吗？**
A: 完全够用！免费计划包括：
- 500MB 数据库空间
- 50,000 月活跃用户
- 对于小游戏绰绰有余

**Q: 如果超过免费额度怎么办？**
A: 升级到 Pro 计划 $25/月，或者优化数据（比如只保留前 1000 名）

**Q: 如何重置排行榜？**
A: 在 Supabase Table Editor 中删除所有数据即可

**Q: 可以自定义排行榜显示吗？**
A: 可以！修改 `src/Leaderboard.jsx` 组件即可

---

## 技术支持

遇到问题？
- Supabase 文档：https://supabase.com/docs
- Vercel 文档：https://vercel.com/docs
- Vercel 部署问题：https://vercel.com/guides
