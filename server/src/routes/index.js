/**
 * 路由配置
 */

const Router = require('koa-router');
const router = new Router({ prefix: '/api/v1' });

// 导入控制器
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const spotController = require('../controllers/spot');
const logController = require('../controllers/log');
const itemController = require('../controllers/item');
const uploadController = require('../controllers/upload');
const videoController = require('../controllers/video');
const articleController = require('../controllers/article');
const messageController = require('../controllers/message');
const commentController = require('../controllers/comment');
const adminController = require('../controllers/admin');
const pondController = require('../controllers/pond');
const adminPondController = require('../controllers/adminPond');

// 导入中间件
const { requireAuth } = require('../middleware/auth');
const { requireAdmin, requireRole } = require('../middleware/adminAuth');

// 健康检查
router.get('/health', async (ctx) => {
  ctx.body = { code: 0, message: 'OK', data: { timestamp: new Date().toISOString() } };
});

// 认证路由
router.post('/auth/wechat', authController.wechatLogin);

// 用户路由
router.get('/user/profile', requireAuth(), userController.getProfile);
router.put('/user/profile', requireAuth(), userController.updateProfile);
router.get('/user/stats', requireAuth(), userController.getStats);
router.post('/user/:id/follow', requireAuth(), userController.follow);
router.delete('/user/:id/follow', requireAuth(), userController.unfollow);
router.get('/users', userController.list);

// 钓点路由
router.get('/spots', spotController.list);
router.get('/spots/:id', spotController.get);
router.post('/spots', requireAuth(), spotController.create);
router.get('/spots/:id/reviews', spotController.getReviews);
router.post('/spots/:id/reviews', requireAuth(), spotController.createReview);

// 作钓记录路由
router.get('/logs', logController.list);
router.get('/logs/:id', logController.get);
router.post('/logs', requireAuth(), logController.create);
router.put('/logs/:id', requireAuth(), logController.update);
router.delete('/logs/:id', requireAuth(), logController.delete);
router.post('/logs/:id/like', requireAuth(), logController.like);
router.post('/logs/:id/favorite', requireAuth(), logController.favorite);

// 二手商品路由
router.get('/items', itemController.list);
router.get('/items/:id', itemController.get);
router.post('/items', requireAuth(), itemController.create);
router.put('/items/:id', requireAuth(), itemController.update);
router.delete('/items/:id', requireAuth(), itemController.delete);
router.put('/items/:id/sold', requireAuth(), itemController.markSold);

// 上传路由
router.post('/upload/image', requireAuth(), uploadController.image);
router.post('/upload/video', requireAuth(), uploadController.video);

// 视频路由
router.get('/videos', videoController.list);
router.get('/videos/:id', videoController.get);
router.post('/videos', requireAuth(), videoController.create);
router.put('/videos/:id', requireAuth(), videoController.update);
router.delete('/videos/:id', requireAuth(), videoController.remove);
router.post('/videos/:id/like', requireAuth(), videoController.like);
router.post('/videos/:id/favorite', requireAuth(), videoController.favorite);

// 资讯路由
router.get('/articles', articleController.list);
router.get('/articles/:id', articleController.get);
router.post('/articles/:id/favorite', requireAuth(), articleController.favorite);

// 消息路由
router.get('/messages/conversations', requireAuth(), messageController.conversations);
router.get('/messages', requireAuth(), messageController.list);
router.post('/messages', requireAuth(), messageController.send);
router.put('/messages/read', requireAuth(), messageController.markRead);

// 评论路由
router.get('/comments', commentController.list);
router.post('/comments', requireAuth(), commentController.create);
router.delete('/comments/:id', requireAuth(), commentController.remove);
router.post('/comments/:id/like', requireAuth(), commentController.like);

// 管理后台路由
router.post('/admin/login', adminController.login);
router.get('/admin/profile', requireAdmin, adminController.getProfile);
router.get('/admin/stats', requireAdmin, adminController.getStats);

// 用户管理
router.get('/admin/users', requireAdmin, adminController.userList);
router.put('/admin/users/:id/status', requireAdmin, adminController.updateUserStatus);

// 钓点管理
router.get('/admin/spots', requireAdmin, adminController.spotList);
router.put('/admin/spots/:id/audit', requireAdmin, adminController.auditSpot);

// 黑坑管理
router.get('/admin/pond-owners', requireAdmin, adminPondController.ownerList);
router.put('/admin/pond-owners/:id/audit', requireAdmin, adminPondController.auditOwner);
router.put('/admin/pond-owners/:id/status', requireAdmin, adminPondController.updateOwnerStatus);
router.get('/admin/ponds', requireAdmin, adminPondController.pondList);
router.put('/admin/ponds/:id/status', requireAdmin, adminPondController.updatePondStatus);
router.get('/admin/pond-events', requireAdmin, adminPondController.eventList);
router.put('/admin/pond-events/:id/cancel', requireAdmin, adminPondController.cancelEvent);
router.get('/admin/event-participants', requireAdmin, adminPondController.participantList);

// 内容管理
router.get('/admin/contents', requireAdmin, adminController.contentList);
router.delete('/admin/contents/:type/:id', requireAdmin, adminController.deleteContent);

// 黑坑管理路由
router.post('/pond/owner/apply', requireAuth(), pondController.applyOwner);
router.get('/pond/owner/info', requireAuth(), pondController.getOwnerInfo);
router.post('/pond/ponds', requireAuth(), pondController.createPond);
router.get('/pond/ponds', pondController.pondList);
router.get('/pond/ponds/:id', pondController.getPond);
router.post('/pond/events', requireAuth(), pondController.createEvent);
router.get('/pond/events', pondController.eventList);
router.get('/pond/events/:id', pondController.getEvent);
router.post('/pond/events/:id/join', requireAuth(), pondController.joinEvent);
router.get('/pond/participants', requireAuth(), pondController.myParticipants);
router.post('/pond/participants/:id/pay', requireAuth(), pondController.payParticipant);
router.post('/pond/ponds/:id/review', requireAuth(), pondController.createReview);

// 搜索路由
router.get('/search', async (ctx) => {
  const { keyword, type = 'all', page = 1 } = ctx.query;
  
  if (!keyword) {
    ctx.body = { code: 40001, message: '缺少搜索关键词', data: null };
    return;
  }
  
  const { Spot, Log, Item, Video, User, sequelize } = require('../models');
  const result = {};
  
  if (type === 'all' || type === 'spots') {
    result.spots = await Spot.findAll({
      where: {
        name: { [sequelize.Op.like]: `%${keyword}%` },
        status: 1
      },
      limit: 10
    });
  }
  
  if (type === 'all' || type === 'logs') {
    result.logs = await Log.findAll({
      where: {
        notes: { [sequelize.Op.like]: `%${keyword}%` },
        is_public: 1,
        status: 1
      },
      limit: 10,
      include: [{ model: User, as: 'author', attributes: ['id', 'nickname', 'avatar'] }]
    });
  }
  
  if (type === 'all' || type === 'items') {
    result.items = await Item.findAll({
      where: {
        [sequelize.Op.or]: [
          { title: { [sequelize.Op.like]: `%${keyword}%` } },
          { brand: { [sequelize.Op.like]: `%${keyword}%` } },
          { model: { [sequelize.Op.like]: `%${keyword}%` } }
        ],
        status: 1
      },
      limit: 10
    });
  }
  
  if (type === 'all' || type === 'videos') {
    result.videos = await Video.findAll({
      where: {
        title: { [sequelize.Op.like]: `%${keyword}%` },
        status: 1
      },
      limit: 10
    });
  }
  
  if (type === 'all' || type === 'users') {
    result.users = await User.findAll({
      where: {
        nickname: { [sequelize.Op.like]: `%${keyword}%` },
        status: 1
      },
      attributes: ['id', 'nickname', 'avatar', 'region'],
      limit: 10
    });
  }
  
  ctx.body = {
    code: 0,
    data: { ...result, page: parseInt(page) }
  };
});

module.exports = router;
