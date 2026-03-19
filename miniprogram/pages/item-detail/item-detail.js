/**
 * 二手商品详情页面
 */

const app = getApp();

Page({
  data: {
    itemId: 0,
    item: {},
    isFavorited: false,
    isOwner: false,
    categoryMap: {
      1: '拟饵',
      2: '竿子',
      3: '轮子',
      4: '线组',
      5: '配件',
      6: '其他'
    },
    conditionMap: {
      1: '全新',
      2: '95 新',
      3: '9 新',
      4: '8 新',
      5: '7 新',
      6: '战斗成色'
    }
  },

  onLoad(options) {
    this.setData({ itemId: parseInt(options.id) });
    this.loadItemDetail();
  },

  // 加载商品详情
  async loadItemDetail() {
    try {
      const res = await app.request(`/items/${this.data.itemId}`);
      if (res.code === 0) {
        const item = res.data.item;
        const currentUserId = app.getCurrentUser()?.id;
        this.setData({
          item,
          isOwner: currentUserId === item.user_id
        });
      }
    } catch (err) {
      console.error('加载失败:', err);
      app.toast('加载失败');
    }
  },

  // 收藏
  async toggleFavorite() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }

    try {
      await app.request(`/items/${this.data.itemId}/favorite`, { method: 'POST' });
      this.setData({ isFavorited: !this.data.isFavorited });
      app.toast(this.data.isFavorited ? '已收藏' : '已取消收藏');
    } catch (err) {
      console.error('收藏失败:', err);
    }
  },

  // 联系卖家
  goChat() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }
    wx.navigateTo({
      url: `/pages/message/message?user_id=${this.data.item.user_id}`
    });
  },

  // 标记已售
  markSold() {
    wx.showModal({
      title: '确认售出',
      content: '确认该商品已售出？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request(`/items/${this.data.itemId}/sold`, { method: 'PUT' });
            app.toast('已标记为售出');
            this.loadItemDetail();
          } catch (err) {
            app.toast('操作失败');
          }
        }
      }
    });
  },

  // 购买
  goBuy() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }
    this.goChat();
  },

  // 跳转卖家主页
  goSeller() {
    wx.navigateTo({
      url: `/pages/profile/profile?user_id=${this.data.item.user_id}`
    });
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.item.photos[index],
      urls: this.data.item.photos
    });
  }
});
