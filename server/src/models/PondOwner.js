/**
 * 黑坑塘主模型
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PondOwner = sequelize.define('PondOwner', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '关联用户 ID'
  },
  business_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '钓场名称'
  },
  business_license: {
    type: DataTypes.STRING(255),
    comment: '营业执照 URL'
  },
  contact_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '联系人'
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '联系电话'
  },
  contact_wechat: {
    type: DataTypes.STRING(100),
    comment: '联系微信'
  },
  verify_status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '认证状态 0-待审核 1-已通过 2-已拒绝'
  },
  verify_remark: {
    type: DataTypes.TEXT,
    comment: '审核备注'
  },
  verified_at: {
    type: DataTypes.DATE,
    comment: '认证通过时间'
  },
  pond_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '钓场数量'
  },
  event_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '活动数量'
  },
  participant_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '累计报名人数'
  },
  credit_score: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: '信用分'
  },
  complaint_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '投诉次数'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态 1-正常 0-禁用'
  }
}, {
  tableName: 'pond_owners',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['user_id'] },
    { fields: ['verify_status'] },
    { fields: ['status'] }
  ]
});

module.exports = PondOwner;
