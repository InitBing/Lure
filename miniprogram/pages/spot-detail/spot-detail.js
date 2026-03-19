/**
 * 钓点详情页面
 */

const app = getApp();

Page({
  data: {
    spotId: 0,
    spot: {},
    logList: [],
    isFavorited: false,
    waterTypeMap: {
      1: '水库',
      2: '河流',
      3: '湖泊',
      4: '溪流',
      5: '海钓',
      6: '池塘'
    }
  },

  onLoad(options) {
    this.setData({ spotId: parseInt(options.id) });
    this.loadSpotDetail();
    this.loadLogs();
  },

  // 加载钓点详情
  async loadSpotDetail() {
    try {
      const res = await app.request(`/spots/${this.data.spotId}`);
      if (res.code === 0) {
        this.setData({ spot: res.data.spot });
        // 检查是否已收藏
        this.checkFavorite();
      }
    } catch (err) {
      console.error('加载详情失败:', err);
      app.toast('加载失败');
    }
  },

  // 加载作钓记录
  async loadLogs() {
    try {
      const res = await app.request('/logs', {
        data: {
          spot_id: this.data.spotId,
          page: 1,
          page_size: 10
        }
      });
      if (res.code === 0) {
        this.setData({ logList: res.data.list || [] });
      }
    } catch (err) {
      console.error('加载记录失败:', err);
    }
  },

  // 检查收藏状态
  async checkFavorite() {
    // TODO: 实现收藏状态查询
    this.setData({ isFavorited: false });
  },

  // 收藏/取消收藏
  async toggleFavorite() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }

    try {
      await app.request(`/spots/${this.data.spotId}/favorite`, { method: 'POST' });
      this.setData({ isFavorited: !this.data.isFavorited });
      app.toast(this.data.isFavorited ? '已收藏' : '已取消收藏');
    } catch (err) {
      console.error('收藏失败:', err);
    }
  },

  // 跳转导航
  goNavigation() {
    const { latitude, longitude, name } = this.data.spot;
    wx.openLocation({
      latitude,
      longitude,
      name,
      scale: 16
    });
  },

  // 跳转作钓记录列表
  goLogs() {
    wx.navigateTo({
      url: `/pages/log-detail/log-detail?spot_id=${this.data.spotId}`
    });
  },

  // 跳转作钓记录详情
  goLogDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/log-detail/log-detail?id=${id}`
    });
  },

  // 发布作钓记录
  goPublish() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }
    wx.navigateTo({
      url: `/pages/publish-log/publish-log?spot_id=${this.data.spotId}&spot_name=${this.data.spot.name}`
    });
  }
});
