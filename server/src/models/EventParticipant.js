/**
 * 活动报名表模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EventParticipant = sequelize.define('EventParticipant', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  event_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '活动 ID'
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '用户 ID'
  },
  rod_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '竿数'
  },
  remarks: {
    type: DataTypes.STRING(500),
    comment: '备注'
  },
  fee_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '报名费'
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '押金'
  },
  payment_status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '支付状态 0-未支付 1-已支付 2-已退款'
  },
  payment_time: {
    type: DataTypes.DATE,
    comment: '支付时间'
  },
  payment_method: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '支付方式 1-微信 2-支付宝'
  },
  check_in_status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '签到状态 0-未签到 1-已签到'
  },
  check_in_time: {
    type: DataTypes.DATE,
    comment: '签到时间'
  },
  catch_weight: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '渔获重量 (斤)'
  },
  catch_rank: {
    type: DataTypes.INTEGER,
    comment: '排名'
  },
  prize_amount: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '奖金'
  },
  rating: {
    type: DataTypes.TINYINT,
    comment: '评分 1-5'
  },
  review_content: {
    type: DataTypes.TEXT,
    comment: '评价内容'
  },
  review_photos: {
    type: DataTypes.JSON,
    comment: '评价照片'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态 0-已报名 1-已取消 2-已完成'
  }
}, {
  tableName: 'event_participants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['event_id', 'user_id'] },
    { fields: ['event_id'] },
    { fields: ['user_id'] },
    { fields: ['payment_status'] }
  ]
});

module.exports = EventParticipant;
