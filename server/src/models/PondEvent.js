/**
 * 钓场活动模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PondEvent = sequelize.define('PondEvent', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  pond_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '钓场 ID'
  },
  owner_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '塘主 ID'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '活动标题'
  },
  event_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '类型 1-正钓 2-偷驴 3-比赛 4-其他'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '活动详情'
  },
  event_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '活动日期'
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: '开始时间'
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: '结束时间'
  },
  registration_deadline: {
    type: DataTypes.DATE,
    comment: '报名截止时间'
  },
  fee_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '报名费用'
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '押金'
  },
  prize_pool: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '总奖金'
  },
  fish_weight_rule: {
    type: DataTypes.STRING(100),
    comment: '计重方式'
  },
  allowed_rods: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '允许竿数'
  },
  max_rod_length: {
    type: DataTypes.DECIMAL(4, 1),
    comment: '最大竿长'
  },
  allowed_baits: {
    type: DataTypes.JSON,
    comment: '允许饵料'
  },
  other_rules: {
    type: DataTypes.TEXT,
    comment: '其他规则'
  },
  max_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '最大人数'
  },
  current_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '当前报名人数'
  },
  provided_items: {
    type: DataTypes.JSON,
    comment: '提供物品'
  },
  cover_url: {
    type: DataTypes.STRING(255),
    comment: '封面图'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态 0-报名中 1-已满员 2-进行中 3-已结束 4-已取消'
  }
}, {
  tableName: 'pond_events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['pond_id'] },
    { fields: ['owner_id'] },
    { fields: ['event_date'] },
    { fields: ['status'] }
  ]
});

module.exports = PondEvent;
