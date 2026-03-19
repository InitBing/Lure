/**
 * 数据库配置
 */

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'lurebin',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+08:00', // 东八区
    
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

// 测试连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

// 同步数据库 (开发环境)
async function syncDatabase(force = false) {
  if (process.env.NODE_ENV === 'development' || force) {
    await sequelize.sync({ force, alter: !force });
    console.log('✅ Database synchronized.');
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
