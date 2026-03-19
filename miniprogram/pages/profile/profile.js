/**
 * 个人主页
 */

const app = getApp();

Page({
  data: {
    userId: 0,
    userInfo: {},
    stats: {},
    isMe: false,
    isFollowing: false,
    currentTab: 'logs',
    contentList: [],
    page: 1,
    loading: false,
    hasMore: true
  },

  onLoad(options) {
    const currentUserId = app.getCurrentUser()?.id;
    const userId = parseInt(options.user_id) || currentUserId;

    this.setData({
      userId,
      isMe: userId === currentUserId
    });

    this.loadUserInfo();
    this.loadContent();
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      if (this.data.isMe) {
        const userInfo = app.getCurrentUser();
        this.setData({ userInfo });
      } else {
        const res = await app.request(`/users/${this.data.userId}`);
        if (res.code === 0) {
          this.setData({ userInfo: res.data.user });
        }
      }
      this.loadStats();
    } catch (err) {
      console.error('加载用户信息失败:', err);
    }
  },

  // 加载统计
  async loadStats() {
    try {
      const res = await app.request('/user/stats', {
        data: { user_id: this.data.userId }
      });
      if (res.code === 0) {
        this.setData({ stats: res.data });
      }
    } catch (err) {
      console.error('加载统计失败:', err);
    }
  },

  // 加载内容
  async loadContent() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    try {
      const { currentTab, page, userId } = this.data;
      const endpoint = currentTab === 'logs' ? '/logs' : '/items';
      const data = {
        user_id: userId,
        page,
        page_size: 10
      };

      const res = await app.request(endpoint, { data });

      if (res.code === 0) {
        const newList = [...this.data.contentList, ...res.data.list];
        this.setData({
          contentList: newList,
          page: page + 1,
          hasMore: res.data.list.length >= 10
        });
      }
    } catch (err) {
      console.error('加载内容失败:', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载更多
  loadMore() {
    this.loadContent();
  },

  // 切换 Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      page: 1,
      contentList: [],
      hasMore: true
    });
    this.loadContent();
  },

  // 关注/取消关注
  async toggleFollow() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }

    try {
      await app.request(`/user/${this.data.userId}/follow`, {
        method: this.data.isFollowing ? 'DELETE' : 'POST'
      });
      this.setData({ isFollowing: !this.data.isFollowing });
      // 更新粉丝数
      const delta = this.data.isFollowing ? 1 : -1;
      this.setData({ 'stats.follower_count': (this.data.stats.follower_count || 0) + delta });
    } catch (err) {
      console.error('关注失败:', err);
    }
  },

  // 跳转记录详情
  goLogDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/log-detail/log-detail?id=${id}`
    });
  },

  // 跳转商品详情
  goItemDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/item-detail/item-detail?id=${id}`
    });
  }
});
