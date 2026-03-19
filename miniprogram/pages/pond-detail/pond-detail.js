/**
 * 黑坑详情页
 */

const app = getApp();

Page({
  data: {
    pondId: 0,
    pond: {},
    events: [],
    isFavorited: false,
    eventTypeMap: {
      1: '正钓',
      2: '偷驴',
      3: '比赛',
      4: '其他'
    }
  },

  onLoad(options) {
    this.setData({ pondId: parseInt(options.id) });
    this.loadPondDetail();
    this.loadEvents();
  },

  // 加载钓场详情
  async loadPondDetail() {
    try {
      const res = await app.request(`/pond/ponds/${this.data.pondId}`);
      if (res.code === 0) {
        this.setData({ pond: res.data.pond });
        this.checkFavorite();
      }
    } catch (err) {
      console.error('加载详情失败:', err);
      app.toast('加载失败');
    }
  },

  // 加载活动列表
  async loadEvents() {
    try {
      const res = await app.request('/pond/events', {
        data: {
          pond_id: this.data.pondId,
          page: 1,
          page_size: 10
        }
      });
      if (res.code === 0) {
        this.setData({ events: res.data.list || [] });
      }
    } catch (err) {
      console.error('加载活动失败:', err);
    }
  },

  // 检查收藏状态
  async checkFavorite() {
    // TODO: 实现收藏状态查询
    this.setData({ isFavorited: false });
  },

  // 收藏
  async toggleFavorite() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }
    // TODO: 实现收藏功能
    app.toast('收藏功能开发中');
  },

  // 导航
  goNavigation() {
    const { latitude, longitude, name, address } = this.data.pond;
    if (latitude && longitude) {
      wx.openLocation({
        latitude,
        longitude,
        name: name,
        address: address,
        scale: 16
      });
    } else {
      app.toast('暂无位置信息');
    }
  },

  // 联系塘主
  contactOwner() {
    const owner = this.data.pond.owner;
    wx.showActionSheet({
      itemList: ['拨打电话', '加微信'],
      success: (res) => {
        if (res.tapIndex === 0 && owner.contact_phone) {
          wx.makePhoneCall({
            phoneNumber: owner.contact_phone
          });
        } else if (res.tapIndex === 1 && owner.contact_wechat) {
          wx.setClipboardData({
            data: owner.contact_wechat,
            success: () => {
              app.toast('微信号已复制');
            }
          });
        }
      }
    });
  },

  // 跳转塘主主页
  goOwner() {
    // TODO: 跳转塘主主页
    app.toast('塘主主页开发中');
  },

  // 跳转活动列表
  goAllEvents() {
    wx.navigateTo({
      url: `/pages/event-list/event-list?pond_id=${this.data.pondId}`
    });
  },

  // 跳转活动详情
  goEvent(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/event-detail/event-detail?id=${id}`
    });
  },

  // 报名活动
  goEvents() {
    if (this.data.events.length === 0) {
      app.toast('暂无可报名活动');
      return;
    }
    this.goAllEvents();
  }
});
