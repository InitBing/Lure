# LureBin 管理后台使用指南

## 快速开始

### 1. 创建管理员账户

在数据库中执行：

```sql
-- 先创建用户
INSERT INTO users (openid, nickname, is_admin) VALUES ('admin_openid', '管理员', 1);

-- 创建管理员 (密码需要加密，这里用 bcrypt 生成)
-- 默认密码：admin123
INSERT INTO admins (user_id, username, password_hash, role) 
VALUES (1, 'admin', '$2a$10$YourBcryptHashHere', 1);
```

**生成密码哈希（推荐方式）：**

```bash
# 使用 Node.js 生成
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
```

### 2. 启动管理后台

```bash
cd admin

# 安装依赖
npm install

# 开发模式
npm run dev

# 访问 http://localhost:3001
```

### 3. 登录管理后台

- 地址：`http://localhost:3001/login`
- 用户名：`admin`
- 密码：`admin123` (首次登录后请修改)

---

## 功能模块

### 📊 数据统计

- 总用户数、钓点数、作钓记录数
- 二手商品数、视频数
- 7 日新增用户
- 待审核钓点/视频提醒

### 👥 用户管理

- 用户列表查看
- 搜索/筛选用户
- 封禁/解封用户
- 查看用户统计 (作钓次数、粉丝数等)
- 信用分管理

### 📍 钓点管理

- 钓点列表 (含待审核)
- 钓点审核 (通过/拒绝)
- 钓点上线/下线
- 查看钓点统计 (访问量、作钓记录数)

### 📝 内容管理

**作钓记录：**
- 查看所有作钓记录
- 删除违规记录

**二手商品：**
- 商品列表管理
- 删除违规商品

**视频：**
- 视频审核 (先审后发)
- 视频下架/删除

### ⚙️ 系统设置

- 基本信息配置
- 审核开关设置
- 敏感词过滤
- 管理员管理
- 系统信息查看

---

## API 接口

### 认证接口

```
POST /api/v1/admin/login
Body: { username, password }
Response: { token, admin }
```

### 统计接口

```
GET /api/v1/admin/stats
Headers: Authorization: Bearer {token}
Response: { users, spots, logs, items, videos, ... }
```

### 用户管理

```
GET /api/v1/admin/users?page=1&page_size=20&keyword=&status=
PUT /api/v1/admin/users/:id/status
Body: { status: 0|1 }
```

### 钓点管理

```
GET /api/v1/admin/spots?page=1&page_size=20&status=&keyword=
PUT /api/v1/admin/spots/:id/audit
Body: { status: 0|1|2, reason }
```

### 内容管理

```
GET /api/v1/admin/contents?type=log|item|video&page=1&status=
DELETE /api/v1/admin/contents/:type/:id
```

---

## 权限说明

| 角色 | 权限 |
|------|------|
| 超级管理员 (1) | 所有权限 |
| 内容审核 (2) | 钓点/视频审核、内容管理 |
| 运营 (3) | 用户管理、内容查看 |

---

## 安全建议

1. **首次登录后立即修改密码**
2. **不要使用默认密码**
3. **定期备份数据库**
4. **限制管理后台访问 IP**
5. **启用 HTTPS**

---

## 生产环境部署

### 1. 构建前端

```bash
cd admin
npm run build
# 输出到 dist/ 目录
```

### 2. 配置 Nginx

```nginx
server {
    listen 80;
    server_name admin.lurebin.com;

    location / {
        root /var/www/lurebin/admin/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. 环境变量

在服务器 `.env` 文件中配置：

```env
# 管理后台配置
ADMIN_SESSION_SECRET=your_session_secret
ADMIN_TOKEN_EXPIRES_IN=24h
```

---

## 故障排查

### 无法登录

1. 检查数据库中管理员账户是否存在
2. 确认密码哈希是否正确生成
3. 查看后端日志

### API 请求失败

1. 检查 Token 是否有效
2. 确认 CORS 配置
3. 查看浏览器控制台错误

### 页面空白

1. 检查前端构建是否成功
2. 确认路由配置
3. 查看浏览器控制台错误

---

## 联系支持

遇到问题？
- 📧 Email: admin@lurebin.com
- 📱 内部管理群
