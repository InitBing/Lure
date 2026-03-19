/**
 * 作钓记录详情页面
 */

const app = getApp();

Page({
  data: {
    logId: 0,
    log: {},
    catches: [],
    commentList: [],
    isLiked: false,
    isFavorited: false,
    isFollowing: false,
    commentText: '',
    weatherMap: {
      1: '☀️',
      2: '⛅',
      3: '☁️',
      4: '🌧️',
      5: '⛈️',
      6: '⚡'
    }
  },

  onLoad(options) {
    this.setData({ logId: parseInt(options.id) });
    this.loadLogDetail();
    this.loadComments();
  },

  // 加载记录详情
  async loadLogDetail() {
    try {
      const res = await app.request(`/logs/${this.data.logId}`);
      if (res.code === 0) {
        const log = res.data.log;
        // 解析渔获明细
        const catches = log.catches || [];
        this.setData({ log, catches });
      }
    } catch (err) {
      console.error('加载失败:', err);
      app.toast('加载失败');
    }
  },

  // 加载评论
  async loadComments() {
    try {
      const res = await app.request('/comments', {
        data: {
          target_type: 1,
          target_id: this.data.logId,
          page: 1,
          page_size: 20
        }
      });
      if (res.code === 0) {
        this.setData({ commentList: res.data.list || [] });
      }
    } catch (err) {
      console.error('加载评论失败:', err);
    }
  },

  // 输入评论
  onInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  // 发送评论
  async sendComment() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }

    if (!this.data.commentText.trim()) {
      app.toast('请输入评论内容');
      return;
    }

    try {
      await app.request('/comments', {
        method: 'POST',
        data: {
          target_type: 1,
          target_id: this.data.logId,
          content: this.data.commentText
        }
      });

      this.setData({ commentText: '' });
      this.loadComments();
      // 增加评论计数
      this.setData({ 'log.comment_count': (this.data.log.comment_count || 0) + 1 });
      app.toast('评论成功');
    } catch (err) {
      console.error('评论失败:', err);
      app.toast('评论失败');
    }
  },

  // 点赞
  async toggleLike() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }

    try {
      await app.request(`/logs/${this.data.logId}/like`, { method: 'POST' });
      const newLiked = !this.data.isLiked;
      this.setData({
        isLiked: newLiked,
        'log.like_count': (this.data.log.like_count || 0) + (newLiked ? 1 : -1)
      });
    } catch (err) {
      console.error('点赞失败:', err);
    }
  },

  // 收藏
  async toggleFavorite() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }

    try {
      await app.request(`/logs/${this.data.logId}/favorite`, { method: 'POST' });
      this.setData({ isFavorited: !this.data.isFavorited });
      app.toast(this.data.isFavorited ? '已收藏' : '已取消收藏');
    } catch (err) {
      console.error('收藏失败:', err);
    }
  },

  // 关注/取消关注
  async toggleFollow() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }

    try {
      const userId = this.data.log.user.id;
      await app.request(`/user/${userId}/follow`, { method: this.data.isFollowing ? 'DELETE' : 'POST' });
      this.setData({ isFollowing: !this.data.isFollowing });
    } catch (err) {
      console.error('关注失败:', err);
    }
  },

  // 点赞评论
  async likeComment(e) {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }

    const commentId = e.currentTarget.dataset.id;
    try {
      await app.request(`/comments/${commentId}/like`, { method: 'POST' });
      this.loadComments();
    } catch (err) {
      console.error('点赞评论失败:', err);
    }
  },

  // 跳转钓点详情
  goSpot() {
    if (this.data.log.spot_id) {
      wx.navigateTo({
        url: `/pages/spot-detail/spot-detail?id=${this.data.log.spot_id}`
      });
    }
  },

  // 查看评论
  goComments() {
    // 滚动到评论区
    wx.pageScrollTo({
      scrollTop: 1000,
      duration: 300
    });
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.log.photos[index],
      urls: this.data.log.photos
    });
  },

  // 分享
  share() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    return {
      title: this.data.log.notes?.substring(0, 30) || '精彩作钓记录',
      path: `/pages/log-detail/log-detail?id=${this.data.logId}`
    };
  },

  onShareTimeline() {
    return {
      title: this.data.log.notes?.substring(0, 30) || '精彩作钓记录',
      query: `id=${this.data.logId}`
    };
  }
});
