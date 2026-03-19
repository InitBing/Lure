/**
 * 二手商品控制器
 */

const { Item, User, sequelize } = require('../models');
const { BusinessError } = require('../middleware/error');

/**
 * 商品列表
 * GET /api/v1/items
 */
async function list(ctx) {
  const {
    category, brand, condition,
    price_min, price_max,
    province, city,
    keyword, sort = 'newest',
    page = 1, page_size = 20
  } = ctx.query;
  
  const offset = (page - 1) * page_size;
  const where = { status: 1 };
  
  if (category) where.category = parseInt(category);
  if (brand) where.brand = brand;
  if (condition) where.condition = parseInt(condition);
  if (province) where.province = province;
  if (city) where.city = city;
  if (price_min || price_max) {
    where.price = {};
    if (price_min) where.price[sequelize.Op.gte] = parseFloat(price_min);
    if (price_max) where.price[sequelize.Op.lte] = parseFloat(price_max);
  }
  if (keyword) {
    where.title = { [sequelize.Op.like]: `%${keyword}%` };
  }
  
  const order = [];
  if (sort === 'newest') order.push(['created_at', 'DESC']);
  else if (sort === 'price_asc') order.push(['price', 'ASC']);
  else if (sort === 'price_desc') order.push(['price', 'DESC']);
  else order.push(['created_at', 'DESC']);
  
  const { count, rows } = await Item.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order,
    include: [{
      model: User,
      as: 'seller',
      attributes: ['id', 'nickname', 'avatar', 'trade_rating', 'credit_score']
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
 * 商品详情
 * GET /api/v1/items/:id
 */
async function get(ctx) {
  const item = await Item.findByPk(ctx.params.id, {
    include: [{
      model: User,
      as: 'seller',
      attributes: ['id', 'nickname', 'avatar', 'trade_rating', 'credit_score', 'region']
    }]
  });
  
  if (!item) {
    throw new BusinessError('商品不存在', 40403);
  }
  
  // 增加浏览数
  await item.increment('view_count');
  
  ctx.body = {
    code: 0,
    data: { item }
  };
}

/**
 * 发布商品
 * POST /api/v1/items
 */
async function create(ctx) {
  const userId = ctx.state.user.id;
  const data = ctx.request.body;
  
  // 必填字段
  const required = ['category', 'title', 'price', 'condition', 'photos', 'province', 'city'];
  for (const field of required) {
    if (!data[field]) {
      throw new BusinessError(`缺少必填字段：${field}`, 40001);
    }
  }
  
  if (!Array.isArray(data.photos) || data.photos.length === 0) {
    throw new BusinessError('至少上传一张图片', 40001);
  }
  
  const item = await Item.create({
    ...data,
    user_id: userId
  });
  
  ctx.body = {
    code: 0,
    message: '发布成功',
    data: { item }
  };
}

/**
 * 更新商品
 * PUT /api/v1/items/:id
 */
async function update(ctx) {
  const userId = ctx.state.user.id;
  const item = await Item.findByPk(ctx.params.id);
  
  if (!item) {
    throw new BusinessError('商品不存在', 40403);
  }
  
  if (item.user_id !== userId) {
    throw new BusinessError('无权限修改', 40300);
  }
  
  await item.update(ctx.request.body);
  
  ctx.body = {
    code: 0,
    message: '更新成功',
    data: { item }
  };
}

/**
 * 删除商品
 * DELETE /api/v1/items/:id
 */
async function delete(ctx) {
  const userId = ctx.state.user.id;
  const item = await Item.findByPk(ctx.params.id);
  
  if (!item) {
    throw new BusinessError('商品不存在', 40403);
  }
  
  if (item.user_id !== userId) {
    throw new BusinessError('无权限删除', 40300);
  }
  
  await item.destroy();
  
  ctx.body = {
    code: 0,
    message: '删除成功'
  };
}

/**
 * 标记已售
 * PUT /api/v1/items/:id/sold
 */
async function markSold(ctx) {
  const userId = ctx.state.user.id;
  const item = await Item.findByPk(ctx.params.id);
  
  if (!item) {
    throw new BusinessError('商品不存在', 40403);
  }
  
  if (item.user_id !== userId) {
    throw new BusinessError('无权限操作', 40300);
  }
  
  await item.update({
    status: 2,
    sold_at: new Date()
  });
  
  ctx.body = {
    code: 0,
    message: '已标记为售出'
  };
}

module.exports = {
  list,
  get,
  create,
  update,
  delete,
  markSold
};
