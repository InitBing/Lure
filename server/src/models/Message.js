/**
 * 消息模型
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  conversation_id: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: '会话 ID (发送者 ID_接收者 ID)'
  },
  sender_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '发送者 ID'
  },
  receiver_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '接收者 ID'
  },
  type: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '类型 1-文本 2-图片 3-商品卡片 4-钓点卡片'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '消息内容'
  },
  media_url: {
    type: DataTypes.STRING(255),
    comment: '媒体 URL'
  },
  is_read: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否已读'
  },
  is_deleted: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否删除'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['conversation_id'] },
    { fields: ['sender_id', 'created_at'] },
    { fields: ['receiver_id', 'is_read', 'created_at'] }
  ]
});

module.exports = Message;
