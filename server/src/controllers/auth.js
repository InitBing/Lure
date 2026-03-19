/**
 * 认证控制器
 */

const { generateToken, verifyWechatCode } = require('../middleware/auth');
const { User } = require('../models');
const { BusinessError } = require('../middleware/error');

/**
 * 微信登录
 * POST /api/v1/auth/wechat
 */
async function wechatLogin(ctx) {
  const { code } = ctx.request.body;
  
  if (!code) {
    throw new BusinessError('缺少微信 code', 40001);
  }
  
  // 验证微信 code
  const wechatResult = await verifyWechatCode(code);
  const { openid, unionid } = wechatResult;
  
  // 获取用户信息 (从微信或创建/更新)
  const user = await User.createOrUpdate(openid, {
    nickname: ctx.request.body.nickname,
    avatar: ctx.request.body.avatar,
    gender: ctx.request.body.gender
  });
  
  // 生成 Token
  const token = generateToken({
    id: user.id,
    openid: user.openid
  });
  
  ctx.body = {
    code: 0,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        region: user.region,
        is_new: user.created_at === user.updated_at
      }
    }
  };
}

module.exports = {
  wechatLogin
};
