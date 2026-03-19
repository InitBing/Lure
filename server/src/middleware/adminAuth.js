/**
 * 管理员认证中间件
 */

const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const { BusinessError } = require('./error');

/**
 * 验证管理员 Token
 */
async function requireAdmin(ctx, next) {
  const authHeader = ctx.header.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    throw new BusinessError('未登录', 40100);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.admin = decoded;
    
    // 验证管理员是否存在
    const admin = await Admin.findByPk(decoded.id);
    if (!admin || admin.status !== 1) {
      throw new BusinessError('管理员不存在或已禁用', 40100);
    }
    
    await next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      throw new BusinessError('Token 无效或已过期', 40101);
    }
    throw err;
  }
}

/**
 * 检查管理员权限
 * @param {number[]} roles - 允许的角色列表
 */
function requireRole(roles) {
  return async (ctx, next) => {
    const admin = ctx.state.admin;
    
    if (!roles.includes(admin.role)) {
      throw new BusinessError('无权限访问', 40300);
    }
    
    await next();
  };
}

module.exports = {
  requireAdmin,
  requireRole
};
