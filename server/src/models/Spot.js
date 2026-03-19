/**
 * 钓点模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Spot = sequelize.define('Spot', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
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
  district: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },
  water_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '1-水库 2-河流 3-湖泊 4-溪流 5-海钓 6-池塘'
  },
  fish_types: {
    type: DataTypes.JSON,
    allowNull: true
  },
  fee_status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '1-免费 2-收费 3-会员制'
  },
  fee_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  best_seasons: {
    type: DataTypes.JSON,
    allowNull: true
  },
  facilities: {
    type: DataTypes.JSON,
    allowNull: true
  },
  visit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  log_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avg_rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0-待审核 1-已上线 2-已下线'
  },
  created_by: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'spots',
  indexes: [
    { fields: ['latitude', 'longitude'] },
    { fields: ['city'] },
    { fields: ['water_type'] },
    { fields: ['status'] },
    { fields: ['created_by'] }
  ]
});

module.exports = Spot;
