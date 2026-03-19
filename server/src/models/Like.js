/**
 * 点赞模型
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
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
    comment: '类型 1-作钓记录 2-钓点评价 3-二手商品 4-视频 5-评论'
  },
  target_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '目标 ID'
  }
}, {
  tableName: 'likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['user_id', 'target_type', 'target_id'] },
    { fields: ['target_type', 'target_id'] }
  ]
});

module.exports = Like;
