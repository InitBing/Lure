/**
 * 二手市场页面
 */

const app = getApp();

Page({
  data: {
    currentCate: 0,
    itemList: [],
    page: 1,
    pageSize: 20,
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadItems();
  },

  onPullDownRefresh() {
    this.data.page = 1;
    this.data.itemList = [];
    this.data.hasMore = true;
    this.loadItems().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadItems();
    }
  },

  // 加载商品列表
  async loadItems() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { page, pageSize, currentCate } = this.data;
      const data = {
        page,
        page_size: pageSize,
        category: currentCate > 0 ? currentCate : undefined
      };

      const res = await app.request('/items', { data });

      if (res.code === 0) {
        // 处理成色文本
        const conditionMap = {
          1: '全新',
          2: '95 新',
          3: '9 新',
          4: '8 新',
          5: '7 新',
          6: '战斗成色'
        };

        const list = res.data.list.map(item => ({
          ...item,
          condition_text: conditionMap[item.condition] || '未知'
        }));

        this.setData({
          itemList: [...this.data.itemList, ...list],
          page: page + 1,
          hasMore: res.data.list.length >= pageSize
        });
      }
    } catch (err) {
      console.error('加载失败:', err);
      app.toast('加载失败');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 切换分类
  switchCate(e) {
    const cate = parseInt(e.currentTarget.dataset.cate);
    if (cate === this.data.currentCate) return;

    this.setData({ currentCate: cate });
    this.data.page = 1;
    this.data.itemList = [];
    this.data.hasMore = true;
    this.loadItems();
  },

  // 跳转详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/item-detail/item-detail?id=${id}`
    });
  },

  // 跳转搜索
  goSearch() {
    wx.navigateTo({
      url: '/pages/search/search?type=item'
    });
  },

  // 发布商品
  goPublish() {
    wx.navigateTo({
      url: '/pages/publish-item/publish-item'
    });
  }
});
