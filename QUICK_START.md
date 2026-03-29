# 🚀 快速部署指南

## 只需 5 分钟，让你的游戏上线！

### 第 1 步：创建 Supabase 数据库（2 分钟）

1. 访问 https://supabase.com
2. 用 GitHub 账号登录
3. 点击 "New Project"
4. 填写信息：
   - Name: `snake-game`
   - Database Password: 创建一个密码（保存好！）
   - Region: 选择最近的地区
5. 等待项目创建完成

### 第 2 步：创建数据表（1 分钟）

1. 点击左侧 **Table Editor** → **New Table**
2. Name: `leaderboard`
3. 勾选 "Enable Row Level Security"
4. 点击 "Save"

5. 点击刚创建的表，添加列：
   - `username`: varchar(50)，不允许 NULL
   - `score`: int8，不允许 NULL，默认 0
   - `created_at`: timestamptz，默认 `now()`
   - `updated_at`: timestamptz，默认 `now()`

6. 点击 **Authentication** → **Policies**
7. 添加 3 个策略（都选 `leaderboard` 表）：
   - SELECT 策略：`true`
   - INSERT 策略：`true`
   - UPDATE 策略：`true`

### 第 3 步：获取 API 密钥（30 秒）

1. 点击 **Settings** → **API**
2. 复制两个值：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGci...`（很长的字符串）

### 第 4 步：安装依赖（30 秒）

在项目根目录运行：

```bash
npm install
```

### 第 5 步：部署到 Vercel（1 分钟）

#### 方法 A：使用 Vercel 官网（推荐）

1. 访问 https://vercel.com/new
2. 用 GitHub 账号登录
3. 点击 "Import Git Repository"
4. 选择你的项目仓库
5. **重要**：点击 "Environment Variables"
6. 添加两个环境变量：
   ```
   SUPABASE_URL = https://你的项目.supabase.co
   SUPABASE_ANON_KEY = 你的 anon 密钥
   ```
7. 点击 "Deploy"
8. 等待 1-2 分钟

#### 方法 B：使用命令行

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 设置环境变量
vercel env add SUPABASE_URL
# 粘贴你的 Project URL

vercel env add SUPABASE_ANON_KEY
# 粘贴你的 anon 密钥

# 部署
vercel --prod
```

### 第 6 步：分享游戏（10 秒）

部署完成后，你会得到类似这样的链接：

```
https://snake-game-react.vercel.app
```

**🎉 完成！** 把这个链接分享给任何人即可游玩！

---

## 验证全球排行榜

1. 打开你的游戏链接
2. 登录账号
3. 玩一局游戏
4. 游戏结束后查看排行榜
5. 让朋友也玩一局，看是否出现在同一个排行榜上

如果能看到彼此的分数，说明全球排行榜正常工作！✅

---

## 常见问题

**Q: 部署失败怎么办？**
A: 检查：
- 环境变量是否正确填写
- Supabase 数据库是否创建成功
- RLS 策略是否正确设置

**Q: 本地测试怎么弄？**
A: 创建 `.env.local` 文件：
```env
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_ANON_KEY=你的 anon 密钥
```
然后运行 `npm run dev`

**Q: 如何更新游戏？**
A: 只需 push 代码到 GitHub，Vercel 会自动重新部署！

**Q: 费用如何？**
A: 
- Vercel: 免费计划足够个人项目使用
- Supabase: 免费计划包括 500MB 数据库，对小游戏绰绰有余

---

## 技术支持

- Supabase 文档：https://supabase.com/docs
- Vercel 文档：https://vercel.com/docs
- 遇到问题？查看控制台错误信息
