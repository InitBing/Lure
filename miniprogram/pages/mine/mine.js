/**
 * 个人中心页面
 */

const app = getApp();

Page({
  data: {
    isLogin: false,
    userInfo: {},
    stats: {},
    unreadCount: 0
  },

  onShow() {
    this.checkLogin();
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');

    if (token && userInfo) {
      this.setData({
        isLogin: true,
        userInfo
      });
      this.loadStats();
      this.loadUnreadCount();
    } else {
      this.setData({
        isLogin: false,
        userInfo: {},
        stats: {}
      });
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const res = await app.request('/user/stats');
      if (res.code === 0) {
        this.setData({ stats: res.data });
      }
    } catch (err) {
      console.error('加载统计失败:', err);
    }
  },

  // 加载未读消息数
  async loadUnreadCount() {
    // TODO: 实现未读消息数查询
    this.setData({ unreadCount: 0 });
  },

  // 登录
  async login() {
    wx.showLoading({ title: '登录中...' });

    try {
      await app.login();
      wx.hideLoading();
      this.checkLogin();
      app.toast('登录成功');
    } catch (err) {
      wx.hideLoading();
      app.toast('登录失败');
    }
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          this.setData({
            isLogin: false,
            userInfo: {},
            stats: {}
          });
          app.toast('已退出登录');
        }
      }
    });
  },

  // 跳转个人主页
  goProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  // 跳转我的作钓记录
  goMyLogs() {
    wx.navigateTo({
      url: '/pages/log-detail/log-detail?user_id=' + this.data.userInfo.id
    });
  },

  // 跳转我的二手商品
  goMyItems() {
    wx.navigateTo({
      url: '/pages/market/market?user_id=' + this.data.userInfo.id
    });
  },

  // 跳转我的收藏
  goMyFavorites() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 跳转消息
  goMessages() {
    wx.navigateTo({
      url: '/pages/message/message'
    });
  },

  // 跳转通知
  goNotifications() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 跳转隐私设置
  goPrivacy() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 跳转反馈
  goFeedback() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 跳转关于我们
  goAbout() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
});
