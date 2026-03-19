/**
 * 搜索页面
 */

const app = getApp();

Page({
  data: {
    keyword: '',
    focus: false,
    hasSearched: false,
    currentTab: 'all',
    history: [],
    hotKeywords: ['路亚', '鲈鱼', '水库', '拟饵', '钓点'],
    results: {
      spots: [],
      logs: [],
      items: [],
      users: [],
      videos: []
    },
    page: 1,
    loading: false
  },

  onLoad(options) {
    // 加载搜索历史
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ history: history.slice(0, 10) });

    // 从其他页面跳转带搜索词
    if (options.keyword) {
      this.setData({ keyword: options.keyword });
      this.onSearch();
    }
  },

  // 输入
  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  // 搜索
  onSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;

    // 保存历史
    this.saveHistory(keyword);

    this.setData({
      hasSearched: true,
      page: 1,
      results: { spots: [], logs: [], items: [], users: [], videos: [] }
    });

    this.search();
  },

  // 执行搜索
  async search() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await app.request('/search', {
        data: {
          keyword: this.data.keyword,
          type: this.data.currentTab,
          page: this.data.page
        }
      });

      if (res.code === 0) {
        this.setData({ results: res.data });
      }
    } catch (err) {
      console.error('搜索失败:', err);
      app.toast('搜索失败');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载更多
  loadMore() {
    if (!this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.search();
    }
  },

  // 切换 Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      page: 1
    });
    this.search();
  },

  // 保存历史
  saveHistory(keyword) {
    let history = this.data.history;
    // 移除重复
    history = history.filter(k => k !== keyword);
    // 添加到开头
    history.unshift(keyword);
    // 限制数量
    history = history.slice(0, 10);
    this.setData({ history });
    wx.setStorageSync('searchHistory', history);
  },

  // 清除历史
  clearHistory() {
    wx.showModal({
      title: '清除历史',
      content: '确定清除搜索历史？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ history: [] });
          wx.removeStorageSync('searchHistory');
        }
      }
    });
  },

  // 清空搜索
  clear() {
    this.setData({
      keyword: '',
      hasSearched: false,
      results: {}
    });
  },

  // 点击历史
  onHistoryClick(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword });
    this.onSearch();
  },

  // 点击热门
  onHotClick(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword });
    this.onSearch();
  },

  // 跳转钓点详情
  goSpot(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/spot-detail/spot-detail?id=${id}`
    });
  },

  // 跳转记录详情
  goLog(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/log-detail/log-detail?id=${id}`
    });
  },

  // 跳转商品详情
  goItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/item-detail/item-detail?id=${id}`
    });
  },

  // 跳转用户主页
  goUser(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/profile/profile?user_id=${id}`
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
