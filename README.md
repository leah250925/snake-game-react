# 🐍 贪吃蛇游戏 - 全球对战版

一个基于 React 的现代贪吃蛇游戏，支持全球排行榜！

## 🎮 游戏特性

- ✅ 经典贪吃蛇玩法
- ✅ 难度选择（简单/普通/困难）
- ✅ 用户登录系统
- ✅ 🌍 **全球实时排行榜**
- ✅ 粒子特效
- ✅ 音效与背景音乐
- ✅ 最高分记录
- ✅ 响应式设计

## 🚀 快速开始

### 本地运行

```bash
# 1. 克隆项目
git clone <你的仓库地址>
cd snake-game-react

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 http://localhost:5173 即可游玩！

### 部署到网上（推荐）

详见 [QUICK_START.md](./QUICK_START.md) - 5 分钟快速部署指南

## 🌍 全球排行榜设置

要让排行榜正常工作，需要配置 Supabase 数据库：

### 1. 创建 Supabase 账号
访问 https://supabase.com 注册

### 2. 创建数据库表
按照 [DEPLOYMENT.md](./DEPLOYMENT.md) 的说明创建 `leaderboard` 表

### 3. 配置环境变量
在 Vercel 部署时添加：
```env
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_ANON_KEY=你的 anon 密钥
```

### 4. 部署
```bash
npm install -g vercel
vercel --prod
```

## 📁 项目结构

```
snake-game-react/
├── api/
│   └── leaderboard.js      # 全球排行榜 API
├── src/
│   ├── App.jsx             # 主游戏组件
│   ├── Login.jsx           # 登录组件
│   ├── Leaderboard.jsx     # 排行榜组件
│   └── index.css           # 全局样式
├── index.html
├── package.json
├── vite.config.js
├── vercel.json              # Vercel 部署配置
├── QUICK_START.md          # 快速部署指南
└── DEPLOYMENT.md           # 详细部署文档
```

## 🎯 游戏操作

- **方向键**：控制蛇的移动方向
- **空格键**：暂停/继续游戏
- **鼠标**：点击按钮进行各种操作

## 🏆 游戏规则

1. 吃到食物得 10 分
2. 蛇身变长
3. 撞墙或撞到自己游戏结束
4. 难度越高，蛇的速度越快

## 💰 费用说明

- **Vercel**: 免费计划足够个人使用
- **Supabase**: 免费计划包含：
  - 500MB 数据库空间
  - 50,000 月活跃用户
  - 完全够用！

## 🛠️ 技术栈

- **前端**: React 18 + Vite
- **后端**: Vercel Serverless Functions
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel
- **样式**: CSS-in-JS

## 📝 更新日志

### v2.0.0
- ✅ 添加全球排行榜
- ✅ 集成 Supabase 数据库
- ✅ 支持 Vercel 部署

### v1.1.0
- ✅ 修复暂停/继续游戏 bug
- ✅ 优化游戏界面大小

### v1.0.0
- ✅ 基础游戏功能
- ✅ 用户登录系统
- ✅ 本地排行榜

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [React 文档](https://react.dev)

---

**享受游戏！🎮**
