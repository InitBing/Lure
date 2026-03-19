/**
 * 钓点控制器
 */

const { Spot, User, sequelize } = require('../models');
const { BusinessError } = require('../middleware/error');

/**
 * 钓点列表
 * GET /api/v1/spots
 */
async function list(ctx) {
  const {
    lat, lng, distance,
    city, water_type, fish_type,
    fee_status, keyword,
    sort = 'distance',
    page = 1, page_size = 20
  } = ctx.query;
  
  const offset = (page - 1) * page_size;
  const where = { status: 1 };
  
  if (city) where.city = city;
  if (water_type) where.water_type = parseInt(water_type);
  if (fee_status) where.fee_status = parseInt(fee_status);
  if (keyword) {
    where.name = { [sequelize.Op.like]: `%${keyword}%` };
  }
  
  // 附近搜索 (简单版本，实际应该用 Haversine 公式)
  if (lat && lng && distance) {
      // 简化的经纬度范围查询
      const latRange = distance / 111; // 1 度纬度约 111km
      const lngRange = distance / (111 * Math.cos(lat * Math.PI / 180));
      where.latitude = { [sequelize.Op.between]: [lat - latRange, lat + latRange] };
      where.longitude = { [sequelize.Op.between]: [lng - lngRange, lng + lngRange] };
  }
  
  const order = [];
  if (sort === 'distance' && lat && lng) {
    order.push(['latitude', 'ASC']); // 简化排序
  } else if (sort === 'rating') {
    order.push(['avg_rating', 'DESC']);
  } else if (sort === 'visits') {
    order.push(['visit_count', 'DESC']);
  } else {
    order.push(['created_at', 'DESC']);
  }
  
  const { count, rows } = await Spot.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order,
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
 * 钓点详情
 * GET /api/v1/spots/:id
 */
async function get(ctx) {
  const spot = await Spot.findByPk(ctx.params.id, {
    include: [{
      model: User,
      as: 'creator',
      attributes: ['id', 'nickname', 'avatar']
    }]
  });
  
  if (!spot) {
    throw new BusinessError('钓点不存在', 40402);
  }
  
  // 增加访问计数
  await spot.increment('visit_count');
  
  ctx.body = {
    code: 0,
    data: { spot }
  };
}

/**
 * 创建钓点
 * POST /api/v1/spots
 */
async function create(ctx) {
  const userId = ctx.state.user.id;
  const data = ctx.request.body;
  
  // 必填字段验证
  const required = ['name', 'province', 'city', 'latitude', 'longitude', 'water_type'];
  for (const field of required) {
    if (!data[field]) {
      throw new BusinessError(`缺少必填字段：${field}`, 40001);
    }
  }
  
  const spot = await Spot.create({
    ...data,
    created_by: userId,
    status: 0 // 待审核
  });
  
  ctx.body = {
    code: 0,
    message: '创建成功，请等待审核',
    data: { spot }
  };
}

/**
 * 钓点评价列表
 * GET /api/v1/spots/:id/reviews
 */
async function getReviews(ctx) {
  // TODO: 实现评价查询
  ctx.body = {
    code: 0,
    data: { list: [], total: 0 }
  };
}

/**
 * 创建钓点评价
 * POST /api/v1/spots/:id/reviews
 */
async function createReview(ctx) {
  const userId = ctx.state.user.id;
  const spotId = parseInt(ctx.params.id);
  const { rating, content, photos, tags } = ctx.request.body;
  
  if (!rating || rating < 1 || rating > 5) {
    throw new BusinessError('评分必须在 1-5 之间', 40001);
  }
  
  // TODO: 创建评价
  // 更新钓点平均评分
  
  ctx.body = {
    code: 0,
    message: '评价成功'
  };
}

module.exports = {
  list,
  get,
  create,
  getReviews,
  createReview
};
