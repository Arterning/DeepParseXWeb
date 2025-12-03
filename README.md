# DeepParseX Web - 前端应用

基于 Next.js 16、shadcn/ui 和 Tailwind CSS 4 构建的现代化前端应用。

## 技术栈

- **Next.js 16** - React 框架，使用 App Router
- **React 19** - UI 库
- **TypeScript** - 类型安全
- **Tailwind CSS 4** - 样式框架
- **shadcn/ui** - UI 组件库
- **Axios** - HTTP 客户端
- **Lucide React** - 图标库

## 开始使用

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.local.example` 到 `.env.local` 并配置你的后端 API 地址：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 启动开发服务器

```bash
pnpm dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

## 已实现功能

### 登录页面 (`/login`)

- 简约高级的设计风格
- 渐变背景与玻璃态效果
- 用户名、密码、验证码输入
- 验证码自动加载和刷新
- 表单验证
- 错误提示
- 加载状态

## 项目结构

```
web/
├── app/                    # Next.js App Router 页面
│   ├── login/             # 登录页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   └── ui/                # shadcn/ui 组件
├── lib/                   # 工具函数和配置
│   ├── api/               # API 客户端
│   │   ├── client.ts      # Axios 配置
│   │   └── auth.ts        # 认证 API
│   └── utils.ts           # 工具函数
├── public/                # 静态资源
└── ...配置文件
```

## API 接口

### 认证接口

- `GET /api/v1/auth/captcha` - 获取验证码
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出

## 添加新的 shadcn 组件

```bash
pnpm dlx shadcn@latest add [component-name]
```

例如：
```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add card
```

## 构建生产版本

```bash
pnpm build
pnpm start
```

## 开发规范

- 使用 TypeScript 进行类型检查
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 组件采用函数式编程
- 使用 Client Component (`'use client'`) 处理交互逻辑
- API 调用统一通过 `lib/api` 目录管理

## 后续开发

待实现的功能：
- 主页面和仪表板
- 文档管理界面
- 知识图谱可视化
- 用户管理
- 系统设置
- 响应式设计优化
