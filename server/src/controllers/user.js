/**
 * 用户控制器
 */

const { User, Spot, Log, Item, Follow } = require('../models');
const { BusinessError } = require('../middleware/error');
const { sequelize } = require('../config/database');

/**
 * 获取个人信息
 * GET /api/v1/user/profile
 */
async function getProfile(ctx) {
  const userId = ctx.state.user.id;
  
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ['openid', 'created_at', 'updated_at']
    }
  });
  
  if (!user) {
    throw new BusinessError('用户不存在', 40401);
  }
  
  ctx.body = {
    code: 0,
    data: { user }
  };
}

/**
 * 更新个人信息
 * PUT /api/v1/user/profile
 */
async function updateProfile(ctx) {
  const userId = ctx.state.user.id;
  const { nickname, avatar, gender, region, phone } = ctx.request.body;
  
  const user = await User.findByPk(userId);
  if (!user) {
    throw new BusinessError('用户不存在', 40401);
  }
  
  await user.update({
    nickname: nickname || user.nickname,
    avatar: avatar || user.avatar,
    gender: gender !== undefined ? gender : user.gender,
    region: region || user.region,
    phone: phone || user.phone
  });
  
  ctx.body = {
    code: 0,
    message: '更新成功',
    data: {
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        region: user.region
      }
    }
  };
}

/**
 * 获取个人统计
 * GET /api/v1/user/stats
 */
async function getStats(ctx) {
  const userId = ctx.state.user.id;
  
  const [logCount, favoriteCount] = await Promise.all([
    Log.count({ where: { user_id: userId, status: 1 } }),
    // 这里可以添加收藏统计
    Promise.resolve(0)
  ]);
  
  const user = await User.findByPk(userId);
  
  ctx.body = {
    code: 0,
    data: {
      log_count: logCount,
      catch_count: user.catch_count,
      post_count: user.post_count,
      follower_count: user.follower_count,
      following_count: user.following_count,
      favorite_count: favoriteCount
    }
  };
}

/**
 * 关注用户
 * POST /api/v1/user/:id/follow
 */
async function follow(ctx) {
  const followerId = ctx.state.user.id;
  const followingId = parseInt(ctx.params.id);
  
  if (followerId === followingId) {
    throw new BusinessError('不能关注自己', 40001);
  }
  
  // 检查被关注用户是否存在
  const targetUser = await User.findByPk(followingId);
  if (!targetUser) {
    throw new BusinessError('用户不存在', 40401);
  }
  
  // TODO: 添加到关注表
  // await Follow.create({ follower_id: followerId, following_id: followingId });
  // await targetUser.increment('follower_count');
  // await User.findByPk(followerId).then(u => u.increment('following_count'));
  
  ctx.body = {
    code: 0,
    message: '关注成功'
  };
}

/**
 * 取消关注
 * DELETE /api/v1/user/:id/follow
 */
async function unfollow(ctx) {
  const followerId = ctx.state.user.id;
  const followingId = parseInt(ctx.params.id);
  
  // TODO: 从关注表删除
  
  ctx.body = {
    code: 0,
    message: '取消关注成功'
  };
}

/**
 * 用户列表
 * GET /api/v1/users
 */
async function list(ctx) {
  const { keyword, region, page = 1, page_size = 20 } = ctx.query;
  const offset = (page - 1) * page_size;
  
  const where = { status: 1 };
  
  if (keyword) {
    where.nickname = { [sequelize.Op.like]: `%${keyword}%` };
  }
  if (region) {
    where.region = region;
  }
  
  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['openid'] },
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['follower_count', 'DESC']]
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

module.exports = {
  getProfile,
  updateProfile,
  getStats,
  follow,
  unfollow,
  list
};
