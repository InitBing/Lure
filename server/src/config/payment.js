/**
 * 支付配置
 * 
 * 使用前请复制 .env.example 为 .env 并填入真实配置
 */

require('dotenv').config();

module.exports = {
  // 微信支付配置
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    mchId: process.env.WECHAT_PAY_MCHID || '',
    key: process.env.WECHAT_PAY_KEY || '',
    certPath: process.env.WECHAT_PAY_CERT_PATH || '',
    keyPath: process.env.WECHAT_PAY_KEY_PATH || '',
    notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || 'https://api.lurebin.com/api/v1/pay/wechat/notify',
    refundNotifyUrl: process.env.WECHAT_PAY_REFUND_NOTIFY_URL || 'https://api.lurebin.com/api/v1/pay/wechat/refund-notify'
  },

  // 支付宝配置
  alipay: {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    notifyUrl: process.env.ALIPAY_NOTIFY_URL || 'https://api.lurebin.com/api/v1/pay/alipay/notify',
    returnUrl: process.env.ALIPAY_RETURN_URL || 'https://lurebin.com/pay/return'
  },

  // 支付配置
  payment: {
    timeout: 30 * 60 * 1000, // 支付超时时间 30 分钟
    retryTimes: 3, // 重试次数
    minAmount: 0.01, // 最小支付金额
    maxAmount: 10000 // 最大支付金额
  }
};
