/**
 * 关注模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  follower_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '关注者 ID'
  },
  following_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '被关注者 ID'
  }
}, {
  tableName: 'follows',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['follower_id', 'following_id'] },
    { fields: ['follower_id'] },
    { fields: ['following_id'] }
  ]
});

module.exports = Follow;
