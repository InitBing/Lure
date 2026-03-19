/**
 * 消息控制器
 */

const { Message, User, sequelize } = require('../models');
const { BusinessError } = require('../middleware/error');

/**
 * 会话列表
 * GET /api/v1/messages/conversations
 */
async function conversations(ctx) {
  const userId = ctx.state.user.id;
  
  // 查询所有会话 (最后一条消息)
  const result = await Message.findAll({
    attributes: [
      'conversation_id',
      [sequelize.fn('MAX', sequelize.col('created_at')), 'last_time'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'unread_count']
    ],
    where: {
      [sequelize.Op.or]: [
        { sender_id: userId, is_deleted: 0 },
        { receiver_id: userId, is_deleted: 0 }
      ]
    },
    group: ['conversation_id'],
    order: [[sequelize.col('last_time'), 'DESC']],
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'nickname', 'avatar']
    }]
  });
  
  ctx.body = {
    code: 0,
    data: { list: result }
  };
}

/**
 * 消息列表
 * GET /api/v1/messages
 */
async function list(ctx) {
  const userId = ctx.state.user.id;
  const { conversation_id, partner_id, page = 1, page_size = 50 } = ctx.query;
  
  const offset = (page - 1) * page_size;
  const where = { is_deleted: 0 };
  
  if (conversation_id) {
    where.conversation_id = conversation_id;
  } else if (partner_id) {
    // 生成会话 ID (小的 ID 在前)
    const ids = [userId, parseInt(partner_id)].sort();
    where.conversation_id = `${ids[0]}_${ids[1]}`;
  } else {
    throw new BusinessError('缺少 conversation_id 或 partner_id', 40001);
  }
  
  // 标记已读
  await Message.update(
    { is_read: 1 },
    { where: { ...where, receiver_id: userId, is_read: 0 } }
  );
  
  const messages = await Message.findAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'nickname', 'avatar']
    }]
  });
  
  ctx.body = {
    code: 0,
    data: {
      list: messages.reverse(), // 正序排列
      page: parseInt(page),
      page_size: parseInt(page_size)
    }
  };
}

/**
 * 发送消息
 * POST /api/v1/messages
 */
async function send(ctx) {
  const userId = ctx.state.user.id;
  const { receiver_id, type, content, media_url } = ctx.request.body;
  
  if (!receiver_id || !content) {
    throw new BusinessError('缺少必填字段', 40001);
  }
  
  // 检查接收者是否存在
  const receiver = await User.findByPk(receiver_id);
  if (!receiver) {
    throw new BusinessError('用户不存在', 40401);
  }
  
  // 生成会话 ID
  const ids = [userId, receiver_id].sort();
  const conversationId = `${ids[0]}_${ids[1]}`;
  
  const message = await Message.create({
    conversation_id: conversationId,
    sender_id: userId,
    receiver_id,
    type: type || 1,
    content,
    media_url: media_url || null
  });
  
  ctx.body = {
    code: 0,
    message: '发送成功',
    data: { message }
  };
}

/**
 * 消息已读
 * PUT /api/v1/messages/read
 */
async function markRead(ctx) {
  const userId = ctx.state.user.id;
  const { conversation_id } = ctx.request.body;
  
  if (!conversation_id) {
    throw new BusinessError('缺少 conversation_id', 40001);
  }
  
  await Message.update(
    { is_read: 1 },
    {
      where: {
        conversation_id,
        receiver_id: userId,
        is_read: 0
      }
    }
  );
  
  ctx.body = {
    code: 0,
    message: '已标记为已读'
  };
}

module.exports = {
  conversations,
  list,
  send,
  markRead
};
