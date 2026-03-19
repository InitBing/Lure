/**
 * 黑坑列表页面
 */

const app = getApp();

Page({
  data: {
    pondList: [],
    page: 1,
    pageSize: 20,
    loading: false,
    hasMore: true,
    filters: {
      city: '',
      type: ''
    },
    isOwner: false
  },

  onLoad() {
    this.checkOwner();
    this.loadPonds();
  },

  onPullDownRefresh() {
    this.data.page = 1;
    this.data.pondList = [];
    this.data.hasMore = true;
    this.loadPonds().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadPonds();
    }
  },

  // 检查是否是塘主
  async checkOwner() {
    if (!app.isLogin()) return;

    try {
      const res = await app.request('/pond/owner/info');
      if (res.code === 0 && res.data.owner) {
        this.setData({ isOwner: true });
      }
    } catch (err) {
      // 不是塘主
    }
  },

  // 加载钓场列表
  async loadPonds() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { page, pageSize, filters } = this.data;
      const data = {
        page,
        page_size: pageSize,
        ...filters
      };

      const res = await app.request('/pond/ponds', { data });

      if (res.code === 0) {
        this.setData({
          pondList: [...this.data.pondList, ...res.data.list],
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

  // 选择城市
  selectCity() {
    wx.showActionSheet({
      itemList: ['全部', '深圳', '广州', '东莞', '惠州'],
      success: (res) => {
        const city = res.tapIndex === 0 ? '' : ['深圳', '广州', '东莞', '惠州'][res.tapIndex - 1];
        this.setData({ 'filters.city': city });
        this.data.page = 1;
        this.data.pondList = [];
        this.loadPonds();
      }
    });
  },

  // 选择类型
  selectType() {
    wx.showActionSheet({
      itemList: ['全部', '池塘', '水库', '湖泊'],
      success: (res) => {
        const typeMap = { 0: '', 1: 1, 2: 2, 3: 3 };
        const labelMap = { 0: '', 1: '池塘', 2: '水库', 3: '湖泊' };
        const type = typeMap[res.tapIndex];
        this.setData({ 'filters.type': type });
        this.data.page = 1;
        this.data.pondList = [];
        this.loadPonds();
      }
    });
  },

  // 跳转详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/pond-detail/pond-detail?id=${id}`
    });
  },

  // 跳转搜索
  goSearch() {
    wx.navigateTo({
      url: `/pages/search/search?type=pond`
    });
  },

  // 塘主入驻
  goApply() {
    wx.navigateTo({
      url: '/pages/apply-owner/apply-owner'
    });
  }
});
