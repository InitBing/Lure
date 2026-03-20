/**
 * 视频模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '上传者 ID'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '标题'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '描述'
  },
  video_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '视频 URL'
  },
  cover_url: {
    type: DataTypes.STRING(255),
    comment: '封面 URL'
  },
  duration: {
    type: DataTypes.INTEGER,
    comment: '时长 (秒)'
  },
  spot_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '关联钓点 ID'
  },
  spot_name: {
    type: DataTypes.STRING(100),
    comment: '关联钓点名称'
  },
  lures_used: {
    type: DataTypes.JSON,
    comment: '使用拟饵'
  },
  tags: {
    type: DataTypes.JSON,
    comment: '标签'
  },
  play_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '播放数'
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '点赞数'
  },
  comment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '评论数'
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '收藏数'
  },
  share_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '分享数'
  },
  source: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '来源 1-用户上传 2-运营上传'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态 0-审核中 1-已发布 2-已下架'
  }
}, {
  tableName: 'videos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['play_count'] }
  ]
});

module.exports = Video;
