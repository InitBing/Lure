/**
 * JWT 认证中间件
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// JWT 中间件 (可选认证)
async function jwtMiddleware(ctx, next) {
  const authHeader = ctx.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      ctx.state.user = decoded;
      ctx.state.isAuthenticated = true;
    } catch (err) {
      ctx.state.isAuthenticated = false;
    }
  } else {
    ctx.state.isAuthenticated = false;
  }
  
  await next();
}

// 必须登录
function requireAuth() {
  return async (ctx, next) => {
    if (!ctx.state.isAuthenticated || !ctx.state.user) {
      ctx.status = 401;
      ctx.body = { code: 40100, message: '请先登录', data: null };
      return;
    }
    await next();
  };
}

// 生成 Token
function generateToken(payload) {
  return jwt.sign(
    {
      id: payload.id,
      openid: payload.openid,
      ...payload
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// 验证微信登录 code (调用微信 API)
async function verifyWechatCode(code) {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;
  
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.errcode) {
    throw new Error(data.errmsg);
  }
  
  return {
    openid: data.openid,
    unionid: data.unionid || null
  };
}

module.exports = {
  jwtMiddleware,
  requireAuth,
  generateToken,
  verifyWechatCode
};
