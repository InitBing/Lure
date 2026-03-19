# LureBin 部署指南 🚀

## 环境准备

### 1. 服务器 (推荐配置)
- **CPU**: 2 核
- **内存**: 4GB
- **硬盘**: 40GB SSD
- **系统**: Ubuntu 20.04 LTS / CentOS 7+

### 2. 安装依赖

#### Ubuntu/Debian
```bash
# 更新包
sudo apt update

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 MySQL 8.0
sudo apt install -y mysql-server

# 安装 Redis
sudo apt install -y redis-server

# 安装 Nginx
sudo apt install -y nginx

# 安装 Git
sudo apt install -y git
```

#### CentOS/RHEL
```bash
# 安装 Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 MySQL 8.0
sudo yum install -y mysql-server

# 安装 Redis
sudo yum install -y redis

# 安装 Nginx
sudo yum install -y nginx

# 安装 Git
sudo yum install -y git
```

---

## 数据库配置

### 1. 创建数据库和用户
```sql
-- 登录 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE lurebin DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户 (生产环境请用强密码)
CREATE USER 'lurebin'@'localhost' IDENTIFIED BY 'your_strong_password';

-- 授权
GRANT ALL PRIVILEGES ON lurebin.* TO 'lurebin'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 初始化表结构
```bash
mysql -u lurebin -p lurebin < database/init.sql
```

---

## 后端部署

### 1. 克隆代码
```bash
cd /var/www
git clone https://github.com/your-repo/lurebin.git
cd lurebin/server
```

### 2. 安装依赖
```bash
npm install --production
```

### 3. 配置环境变量
```bash
cp .env.example .env
nano .env
```

**必填配置：**
```env
NODE_ENV=production
PORT=3000

DB_HOST=localhost
DB_USER=lurebin
DB_PASSWORD=your_strong_password
DB_NAME=lurebin

WECHAT_APP_ID=wx_xxxxxxxxxxxxxx
WECHAT_APP_SECRET=your_app_secret

JWT_SECRET=your_very_long_and_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

COS_BUCKET=your-bucket-123456
COS_REGION=ap-guangzhou
COS_SECRET_ID=your_secret_id
COS_SECRET_KEY=your_secret_key
COS_BASE_URL=https://cos.lurebin.com
```

### 4. 使用 PM2 管理进程
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start src/index.js --name lurebin-api

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs lurebin-api
```

### 5. 配置 Nginx
```bash
sudo nano /etc/nginx/sites-available/lurebin
```

**Nginx 配置：**
```nginx
server {
    listen 80;
    server_name api.lurebin.com;

    # 重定向到 HTTPS (生产环境)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 限流
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
    }
}

# HTTPS 配置 (启用 SSL 后)
server {
    listen 443 ssl http2;
    server_name api.lurebin.com;

    ssl_certificate /etc/letsencrypt/live/api.lurebin.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.lurebin.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        # ... 同上
    }
}
```

**启用站点：**
```bash
sudo ln -s /etc/nginx/sites-available/lurebin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. 配置 HTTPS (Let's Encrypt)
```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.lurebin.com

# 自动续期 (已自动添加到 cron)
sudo certbot renew --dry-run
```

---

## 小程序部署

### 1. 配置 AppID
编辑 `miniprogram/project.config.json`：
```json
{
  "appid": "wx_xxxxxxxxxxxxxx",
  "projectname": "lurebin"
}
```

### 2. 上传代码
1. 打开 **微信开发者工具**
2. 导入 `miniprogram` 目录
3. 点击 **上传** 按钮
4. 填写版本号和备注

### 3. 提交审核
1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 版本管理 → 选择刚上传的版本
3. 提交审核

### 4. 发布上线
审核通过后，点击 **发布** 即可

---

## 监控与日志

### 1. PM2 监控
```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs lurebin-api

# 重启服务
pm2 restart lurebin-api

# 查看状态
pm2 status
```

### 2. 系统监控
```bash
# 安装 htop
sudo apt install -y htop

# 查看磁盘
df -h

# 查看内存
free -h

# 查看 Nginx 状态
sudo systemctl status nginx
```

### 3. 日志轮转
创建 `/etc/logrotate.d/lurebin`：
```
/var/log/lurebin/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
}
```

---

## 备份策略

### 1. 数据库备份
创建备份脚本 `/usr/local/bin/backup-lurebin.sh`：
```bash
#!/bin/bash
BACKUP_DIR="/backup/lurebin"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u lurebin -p'password' lurebin > $BACKUP_DIR/db_$DATE.sql

# 压缩
gzip $BACKUP_DIR/db_$DATE.sql

# 删除 7 天前的备份
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

设置定时任务：
```bash
crontab -e
# 每天凌晨 2 点备份
0 2 * * * /usr/local/bin/backup-lurebin.sh
```

### 2. 代码备份
```bash
# 定期 git pull
cd /var/www/lurebin
git pull origin main
pm2 restart lurebin-api
```

---

## 故障排查

### 常见问题

**1. 服务无法启动**
```bash
# 查看 PM2 日志
pm2 logs lurebin-api --lines 100

# 检查端口占用
lsof -i :3000

# 检查 Node 版本
node -v
```

**2. 数据库连接失败**
```bash
# 测试连接
mysql -u lurebin -p -h localhost lurebin

# 检查 MySQL 状态
sudo systemctl status mysql
```

**3. Nginx 502 错误**
```bash
# 检查后端服务
pm2 status

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

**4. 小程序请求失败**
- 检查域名是否备案
- 检查 HTTPS 证书是否有效
- 检查小程序后台 request 合法域名配置

---

## 性能优化

### 1. 数据库优化
```sql
-- 添加索引 (根据实际查询)
CREATE INDEX idx_logs_user_date ON logs(user_id, log_date);
CREATE INDEX idx_items_cate_status ON items(category, status);

-- 分析慢查询
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

### 2. Redis 缓存
```javascript
// 缓存热点数据 (如首页推荐)
const cache = await redis.get('home_feed:page:1');
if (cache) {
  ctx.body = JSON.parse(cache);
  return;
}
// ... 查询数据库
await redis.setex('home_feed:page:1', 300, JSON.stringify(data));
```

### 3. CDN 加速
- 图片/视频使用腾讯云 COS + CDN
- 静态资源使用 CDN 分发

---

## 安全加固

### 1. 防火墙配置
```bash
# 只开放必要端口
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. SSH 安全
```bash
# 禁用密码登录，使用密钥
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no
sudo systemctl restart sshd
```

### 3. 定期更新
```bash
# 系统更新
sudo apt update && sudo apt upgrade -y

# Node 依赖更新
cd /var/www/lurebin/server
npm audit fix
```

---

## 联系支持

部署遇到问题？
- 📧 Email: support@lurebin.com
- 💬 开发者微信群
