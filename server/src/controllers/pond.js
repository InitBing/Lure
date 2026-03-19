/**
 * 黑坑管理控制器
 */

const { PondOwner, Pond, PondEvent, EventParticipant, User, sequelize } = require('../models');
const { BusinessError } = require('../middleware/error');

/**
 * 塘主认证
 * POST /api/v1/pond/owner/apply
 */
async function applyOwner(ctx) {
  const userId = ctx.state.user.id;
  const data = ctx.request.body;
  
  // 检查是否已是塘主
  const existing = await PondOwner.findOne({ where: { user_id: userId } });
  if (existing) {
    throw new BusinessError('您已是认证塘主', 40900);
  }
  
  // 必填字段
  const required = ['business_name', 'contact_name', 'contact_phone'];
  for (const field of required) {
    if (!data[field]) {
      throw new BusinessError(`缺少必填字段：${field}`, 40001);
    }
  }
  
  const owner = await PondOwner.create({
    user_id: userId,
    ...data,
    verify_status: 0 // 待审核
  });
  
  ctx.body = {
    code: 0,
    message: '申请提交成功，请等待审核',
    data: { owner }
  };
}

/**
 * 获取塘主信息
 * GET /api/v1/pond/owner/info
 */
async function getOwnerInfo(ctx) {
  const userId = ctx.state.user.id;
  
  const owner = await PondOwner.findOne({
    where: { user_id: userId },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'nickname', 'avatar']
    }]
  });
  
  ctx.body = {
    code: 0,
    data: { owner }
  };
}

/**
 * 创建钓场
 * POST /api/v1/pond/ponds
 */
async function createPond(ctx) {
  const userId = ctx.state.user.id;
  const data = ctx.request.body;
  
  // 获取塘主信息
  const owner = await PondOwner.findOne({ where: { user_id: userId } });
  if (!owner) {
    throw new BusinessError('请先申请成为塘主', 40300);
  }
  
  if (owner.verify_status !== 1) {
    throw new BusinessError('塘主认证未通过', 40300);
  }
  
  // 必填字段
  const required = ['name', 'province', 'city', 'address'];
  for (const field of required) {
    if (!data[field]) {
      throw new BusinessError(`缺少必填字段：${field}`, 40001);
    }
  }
  
  const pond = await Pond.create({
    ...data,
    owner_id: owner.id
  });
  
  // 更新塘主钓场数量
  await owner.increment('pond_count');
  
  ctx.body = {
    code: 0,
    message: '钓场创建成功',
    data: { pond }
  };
}

/**
 * 钓场列表
 * GET /api/v1/pond/ponds
 */
async function pondList(ctx) {
  const {
    province, city, keyword,
    page = 1, page_size = 20
  } = ctx.query;
  
  const offset = (page - 1) * page_size;
  const where = { status: 1 };
  
  if (province) where.province = province;
  if (city) where.city = city;
  if (keyword) {
    where.name = { [sequelize.Op.like]: `%${keyword}%` };
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
        model: User,
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
 * 钓场详情
 * GET /api/v1/pond/ponds/:id
 */
async function getPond(ctx) {
  const pond = await Pond.findByPk(ctx.params.id, {
    include: [{
      model: PondOwner,
      as: 'owner',
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'avatar']
      }]
    }]
  });
  
  if (!pond) {
    throw new BusinessError('钓场不存在', 40400);
  }
  
  // 增加浏览计数
  await pond.increment('view_count');
  
  ctx.body = {
    code: 0,
    data: { pond }
  };
}

/**
 * 发布活动
 * POST /api/v1/pond/events
 */
async function createEvent(ctx) {
  const userId = ctx.state.user.id;
  const data = ctx.request.body;
  
  // 获取塘主信息
  const owner = await PondOwner.findOne({ where: { user_id: userId } });
  if (!owner || owner.verify_status !== 1) {
    throw new BusinessError('塘主认证未通过', 40300);
  }
  
  // 必填字段
  const required = ['pond_id', 'title', 'event_type', 'event_date', 'start_time', 'end_time', 'fee_amount'];
  for (const field of required) {
    if (!data[field]) {
      throw new BusinessError(`缺少必填字段：${field}`, 40001);
    }
  }
  
  // 检查钓场归属
  const pond = await Pond.findByPk(data.pond_id);
  if (!pond || pond.owner_id !== owner.id) {
    throw new BusinessError('无权在此钓场发布活动', 40300);
  }
  
  const event = await PondEvent.create({
    ...data,
    owner_id: owner.id,
    status: 0 // 报名中
  });
  
  // 更新统计
  await owner.increment('event_count');
  await pond.increment('event_count');
  
  ctx.body = {
    code: 0,
    message: '活动发布成功',
    data: { event }
  };
}

/**
 * 活动列表
 * GET /api/v1/pond/events
 */
async function eventList(ctx) {
  const {
    pond_id, owner_id, event_type,
    status, date_from, date_to,
    page = 1, page_size = 20
  } = ctx.query;
  
  const offset = (page - 1) * page_size;
  const where = {};
  
  if (pond_id) where.pond_id = parseInt(pond_id);
  if (owner_id) where.owner_id = parseInt(owner_id);
  if (event_type) where.event_type = parseInt(event_type);
  if (status !== undefined) where.status = parseInt(status);
  
  if (date_from || date_to) {
    where.event_date = {};
    if (date_from) where.event_date[sequelize.Op.gte] = date_from;
    if (date_to) where.event_date[sequelize.Op.lte] = date_to;
  }
  
  const { count, rows } = await PondEvent.findAndCountAll({
    where,
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['event_date', 'DESC'], ['start_time', 'ASC']],
    include: [{
      model: Pond,
      as: 'pond',
      attributes: ['id', 'name', 'cover_url', 'province', 'city', 'address']
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
 * 活动详情
 * GET /api/v1/pond/events/:id
 */
async function getEvent(ctx) {
  const event = await PondEvent.findByPk(ctx.params.id, {
    include: [{
      model: Pond,
      as: 'pond',
      include: [{
        model: PondOwner,
        as: 'owner',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar']
        }]
      }]
    }]
  });
  
  if (!event) {
    throw new BusinessError('活动不存在', 40400);
  }
  
  ctx.body = {
    code: 0,
    data: { event }
  };
}

/**
 * 报名活动
 * POST /api/v1/pond/events/:id/join
 */
async function joinEvent(ctx) {
  const userId = ctx.state.user.id;
  const eventId = parseInt(ctx.params.id);
  const { rod_count, remarks } = ctx.request.body;
  
  // 获取活动信息
  const event = await PondEvent.findByPk(eventId);
  if (!event) {
    throw new BusinessError('活动不存在', 40400);
  }
  
  // 检查状态
  if (event.status !== 0) {
    throw new BusinessError('活动已结束或取消', 40001);
  }
  
  // 检查名额
  if (event.max_participants > 0 && event.current_participants >= event.max_participants) {
    throw new BusinessError('活动已满员', 40001);
  }
  
  // 检查是否已报名
  const existing = await EventParticipant.findOne({
    where: { event_id: eventId, user_id: userId }
  });
  if (existing) {
    throw new BusinessError('您已报名此活动', 40900);
  }
  
  // 创建报名记录
  const participant = await EventParticipant.create({
    event_id: eventId,
    user_id: userId,
    rod_count: rod_count || 1,
    remarks: remarks || '',
    fee_amount: event.fee_amount,
    deposit_amount: event.deposit_amount || 0,
    payment_status: 0, // 待支付
    status: 0
  });
  
  // 更新报名人数
  await event.increment('current_participants');
  
  // 检查是否满员
  if (event.max_participants > 0 && event.current_participants + 1 >= event.max_participants) {
    await event.update({ status: 1 }); // 已满员
  }
  
  ctx.body = {
    code: 0,
    message: '报名成功，请支付费用',
    data: { participant }
  };
}

/**
 * 我的报名
 * GET /api/v1/pond/participants
 */
async function myParticipants(ctx) {
  const userId = ctx.state.user.id;
  const { page = 1, page_size = 20 } = ctx.query;
  
  const offset = (page - 1) * page_size;
  
  const { count, rows } = await EventParticipant.findAndCountAll({
    where: { user_id: userId },
    limit: parseInt(page_size),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
    include: [{
      model: PondEvent,
      as: 'event',
      include: [{
        model: Pond,
        as: 'pond'
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
 * 支付报名费
 * POST /api/v1/pond/participants/:id/pay
 */
async function payParticipant(ctx) {
  const userId = ctx.state.user.id;
  const participantId = parseInt(ctx.params.id);
  const { payment_method } = ctx.request.body;
  
  const participant = await EventParticipant.findByPk(participantId);
  if (!participant || participant.user_id !== userId) {
    throw new BusinessError('报名记录不存在', 40400);
  }
  
  if (participant.payment_status === 1) {
    throw new BusinessError('已支付', 40001);
  }
  
  // 更新支付状态 (实际应调起支付接口)
  await participant.update({
    payment_status: 1,
    payment_method: payment_method || 1,
    payment_time: new Date()
  });
  
  // 更新塘主统计
  const event = await PondEvent.findByPk(participant.event_id);
  const owner = await PondOwner.findByPk(event.owner_id);
  await owner.increment('participant_count');
  
  ctx.body = {
    code: 0,
    message: '支付成功'
  };
}

/**
 * 活动签到
 * POST /api/v1/pond/participants/:id/checkin
 */
async function checkinParticipant(ctx) {
  const userId = ctx.state.user.id;
  const participantId = parseInt(ctx.params.id);
  
  const participant = await EventParticipant.findByPk(participantId);
  if (!participant || participant.user_id !== userId) {
    throw new BusinessError('报名记录不存在', 40400);
  }
  
  if (participant.payment_status !== 1) {
    throw new BusinessError('请先支付报名费', 40001);
  }
  
  if (participant.check_in_status === 1) {
    throw new BusinessError('已签到', 40001);
  }
  
  // 检查活动是否开始
  const event = await PondEvent.findByPk(participant.event_id);
  const now = new Date();
  const eventDateTime = new Date(`${event.event_date} ${event.start_time}`);
  
  // 允许提前 30 分钟签到
  if (now < new Date(eventDateTime.getTime() - 30 * 60 * 1000)) {
    throw new BusinessError('活动尚未开始，不能签到', 40001);
  }
  
  // 更新签到状态
  await participant.update({
    check_in_status: 1,
    check_in_time: new Date()
  });
  
  ctx.body = {
    code: 0,
    message: '签到成功'
  };
}

/**
 * 钓场评价
 * POST /api/v1/pond/ponds/:id/review
 */
async function createReview(ctx) {
  const userId = ctx.state.user.id;
  const pondId = parseInt(ctx.params.id);
  const { rating, content, photos, tags } = ctx.request.body;
  
  if (!rating || rating < 1 || rating > 5) {
    throw new BusinessError('评分必须在 1-5 之间', 40001);
  }
  
  const { PondReview } = require('../models');
  
  const review = await PondReview.create({
    pond_id: pondId,
    user_id: userId,
    rating,
    content,
    photos,
    tags
  });
  
  // 更新钓点评分
  const pond = await Pond.findByPk(pondId);
  const avgResult = await PondReview.findOne({
    where: { pond_id: pondId },
    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']]
  });
  
  await pond.update({
    avg_rating: avgResult.dataValues.avg,
    review_count: sequelize.literal('review_count + 1')
  });
  
  ctx.body = {
    code: 0,
    message: '评价成功',
    data: { review }
  };
}

module.exports = {
  applyOwner,
  getOwnerInfo,
  createPond,
  pondList,
  getPond,
  createEvent,
  eventList,
  getEvent,
  joinEvent,
  myParticipants,
  payParticipant,
  createReview
};
