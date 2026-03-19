/**
 * 资讯模型
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '标题'
  },
  summary: {
    type: DataTypes.STRING(500),
    comment: '摘要'
  },
  content: {
    type: DataTypes.TEXT,
    comment: '内容'
  },
  cover_url: {
    type: DataTypes.STRING(255),
    comment: '封面图'
  },
  source_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '来源名称'
  },
  source_url: {
    type: DataTypes.STRING(500),
    comment: '原文链接'
  },
  author: {
    type: DataTypes.STRING(100),
    comment: '作者'
  },
  category: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '分类 1-新闻 2-赛事 3-评测 4-教学 5-新品'
  },
  tags: {
    type: DataTypes.JSON,
    comment: '标签'
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '阅读数'
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '收藏数'
  },
  crawl_source: {
    type: DataTypes.STRING(50),
    comment: '抓取来源标识'
  },
  crawl_time: {
    type: DataTypes.DATE,
    comment: '抓取时间'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态 1-已发布 0-隐藏'
  },
  is_recommend: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否推荐'
  },
  published_at: {
    type: DataTypes.DATE,
    comment: '发布时间'
  }
}, {
  tableName: 'articles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['is_recommend'] },
    { fields: ['published_at'] }
  ]
});

module.exports = Article;
