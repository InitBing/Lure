# LureBin 路亚小程序 🎣

路亚爱好者的一站式平台：**记录作钓 · 发现钓点 · 二手交易**

---

## 项目结构

```
lurebin/
├── server/                 # 后端服务 (Node.js + Koa)
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   ├── config/        # 配置
│   │   └── index.js       # 入口
│   ├── package.json
│   └── .env.example
├── miniprogram/           # 微信小程序
│   ├── pages/            # 页面
│   ├── images/           # 图片资源
│   ├── app.js            # 小程序入口
│   ├── app.json          # 小程序配置
│   └── project.config.json
├── database/             # 数据库脚本
│   └── init.sql         # 初始化 SQL
└── docs/                # 文档
    └── API.md          # API 接口文档
```

---

## 快速开始

### 1. 数据库初始化

```bash
# 创建数据库
mysql -u root -p < database/init.sql
```

### 2. 后端服务

```bash
cd server

# 安装依赖
npm install

# 复制环境配置
cp .env.example .env

# 编辑 .env 文件，填入你的配置

# 启动服务 (开发)
npm run dev

# 启动服务 (生产)
npm start
```

### 3. 小程序

```bash
# 打开微信开发者工具
# 导入 miniprogram 目录
# 填入你的 AppID
# 编译运行
```

---

## 功能模块

### 已实现 ✅

- [x] 用户微信登录
- [x] 钓点列表/详情/筛选
- [x] 作钓记录发布/浏览
- [x] 二手商品发布/浏览
- [x] 视频列表/详情
- [x] 资讯列表/详情
- [x] 消息系统
- [x] 评论系统
- [x] 点赞/收藏/关注
- [x] 搜索功能

### 开发中 🚧

- [ ] 地图模式钓点展示
- [ ] 视频上传
- [ ] 资讯爬虫
- [ ] 管理后台
- [ ] 天气/潮汐集成

---

## API 接口

详见 [docs/API.md](docs/API.md)

### 主要接口

| 模块 | 接口 | 说明 |
|------|------|------|
| 认证 | POST /api/v1/auth/wechat | 微信登录 |
| 钓点 | GET /api/v1/spots | 钓点列表 |
| 钓点 | GET /api/v1/spots/:id | 钓点详情 |
| 作钓 | GET/POST /api/v1/logs | 作钓记录 |
| 二手 | GET/POST /api/v1/items | 二手商品 |
| 视频 | GET/POST /api/v1/videos | 视频 |
| 资讯 | GET /api/v1/articles | 资讯 |
| 消息 | GET/POST /api/v1/messages | 消息 |

---

## 技术栈

### 后端
- **框架**: Koa 2
- **ORM**: Sequelize
- **数据库**: MySQL 8.0
- **缓存**: Redis (可选)
- **认证**: JWT
- **存储**: 腾讯云 COS

### 前端
- **平台**: 微信小程序
- **UI**: 原生 WXML/WXSS
- **地图**: 腾讯地图 SDK

---

## 部署

### 服务器要求
- Node.js >= 18.0
- MySQL 8.0+
- Redis (可选)
- Nginx (推荐)

### 生产环境配置

1. **安装 PM2**
```bash
npm install -g pm2
```

2. **启动服务**
```bash
cd server
pm2 start src/index.js --name lurebin-api
pm2 save
pm2 startup
```

3. **Nginx 配置**
```nginx
server {
    listen 80;
    server_name api.lurebin.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **HTTPS 证书** (推荐)
```bash
# 使用 Let's Encrypt
certbot --nginx -d api.lurebin.com
```

---

## 开发规范

### 代码风格
- 使用 ESLint 检查代码
- 遵循 Airbnb JavaScript 风格指南

### Git 提交
```bash
# 功能开发
git commit -m "feat: 添加钓点筛选功能"

# Bug 修复
git commit -m "fix: 修复登录 token 过期问题"

# 文档更新
git commit -m "docs: 更新 API 文档"
```

---

## 团队协作

- **产品**: @TODO
- **设计**: @TODO
- **前端**: @TODO
- **后端**: @TODO

---

## License

MIT © LureBin Team

---

## 联系方式

- 邮箱: support@lurebin.com
- 微信群：扫码加入开发者交流群
