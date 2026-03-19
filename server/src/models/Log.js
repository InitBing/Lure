/**
 * 作钓记录模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  spot_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  spot_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  log_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  weather: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '1-晴 2-多云 3-阴 4-小雨 5-大雨 6-雷阵雨'
  },
  temperature: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true
  },
  water_temp: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true
  },
  wind: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  water_level: {
    type: DataTypes.TINYINT,
    defaultValue: 2,
    comment: '1-低 2-中 3-高'
  },
  lures_used: {
    type: DataTypes.JSON,
    allowNull: true
  },
  rod: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  reel: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  line: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  catch_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  max_length: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: true
  },
  max_weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true
  },
  video_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_public: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'logs',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['spot_id'] },
    { fields: ['log_date'] },
    { fields: ['is_public', 'status'] }
  ]
});

module.exports = Log;
