/**
 * 黑坑钓场模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pond = sequelize.define('Pond', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  owner_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '塘主 ID'
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '钓场名称'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '详细描述'
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '省'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '市'
  },
  district: {
    type: DataTypes.STRING(50),
    comment: '区/县'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '详细地址'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '纬度'
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    comment: '经度'
  },
  water_type: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '水域类型 1-池塘 2-水库 3-湖泊'
  },
  total_area: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '总面积 (亩)'
  },
  fish_depth: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '水深 (米)'
  },
  fish_types: {
    type: DataTypes.JSON,
    comment: '鱼种'
  },
  facilities: {
    type: DataTypes.JSON,
    comment: '设施'
  },
  services: {
    type: DataTypes.JSON,
    comment: '服务'
  },
  rules: {
    type: DataTypes.TEXT,
    comment: '钓场规则'
  },
  allowed_rods: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '允许竿数'
  },
  max_rod_length: {
    type: DataTypes.DECIMAL(4, 1),
    comment: '最大竿长 (米)'
  },
  photos: {
    type: DataTypes.JSON,
    comment: '照片 URLs'
  },
  cover_url: {
    type: DataTypes.STRING(255),
    comment: '封面图'
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '浏览数'
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '收藏数'
  },
  event_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '活动数量'
  },
  avg_rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    comment: '平均评分'
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '评价数'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态 1-营业中 0-已关闭'
  }
}, {
  tableName: 'ponds',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['owner_id'] },
    { fields: ['province', 'city'] },
    { fields: ['status'] }
  ]
});

module.exports = Pond;
