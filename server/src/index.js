/**
 * LureBin 路亚小程序 - 后端服务入口
 */

require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const helmet = require('koa-helmet');
const logger = require('koa-logger');
const compress = require('koa-compress');
const rateLimit = require('koa-ratelimit');
const redis = require('redis');

const router = require('./routes');
const { errorHandler } = require('./middleware/error');
const { jwtMiddleware } = require('./middleware/auth');

const app = new Koa();

// 信任代理 (如果用了 Nginx)
app.proxy = true;

// 全局错误处理
app.use(errorHandler);

// 安全中间件
app.use(helmet());

// CORS
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400
}));

// 压缩
app.use(compress({
  threshold: 2048,
  gzip: { flush: 4 },
  deflate: { flush: 4 },
  br: false
}));

// 日志
app.use(logger());

// 请求体解析
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text'],
  jsonLimit: '1mb',
  formLimit: '1mb',
  textLimit: '1mb'
}));

// 限流 (需要 Redis)
if (process.env.REDIS_URL) {
  const redisClient = redis.createClient({ url: process.env.REDIS_URL });
  
  app.use(rateLimit({
    driver: 'redis',
    db: redisClient,
    duration: 60000,
    errorMessage: '请求过于频繁，请稍后再试',
    id: (ctx) => ctx.ip,
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total'
    },
    whitelist: (ctx) => {
      // 白名单：内部 IP
      return ctx.ip === '127.0.0.1';
    },
    blacklist: (ctx) => {
      // 黑名单
      return false;
    },
    disableHeader: false,
    max: 100 // 每分钟最多 100 次请求
  }));
}

// JWT 认证 (部分路由需要)
app.use(jwtMiddleware);

// 路由
app.use(router.routes());
app.use(router.allowedMethods());

// 404 处理
app.use((ctx, next) => {
  if (ctx.status === 404) {
    ctx.body = { code: 40400, message: '接口不存在', data: null };
  }
});

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎣 LureBin Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
