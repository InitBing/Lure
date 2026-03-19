/**
 * 二手商品模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  category: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '1-拟饵 2-竿子 3-轮子 4-线组 5-配件 6-其他'
  },
  sub_category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  condition: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '1-全新 2-95 新 3-9 新 4-8 新 5-7 新 6-战斗成色'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: false
  },
  video_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  shipping: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '1-包邮 2-不包邮 3-面议'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '1-在售 2-已售出 3-已下架'
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  inquiry_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sold_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'items',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['price'] },
    { fields: ['province', 'city'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Item;
