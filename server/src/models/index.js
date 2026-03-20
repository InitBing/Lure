/**
 * 模型导出
 */

const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const User = require('./User');
const Spot = require('./Spot');
const Log = require('./Log');
const Item = require('./Item');
const Video = require('./Video');
const Article = require('./Article');
const Message = require('./Message');
const Comment = require('./Comment');
const Favorite = require('./Favorite');
const Like = require('./Like');
const Follow = require('./Follow');
const PondOwner = require('./PondOwner');
const Pond = require('./Pond');
const PondEvent = require('./PondEvent');
const EventParticipant = require('./EventParticipant');

// 用户关联
User.hasMany(Spot, { foreignKey: 'created_by', as: 'createdSpots' });
Spot.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Log, { foreignKey: 'user_id', as: 'logs' });
Log.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

User.hasMany(Item, { foreignKey: 'user_id', as: 'items' });
Item.belongsTo(User, { foreignKey: 'user_id', as: 'seller' });

User.hasMany(Video, { foreignKey: 'user_id', as: 'videos' });
Video.belongsTo(User, { foreignKey: 'user_id', as: 'uploader' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.belongsToMany(User, {
  through: Follow,
  foreignKey: 'follower_id',
  as: 'followers'
});
User.belongsToMany(User, {
  through: Follow,
  foreignKey: 'following_id',
  as: 'followings'
});

// 钓点关联
Spot.hasMany(Log, { foreignKey: 'spot_id', as: 'logs' });
Log.belongsTo(Spot, { foreignKey: 'spot_id', as: 'spot' });

Spot.hasMany(Video, { foreignKey: 'spot_id', as: 'videos' });
Video.belongsTo(Spot, { foreignKey: 'spot_id', as: 'spot' });

// 作钓记录关联
Log.hasMany(Comment, { foreignKey: 'target_id', as: 'comments' });
Log.hasMany(Favorite, { foreignKey: 'target_id', as: 'favorites' });
Log.hasMany(Like, { foreignKey: 'target_id', as: 'likes' });

// 视频关联
Video.hasMany(Comment, { foreignKey: 'target_id', as: 'comments' });
Video.hasMany(Favorite, { foreignKey: 'target_id', as: 'favorites' });
Video.hasMany(Like, { foreignKey: 'target_id', as: 'likes' });

// 资讯关联
Article.hasMany(Favorite, { foreignKey: 'target_id', as: 'favorites' });

// 评论关联 (自关联 - 回复)
Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'parent' });

// 黑坑关联
PondOwner.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(PondOwner, { foreignKey: 'user_id', as: 'pondOwner' });

Pond.belongsTo(PondOwner, { foreignKey: 'owner_id', as: 'owner' });
PondOwner.hasMany(Pond, { foreignKey: 'owner_id', as: 'ponds' });

PondEvent.belongsTo(Pond, { foreignKey: 'pond_id', as: 'pond' });
Pond.hasMany(PondEvent, { foreignKey: 'pond_id', as: 'events' });

PondEvent.belongsTo(PondOwner, { foreignKey: 'owner_id', as: 'owner' });
PondOwner.hasMany(PondEvent, { foreignKey: 'owner_id', as: 'events' });

EventParticipant.belongsTo(PondEvent, { foreignKey: 'event_id', as: 'event' });
PondEvent.hasMany(EventParticipant, { foreignKey: 'event_id', as: 'participants' });

EventParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(EventParticipant, { foreignKey: 'user_id', as: 'eventParticipants' });

module.exports = {
  sequelize,
  Op,
  User,
  Spot,
  Log,
  Item,
  Video,
  Article,
  Message,
  Comment,
  Favorite,
  Like,
  Follow,
  PondOwner,
  Pond,
  PondEvent,
  EventParticipant
};
