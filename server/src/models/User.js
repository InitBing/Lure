/**
 * 用户模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  openid: {
    type: DataTypes.STRING(64),
    unique: true,
    allowNull: false
  },
  unionid: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  nickname: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  gender: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0-未知 1-男 2-女'
  },
  region: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  log_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  catch_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  post_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  follower_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  following_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  credit_score: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  trade_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  trade_rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 5.0
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '1-正常 0-封禁'
  },
  is_admin: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['openid'] },
    { fields: ['region'] },
    { fields: ['credit_score'] }
  ]
});

// 实例方法
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.openid; // 不返回敏感信息
  return values;
};

// 静态方法
User.findByOpenid = async function(openid) {
  return await this.findOne({ where: { openid } });
};

User.createOrUpdate = async function(openid, profile) {
  let user = await this.findByOpenid(openid);
  
  if (user) {
    await user.update({
      nickname: profile.nickname || user.nickname,
      avatar: profile.avatar || user.avatar,
      gender: profile.gender || user.gender,
      last_login_at: new Date()
    });
  } else {
    user = await this.create({
      openid,
      nickname: profile.nickname || '路亚爱好者',
      avatar: profile.avatar,
      gender: profile.gender || 0,
      last_login_at: new Date()
    });
  }
  
  return user;
};

module.exports = User;
