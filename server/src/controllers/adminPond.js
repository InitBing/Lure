/**
 * 管理后台 - 黑坑管理控制器
 */

const { PondOwner, Pond, PondEvent, EventParticipant, sequelize } = require('../models');
const { BusinessError } = require('../middleware/error');

/**
 * 塘主列表
 * GET /api/v1/admin/pond-owners
 */
async function ownerList(ctx) {
  const { page = 1, page_size = 20, keyword, verify_status } = ctx.query;
  const offset = (page - 1) * page_size;
  
  const where = {};
  if (keyword) {
    where.business_name = { [sequelize.Op.like]: `%${keyword}%` };
  }
  if (verify_status !== undefined) {
    where.verify_status = parseInt(verify_status);
  }
  
  const { count, rows } = await PondOwner.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
    include: [{
      model: require('../models').User,
      as: 'user',
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
 * 审核塘主
 * PUT /api/v1/admin/pond-owners/:id/audit
 */
async function auditOwner(ctx) {
  const ownerId = parseInt(ctx.params.id);
  const { status, remark } = ctx.request.body;
  
  const owner = await PondOwner.findByPk(ownerId);
  if (!owner) {
    throw new BusinessError('塘主不存在', 40400);
  }
  
  await owner.update({
    verify_status: parseInt(status),
    verify_remark: remark || null,
    verified_at: status === 1 ? new Date() : null
  });
  
  ctx.body = {
    code: 0,
    message: status === 1 ? '审核通过' : '审核拒绝'
  };
}

/**
 * 更新塘主状态
 * PUT /api/v1/admin/pond-owners/:id/status
 */
async function updateOwnerStatus(ctx) {
  const ownerId = parseInt(ctx.params.id);
  const { status } = ctx.request.body;
  
  const owner = await PondOwner.findByPk(ownerId);
  if (!owner) {
    throw new BusinessError('塘主不存在', 40400);
  }
  
  await owner.update({ status: parseInt(status) });
  
  ctx.body = {
    code: 0,
    message: status === 1 ? '已启用' : '已禁用'
  };
}

/**
 * 钓场列表
 * GET /api/v1/admin/ponds
 */
async function pondList(ctx) {
  const { page = 1, page_size = 20, keyword, status } = ctx.query;
  const offset = (page - 1) * page_size;
  
  const where = {};
  if (keyword) {
    where.name = { [sequelize.Op.like]: `%${keyword}%` };
  }
  if (status !== undefined) {
    where.status = parseInt(status);
  }
  
  const { count, rows } = await Pond.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
    include: [{
      model: PondOwner,
      as: 'owner',
      include: [{
        model: require('../models').User,
        as: 'user',
        attributes: ['id', 'nickname', 'avatar']
      }]
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
 * 更新钓场状态
 * PUT /api/v1/admin/ponds/:id/status
 */
async function updatePondStatus(ctx) {
  const pondId = parseInt(ctx.params.id);
  const { status } = ctx.request.body;
  
  const pond = await Pond.findByPk(pondId);
  if (!pond) {
    throw new BusinessError('钓场不存在', 40400);
  }
  
  await pond.update({ status: parseInt(status) });
  
  ctx.body = {
    code: 0,
    message: status === 1 ? '已启用' : '已关闭'
  };
}

/**
 * 活动列表
 * GET /api/v1/admin/pond-events
 */
async function eventList(ctx) {
  const { page = 1, page_size = 20, status, event_type } = ctx.query;
  const offset = (page - 1) * page_size;
  
  const where = {};
  if (status !== undefined) {
    where.status = parseInt(status);
  }
  if (event_type !== undefined) {
    where.event_type = parseInt(event_type);
  }
  
  const { count, rows } = await PondEvent.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['event_date', 'DESC']],
    include: [{
      model: Pond,
      as: 'pond',
      attributes: ['id', 'name', 'province', 'city']
    }, {
      model: PondOwner,
      as: 'owner',
      attributes: ['id', 'business_name', 'credit_score']
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
 * 取消活动
 * PUT /api/v1/admin/pond-events/:id/cancel
 */
async function cancelEvent(ctx) {
  const eventId = parseInt(ctx.params.id);
  const { reason } = ctx.request.body;
  
  const event = await PondEvent.findByPk(eventId);
  if (!event) {
    throw new BusinessError('活动不存在', 40400);
  }
  
  await event.update({
    status: 4, // 已取消
    cancel_reason: reason || null
  });
  
  // TODO: 通知已报名用户并退款
  
  ctx.body = {
    code: 0,
    message: '活动已取消'
  };
}

/**
 * 报名列表
 * GET /api/v1/admin/event-participants
 */
async function participantList(ctx) {
  const { event_id, page = 1, page_size = 20, payment_status } = ctx.query;
  const offset = (page - 1) * page_size;
  
  const where = {};
  if (event_id) {
    where.event_id = parseInt(event_id);
  }
  if (payment_status !== undefined) {
    where.payment_status = parseInt(payment_status);
  }
  
  const { count, rows } = await EventParticipant.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
    include: [{
      model: require('../models').User,
      as: 'user',
      attributes: ['id', 'nickname', 'avatar']
    }, {
      model: PondEvent,
      as: 'event',
      attributes: ['id', 'title', 'event_date']
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

module.exports = {
  ownerList,
  auditOwner,
  updateOwnerStatus,
  pondList,
  updatePondStatus,
  eventList,
  cancelEvent,
  participantList
};
