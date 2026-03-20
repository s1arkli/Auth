# mono frontend

基于 `React`（用于构建界面的前端库） + `TypeScript`（带类型系统的 JavaScript 超集） + `Vite`（前端构建工具）的认证前端项目。

## 本地启动

```bash
cd frontend
npm install
npm run dev
```

默认开发地址：`http://127.0.0.1:5173`

## 后端联调约定

- 开发环境通过 `Vite proxy`（开发代理）把 `/account` 和 `/api/v1` 转发到 `http://127.0.0.1:9000`
- 前端会优先尝试 `.env` 中的 `VITE_API_BASE_PATH`
- 如果当前网关路由和 `swagger`（接口文档）定义不一致，前端还会自动兜底尝试：
  - `/account`
  - `/api/v1/account`

## 已完成

- 注册页、登录页合并为一个切换式认证门户，视觉上对齐 `Pencil`（原型设计工具）原型图的双栏结构
- 注册、登录接口接入完成
- 调用成功后弹出提示，不做页面跳转
- 成功响应会在右侧联调状态卡片中展示摘要，方便验收

## 目录说明

```text
frontend
├── docs
├── src
│   ├── api
│   ├── components
│   ├── config
│   ├── lib
│   ├── styles
│   └── types
├── eslint.config.mjs
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

