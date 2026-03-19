/**
 * 视频控制器
 */

const { Video, User, Spot, sequelize } = require('../models');
const { BusinessError } = require('../middleware/error');

/**
 * 视频列表
 * GET /api/v1/videos
 */
async function list(ctx) {
  const {
    user_id, spot_id, tag,
    sort = 'newest',
    page = 1, page_size = 20
  } = ctx.query;
  
  const offset = (page - 1) * page_size;
  const where = { status: 1 };
  
  if (user_id) where.user_id = parseInt(user_id);
  if (spot_id) where.spot_id = parseInt(spot_id);
  if (tag) {
    where.tags = { [sequelize.Op.like]: `%${tag}%` };
  }
  
  const order = [];
  if (sort === 'hot') {
    order.push(['play_count', 'DESC']);
  } else if (sort === 'plays') {
    order.push(['play_count', 'DESC']);
  } else {
    order.push(['created_at', 'DESC']);
  }
  
  const { count, rows } = await Video.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order,
    include: [{
      model: User,
      as: 'uploader',
      attributes: ['id', 'nickname', 'avatar']
    }, {
      model: Spot,
      as: 'spot',
      attributes: ['id', 'name', 'city']
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
 * 视频详情
 * GET /api/v1/videos/:id
 */
async function get(ctx) {
  const video = await Video.findByPk(ctx.params.id, {
    include: [{
      model: User,
      as: 'uploader',
      attributes: ['id', 'nickname', 'avatar']
    }, {
      model: Spot,
      as: 'spot',
      attributes: ['id', 'name', 'city']
    }]
  });
  
  if (!video) {
    throw new BusinessError('视频不存在', 40400);
  }
  
  // 增加播放计数
  await video.increment('play_count');
  
  ctx.body = {
    code: 0,
    data: { video }
  };
}

/**
 * 上传视频
 * POST /api/v1/videos
 */
async function create(ctx) {
  const userId = ctx.state.user.id;
  const data = ctx.request.body;
  
  const required = ['title', 'video_url'];
  for (const field of required) {
    if (!data[field]) {
      throw new BusinessError(`缺少必填字段：${field}`, 40001);
    }
  }
  
  const video = await Video.create({
    ...data,
    user_id: userId,
    status: 0 // 审核中
  });
  
  ctx.body = {
    code: 0,
    message: '上传成功，请等待审核',
    data: { video }
  };
}

/**
 * 更新视频
 * PUT /api/v1/videos/:id
 */
async function update(ctx) {
  const userId = ctx.state.user.id;
  const video = await Video.findByPk(ctx.params.id);
  
  if (!video) {
    throw new BusinessError('视频不存在', 40400);
  }
  
  if (video.user_id !== userId) {
    throw new BusinessError('无权限修改', 40300);
  }
  
  await video.update(ctx.request.body);
  
  ctx.body = {
    code: 0,
    data: { video }
  };
}

/**
 * 删除视频
 * DELETE /api/v1/videos/:id
 */
async function remove(ctx) {
  const userId = ctx.state.user.id;
  const video = await Video.findByPk(ctx.params.id);
  
  if (!video) {
    throw new BusinessError('视频不存在', 40400);
  }
  
  if (video.user_id !== userId) {
    throw new BusinessError('无权限删除', 40300);
  }
  
  await video.destroy();
  
  ctx.body = {
    code: 0,
    message: '删除成功'
  };
}

/**
 * 点赞视频
 * POST /api/v1/videos/:id/like
 */
async function like(ctx) {
  const userId = ctx.state.user.id;
  const videoId = parseInt(ctx.params.id);
  
  const { Like } = require('../models');
  
  const existing = await Like.findOne({
    where: { user_id: userId, target_type: 4, target_id: videoId }
  });
  
  if (existing) {
    await existing.destroy();
    await Video.decrement('like_count', { where: { id: videoId } });
    ctx.body = { code: 0, message: '已取消点赞', data: { is_liked: false } };
  } else {
    await Like.create({ user_id: userId, target_type: 4, target_id: videoId });
    await Video.increment('like_count', { where: { id: videoId } });
    ctx.body = { code: 0, message: '已点赞', data: { is_liked: true } };
  }
}

/**
 * 收藏视频
 * POST /api/v1/videos/:id/favorite
 */
async function favorite(ctx) {
  const userId = ctx.state.user.id;
  const videoId = parseInt(ctx.params.id);
  
  const { Favorite } = require('../models');
  
  const existing = await Favorite.findOne({
    where: { user_id: userId, target_type: 4, target_id: videoId }
  });
  
  if (existing) {
    await existing.destroy();
    await Video.decrement('favorite_count', { where: { id: videoId } });
    ctx.body = { code: 0, message: '已取消收藏', data: { is_favorited: false } };
  } else {
    await Favorite.create({ user_id: userId, target_type: 4, target_id: videoId });
    await Video.increment('favorite_count', { where: { id: videoId } });
    ctx.body = { code: 0, message: '已收藏', data: { is_favorited: true } };
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  like,
  favorite
};
