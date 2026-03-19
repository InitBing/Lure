/**
 * 首页
 */

const app = getApp();

Page({
  data: {
    currentTab: 1, // 0-关注 1-推荐 2-资讯 3-视频
    banners: [
      { id: 1, image: '/images/banner1.png', url: '' },
      { id: 2, image: '/images/banner2.png', url: '' }
    ],
    feedList: [],
    page: 1,
    pageSize: 10,
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadFeed();
  },

  onShow() {
    // 刷新数据
  },

  onPullDownRefresh() {
    this.data.page = 1;
    this.data.feedList = [];
    this.data.hasMore = true;
    this.loadFeed().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadFeed();
    }
  },

  // 切换 Tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: index });
    
    // 刷新对应 Tab 的数据
    if (index === 0 || index === 1) {
      this.data.page = 1;
      this.data.feedList = [];
      this.data.hasMore = true;
      this.loadFeed();
    } else if (index === 2) {
      // 加载资讯
      this.loadArticles();
    } else if (index === 3) {
      // 加载视频
      this.loadVideos();
    }
  },

  // 加载动态流
  async loadFeed() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const { page, pageSize, currentTab } = this.data;
      
      // 模拟请求
      const res = await app.request('/logs', {
        data: {
          page,
          page_size: pageSize,
          is_public: 1
        }
      });
      
      if (res.code === 0) {
        const newList = currentTab === 0 || currentTab === 1 
          ? [...this.data.feedList, ...res.data.list]
          : res.data.list;
        
        this.setData({
          feedList: newList,
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

  // 加载资讯
  async loadArticles() {
    try {
      const res = await app.request('/articles', {
        data: { page: 1, page_size: 10 }
      });
      
      if (res.code === 0) {
        this.setData({ feedList: res.data.list });
      }
    } catch (err) {
      console.error('加载资讯失败:', err);
    }
  },

  // 加载视频
  async loadVideos() {
    try {
      const res = await app.request('/videos', {
        data: { page: 1, page_size: 10, sort: 'hot' }
      });
      
      if (res.code === 0) {
        this.setData({ feedList: res.data.list });
      }
    } catch (err) {
      console.error('加载视频失败:', err);
    }
  },

  // 点赞
  async like(e) {
    const id = e.currentTarget.dataset.id;
    const index = this.data.feedList.findIndex(item => item.id === id);
    
    if (index === -1) return;
    
    const item = this.data.feedList[index];
    const isLiked = !item.is_liked;
    
    try {
      await app.request(`/logs/${id}/like`, { method: 'POST' });
      
      this.setData({
        [`feedList[${index}].is_liked`]: isLiked,
        [`feedList[${index}].like_count`]: item.like_count + (isLiked ? 1 : -1)
      });
      
      app.toast(isLiked ? '已点赞' : '已取消');
    } catch (err) {
      console.error('点赞失败:', err);
    }
  },

  // 收藏
  async favorite(e) {
    const id = e.currentTarget.dataset.id;
    const index = this.data.feedList.findIndex(item => item.id === id);
    
    if (index === -1) return;
    
    const item = this.data.feedList[index];
    const isFavorited = !item.is_favorited;
    
    try {
      await app.request(`/logs/${id}/favorite`, { method: 'POST' });
      
      this.setData({
        [`feedList[${index}].is_favorited`]: isFavorited,
        [`feedList[${index}].favorite_count`]: item.favorite_count + (isFavorited ? 1 : -1)
      });
      
      app.toast(isFavorited ? '已收藏' : '已取消');
    } catch (err) {
      console.error('收藏失败:', err);
    }
  },

  // 跳转搜索
  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  // 跳转 Banner
  goBanner(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      // 打开 H5 或小程序页面
    }
  },

  // 跳转钓点详情
  goLogDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/log-detail/log-detail?id=${id}` });
  },

  // 快捷入口
  goWeather() {
    app.toast('天气功能开发中');
  },

  goTide() {
    app.toast('潮汐功能开发中');
  },

  goBeginner() {
    app.toast('新手入门开发中');
  },

  goMap() {
    wx.switchTab({ url: '/pages/spots/spots' });
  }
});
