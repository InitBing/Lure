/**
 * 活动列表页面
 */

const app = getApp();

Page({
  data: {
    eventList: [],
    page: 1,
    pageSize: 20,
    loading: false,
    hasMore: true,
    filters: {
      type: '',
      status: undefined,
      date: ''
    },
    pondId: 0,
    eventTypeMap: {
      1: '正钓',
      2: '偷驴',
      3: '比赛',
      4: '其他'
    }
  },

  onLoad(options) {
    if (options.pond_id) {
      this.setData({ pondId: parseInt(options.pond_id) });
    }
    this.loadEvents();
  },

  // 加载活动列表
  async loadEvents() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { page, pageSize, filters, pondId } = this.data;
      const data = {
        page,
        page_size: pageSize,
        ...filters
      };

      if (pondId) {
        data.pond_id = pondId;
      }

      const res = await app.request('/pond/events', { data });

      if (res.code === 0) {
        this.setData({
          eventList: [...this.data.eventList, ...res.data.list],
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

  // 加载更多
  loadMore() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadEvents();
    }
  },

  // 选择类型
  selectType() {
    wx.showActionSheet({
      itemList: ['全部', '正钓', '偷驴', '比赛', '其他'],
      success: (res) => {
        const typeMap = { 0: '', 1: 1, 2: 2, 3: 3, 4: 4 };
        const labelMap = { 0: '', 1: '正钓', 2: '偷驴', 3: '比赛', 4: '其他' };
        const type = typeMap[res.tapIndex];
        this.setData({
          'filters.type': type,
          'filters.typeLabel': labelMap[res.tapIndex]
        });
        this.resetAndLoad();
      }
    });
  },

  // 选择状态
  selectStatus() {
    wx.showActionSheet({
      itemList: ['全部', '报名中', '已结束'],
      success: (res) => {
        const statusMap = { 0: undefined, 1: 0, 2: 3 };
        this.setData({ 'filters.status': statusMap[res.tapIndex] });
        this.resetAndLoad();
      }
    });
  },

  // 选择日期
  selectDate() {
    const now = new Date();
    wx.showDatePicker({
      title: '选择日期',
      start: now.toISOString().split('T')[0],
      success: (res) => {
        this.setData({ 'filters.date': res.date });
        this.resetAndLoad();
      }
    });
  },

  // 重置并加载
  resetAndLoad() {
    this.data.page = 1;
    this.data.eventList = [];
    this.data.hasMore = true;
    this.loadEvents();
  },

  // 跳转详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/event-detail/event-detail?id=${id}`
    });
  }
});
