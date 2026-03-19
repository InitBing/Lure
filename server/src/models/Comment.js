/**
 * 评论模型
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '用户 ID'
  },
  target_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '类型 1-作钓记录 2-视频 3-资讯 4-二手商品'
  },
  target_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '目标 ID'
  },
  parent_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '父评论 ID (回复)'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '评论内容'
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '点赞数'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态 1-正常 0-隐藏'
  }
}, {
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['target_type', 'target_id', 'created_at'] },
    { fields: ['user_id'] },
    { fields: ['parent_id'] }
  ]
});

module.exports = Comment;
