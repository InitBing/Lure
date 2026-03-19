/**
 * 资讯控制器
 */

const { Article, sequelize } = require('../models');
const { BusinessError } = require('../middleware/error');

/**
 * 资讯列表
 * GET /api/v1/articles
 */
async function list(ctx) {
  const {
    category, tag, is_recommend,
    page = 1, page_size = 20
  } = ctx.query;
  
  const offset = (page - 1) * page_size;
  const where = { status: 1 };
  
  if (category) where.category = parseInt(category);
  if (is_recommend !== undefined) where.is_recommend = parseInt(is_recommend);
  if (tag) {
    where.tags = { [sequelize.Op.like]: `%${tag}%` };
  }
  
  const order = [['published_at', 'DESC']];
  
  const { count, rows } = await Article.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order
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
 * 资讯详情
 * GET /api/v1/articles/:id
 */
async function get(ctx) {
  const article = await Article.findByPk(ctx.params.id);
  
  if (!article) {
    throw new BusinessError('资讯不存在', 40400);
  }
  
  // 增加阅读计数
  await article.increment('view_count');
  
  ctx.body = {
    code: 0,
    data: { article }
  };
}

/**
 * 收藏资讯
 * POST /api/v1/articles/:id/favorite
 */
async function favorite(ctx) {
  const userId = ctx.state.user.id;
  const articleId = parseInt(ctx.params.id);
  
  const { Favorite } = require('../models');
  
  const existing = await Favorite.findOne({
    where: { user_id: userId, target_type: 5, target_id: articleId }
  });
  
  if (existing) {
    await existing.destroy();
    await Article.decrement('favorite_count', { where: { id: articleId } });
    ctx.body = { code: 0, message: '已取消收藏', data: { is_favorited: false } };
  } else {
    await Favorite.create({ user_id: userId, target_type: 5, target_id: articleId });
    await Article.increment('favorite_count', { where: { id: articleId } });
    ctx.body = { code: 0, message: '已收藏', data: { is_favorited: true } };
  }
}

module.exports = {
  list,
  get,
  favorite
};
