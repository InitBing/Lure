/**
 * 全局错误处理中间件
 */

async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    console.error('Error:', err);
    
    // 已处理的业务错误
    if (err.isBusinessError) {
      ctx.status = err.status || 400;
      ctx.body = {
        code: err.code || 40000,
        message: err.message,
        data: null
      };
      return;
    }
    
    // 数据库错误
    if (err.name === 'SequelizeDatabaseError') {
      ctx.status = 500;
      ctx.body = {
        code: 50001,
        message: '数据库错误',
        data: null
      };
      return;
    }
    
    // 验证错误
    if (err.name === 'SequelizeValidationError') {
      ctx.status = 400;
      ctx.body = {
        code: 40001,
        message: '参数验证失败',
        data: {
          errors: err.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        }
      };
      return;
    }
    
    // JWT 错误
    if (err.name === 'JsonWebTokenError') {
      ctx.status = 401;
      ctx.body = {
        code: 40102,
        message: 'Token 无效',
        data: null
      };
      return;
    }
    
    if (err.name === 'TokenExpiredError') {
      ctx.status = 401;
      ctx.body = {
        code: 40101,
        message: 'Token 已过期',
        data: null
      };
      return;
    }
    
    // 默认服务器错误
    ctx.status = err.status || 500;
    ctx.body = {
      code: 50000,
      message: process.env.NODE_ENV === 'development' ? err.message : '服务器错误',
      data: null
    };
  }
}

// 业务错误类
class BusinessError extends Error {
  constructor(message, code = 40000, status = 400) {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
    this.status = status;
    this.isBusinessError = true;
  }
}

module.exports = {
  errorHandler,
  BusinessError
};
