/**
 * 评论控制器
 */

const { Comment, User, sequelize } = require('../models');
const { BusinessError } = require('../middleware/error');

/**
 * 评论列表
 * GET /api/v1/comments
 */
async function list(ctx) {
  const { target_type, target_id, page = 1, page_size = 20 } = ctx.query;
  
  if (!target_type || !target_id) {
    throw new BusinessError('缺少 target_type 或 target_id', 40001);
  }
  
  const offset = (page - 1) * page_size;
  const where = {
    target_type: parseInt(target_type),
    target_id: parseInt(target_id),
    status: 1,
    parent_id: null // 只查询一级评论
  };
  
  const { count, rows } = await Comment.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['created_at', 'ASC']],
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'nickname', 'avatar']
    }, {
      model: Comment,
      as: 'replies',
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'nickname', 'avatar']
      }],
      order: [['created_at', 'ASC']],
      limit: 10
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
 * 发布评论
 * POST /api/v1/comments
 */
async function create(ctx) {
  const userId = ctx.state.user.id;
  const { target_type, target_id, content, parent_id } = ctx.request.body;
  
  if (!target_type || !target_id || !content) {
    throw new BusinessError('缺少必填字段', 40001);
  }
  
  const comment = await Comment.create({
    user_id: userId,
    target_type: parseInt(target_type),
    target_id: parseInt(target_id),
    content,
    parent_id: parent_id || null,
    status: 1
  });
  
  // 增加父级评论计数 (如果是回复)
  if (parent_id) {
    const parent = await Comment.findByPk(parent_id);
    if (parent) {
      // 可以在这里增加父评论的回复计数
    }
  }
  
  ctx.body = {
    code: 0,
    message: '评论成功',
    data: { comment }
  };
}

/**
 * 删除评论
 * DELETE /api/v1/comments/:id
 */
async function remove(ctx) {
  const userId = ctx.state.user.id;
  const comment = await Comment.findByPk(ctx.params.id);
  
  if (!comment) {
    throw new BusinessError('评论不存在', 40400);
  }
  
  // 只有作者或管理员可以删除
  if (comment.user_id !== userId && !ctx.state.user.isAdmin) {
    throw new BusinessError('无权限删除', 40300);
  }
  
  // 软删除
  await comment.update({ status: 0 });
  
  ctx.body = {
    code: 0,
    message: '删除成功'
  };
}

/**
 * 点赞评论
 * POST /api/v1/comments/:id/like
 */
async function like(ctx) {
  const userId = ctx.state.user.id;
  const commentId = parseInt(ctx.params.id);
  
  const { Like } = require('../models');
  
  const existing = await Like.findOne({
    where: { user_id: userId, target_type: 5, target_id: commentId }
  });
  
  if (existing) {
    await existing.destroy();
    await Comment.decrement('like_count', { where: { id: commentId } });
    ctx.body = { code: 0, message: '已取消点赞', data: { is_liked: false } };
  } else {
    await Like.create({ user_id: userId, target_type: 5, target_id: commentId });
    await Comment.increment('like_count', { where: { id: commentId } });
    ctx.body = { code: 0, message: '已点赞', data: { is_liked: true } };
  }
}

module.exports = {
  list,
  create,
  remove,
  like
};
