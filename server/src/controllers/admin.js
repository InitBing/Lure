/**
 * 管理员控制器
 */

const { Admin, User, Spot, Log, Item, Video, sequelize } = require('../models');
const { BusinessError } = require('../middleware/error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * 管理员登录
 * POST /api/v1/admin/login
 */
async function login(ctx) {
  const { username, password } = ctx.request.body;
  
  if (!username || !password) {
    throw new BusinessError('用户名和密码不能为空', 40001);
  }
  
  const admin = await Admin.findOne({
    where: { username, status: 1 },
    include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] }]
  });
  
  if (!admin) {
    throw new BusinessError('用户名或密码错误', 40100);
  }
  
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    throw new BusinessError('用户名或密码错误', 40100);
  }
  
  // 更新登录信息
  await admin.update({
    last_login_at: new Date(),
    last_login_ip: ctx.ip
  });
  
  // 生成 Token
  const token = jwt.sign(
    { id: admin.id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  ctx.body = {
    code: 0,
    message: '登录成功',
    data: {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        user: admin.user
      }
    }
  };
}

/**
 * 获取当前管理员信息
 * GET /api/v1/admin/profile
 */
async function getProfile(ctx) {
  const adminId = ctx.state.admin.id;
  
  const admin = await Admin.findByPk(adminId, {
    include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] }]
  });
  
  ctx.body = {
    code: 0,
    data: {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions,
      user: admin.user
    }
  };
}

/**
 * 获取统计数据
 * GET /api/v1/admin/stats
 */
async function getStats(ctx) {
  const stats = {
    users: await User.count(),
    spots: await Spot.count(),
    logs: await Log.count(),
    items: await Item.count(),
    videos: await Video.count(),
    spots_pending: await Spot.count({ where: { status: 0 } }),
    videos_pending: await Video.count({ where: { status: 0 } })
  };
  
  // 最近 7 天新增用户
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  stats.new_users_7d = await User.count({
    where: {
      created_at: { [sequelize.Op.gte]: sevenDaysAgo }
    }
  });
  
  ctx.body = {
    code: 0,
    data: stats
  };
}

/**
 * 用户列表
 * GET /api/v1/admin/users
 */
async function userList(ctx) {
  const { page = 1, page_size = 20, keyword, status } = ctx.query;
  const offset = (page - 1) * page_size;
  
  const where = {};
  if (keyword) {
    where.nickname = { [sequelize.Op.like]: `%${keyword}%` };
  }
  if (status !== undefined) {
    where.status = parseInt(status);
  }
  
  const { count, rows } = await User.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']]
  });
  
  ctx.body = {
    code: 0,
    data: {
      list: rows,
      total: count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    }
  };
}

/**
 * 封禁/解封用户
 * PUT /api/v1/admin/users/:id/status
 */
async function updateUserStatus(ctx) {
  const userId = parseInt(ctx.params.id);
  const { status } = ctx.request.body;
  
  const user = await User.findByPk(userId);
  if (!user) {
    throw new BusinessError('用户不存在', 40401);
  }
  
  await user.update({ status: parseInt(status) });
  
  ctx.body = {
    code: 0,
    message: status === 0 ? '已封禁用户' : '已解封用户'
  };
}

/**
 * 钓点列表 (含待审核)
 * GET /api/v1/admin/spots
 */
async function spotList(ctx) {
  const { page = 1, page_size = 20, status, keyword } = ctx.query;
  const offset = (page - 1) * page_size;
  
  const where = {};
  if (status !== undefined) {
    where.status = parseInt(status);
  }
  if (keyword) {
    where.name = { [sequelize.Op.like]: `%${keyword}%` };
  }
  
  const { count, rows } = await Spot.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
    include: [{
      model: User,
      as: 'creator',
      attributes: ['id', 'nickname', 'avatar']
    }]
  });
  
  ctx.body = {
    code: 0,
    data: {
      list: rows,
      total: count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    }
  };
}

/**
 * 审核钓点
 * PUT /api/v1/admin/spots/:id/audit
 */
async function auditSpot(ctx) {
  const spotId = parseInt(ctx.params.id);
  const { status, reason } = ctx.request.body;
  
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    throw new BusinessError('钓点不存在', 40402);
  }
  
  await spot.update({
    status: parseInt(status),
    audit_reason: reason || null
  });
  
  ctx.body = {
    code: 0,
    message: status === 1 ? '审核通过' : '审核拒绝'
  };
}

/**
 * 内容列表 (作钓记录/商品/视频)
 * GET /api/v1/admin/contents
 */
async function contentList(ctx) {
  const { type, page = 1, page_size = 20, status } = ctx.query;
  const offset = (page - 1) * page_size;
  
  let model, where = {};
  
  if (type === 'log') {
    model = Log;
    if (status !== undefined) where.status = parseInt(status);
  } else if (type === 'item') {
    model = Item;
    if (status !== undefined) where.status = parseInt(status);
  } else if (type === 'video') {
    model = Video;
    if (status !== undefined) where.status = parseInt(status);
  } else {
    throw new BusinessError('无效的内容类型', 40001);
  }
  
  const { count, rows } = await model.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']]
  });
  
  ctx.body = {
    code: 0,
    data: {
      list: rows,
      total: count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    }
  };
}

/**
 * 删除内容
 * DELETE /api/v1/admin/contents/:type/:id
 */
async function deleteContent(ctx) {
  const { type, id } = ctx.params;
  
  let model;
  if (type === 'log') model = Log;
  else if (type === 'item') model = Item;
  else if (type === 'video') model = Video;
  else throw new BusinessError('无效的内容类型', 40001);
  
  const content = await model.findByPk(parseInt(id));
  if (!content) {
    throw new BusinessError('内容不存在', 40400);
  }
  
  await content.destroy();
  
  ctx.body = {
    code: 0,
    message: '删除成功'
  };
}

module.exports = {
  login,
  getProfile,
  getStats,
  userList,
  updateUserStatus,
  spotList,
  auditSpot,
  contentList,
  deleteContent
};
