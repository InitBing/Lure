/**
 * 作钓记录控制器
 */

const { Log, User, Spot, sequelize } = require('../models');
const { BusinessError } = require('../middleware/error');

/**
 * 作钓记录列表
 * GET /api/v1/logs
 */
async function list(ctx) {
  const {
    user_id, spot_id, fish_type,
    date_from, date_to,
    is_public = 1,
    page = 1, page_size = 20
  } = ctx.query;
  
  const offset = (page - 1) * page_size;
  const where = { is_public: parseInt(is_public), status: 1 };
  
  if (user_id) where.user_id = parseInt(user_id);
  if (spot_id) where.spot_id = parseInt(spot_id);
  if (date_from) where.log_date = { [sequelize.Op.gte]: date_from };
  if (date_to) {
    where.log_date = where.log_date || {};
    where.log_date[sequelize.Op.lte] = date_to;
  }
  
  const { count, rows } = await Log.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['log_date', 'DESC']],
    include: [
      { model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] },
      { model: Spot, as: 'spot', attributes: ['id', 'name', 'city'] }
    ]
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
 * 作钓记录详情
 * GET /api/v1/logs/:id
 */
async function get(ctx) {
  const log = await Log.findByPk(ctx.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] },
      { model: Spot, as: 'spot', attributes: ['id', 'name', 'city'] }
    ]
  });
  
  if (!log) {
    throw new BusinessError('记录不存在', 40400);
  }
  
  ctx.body = {
    code: 0,
    data: { log }
  };
}

/**
 * 创建作钓记录
 * POST /api/v1/logs
 */
async function create(ctx) {
  const userId = ctx.state.user.id;
  const data = ctx.request.body;
  
  // 必填字段
  if (!data.log_date) {
    throw new BusinessError('缺少作钓日期', 40001);
  }
  
  const log = await Log.create({
    ...data,
    user_id: userId,
    catch_count: data.catches ? data.catches.length : 0,
    max_length: data.catches ? Math.max(...data.catches.map(c => c.length || 0)) : null,
    max_weight: data.catches ? Math.max(...data.catches.map(c => c.weight || 0)) : null
  });
  
  // 更新用户统计
  await User.findByPk(userId).then(u => u.increment('log_count'));
  
  ctx.body = {
    code: 0,
    message: '发布成功',
    data: { log }
  };
}

/**
 * 更新作钓记录
 * PUT /api/v1/logs/:id
 */
async function update(ctx) {
  const userId = ctx.state.user.id;
  const log = await Log.findByPk(ctx.params.id);
  
  if (!log) {
    throw new BusinessError('记录不存在', 40400);
  }
  
  if (log.user_id !== userId) {
    throw new BusinessError('无权限修改', 40300);
  }
  
  await log.update(ctx.request.body);
  
  ctx.body = {
    code: 0,
    message: '更新成功',
    data: { log }
  };
}

/**
 * 删除作钓记录
 * DELETE /api/v1/logs/:id
 */
async function delete(ctx) {
  const userId = ctx.state.user.id;
  const log = await Log.findByPk(ctx.params.id);
  
  if (!log) {
    throw new BusinessError('记录不存在', 40400);
  }
  
  if (log.user_id !== userId) {
    throw new BusinessError('无权限删除', 40300);
  }
  
  await log.destroy();
  await User.findByPk(userId).then(u => u.decrement('log_count'));
  
  ctx.body = {
    code: 0,
    message: '删除成功'
  };
}

/**
 * 点赞
 * POST /api/v1/logs/:id/like
 */
async function like(ctx) {
  const log = await Log.findByPk(ctx.params.id);
  if (!log) throw new BusinessError('记录不存在', 40400);
  
  await log.increment('like_count');
  
  ctx.body = { code: 0, message: '点赞成功' };
}

/**
 * 收藏
 * POST /api/v1/logs/:id/favorite
 */
async function favorite(ctx) {
  const log = await Log.findByPk(ctx.params.id);
  if (!log) throw new BusinessError('记录不存在', 40400);
  
  await log.increment('favorite_count');
  
  ctx.body = { code: 0, message: '收藏成功' };
}

module.exports = {
  list,
  get,
  create,
  update,
  delete,
  like,
  favorite
};
