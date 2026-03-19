/**
 * 视频页面
 */

const app = getApp();

Page({
  data: {
    videoList: [],
    page: 1,
    pageSize: 10,
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadVideos();
  },

  onPullDownRefresh() {
    this.data.page = 1;
    this.data.videoList = [];
    this.data.hasMore = true;
    this.loadVideos().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载视频列表
  async loadVideos() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { page, pageSize } = this.data;
      const res = await app.request('/videos', {
        data: {
          page,
          page_size: pageSize,
          sort: 'newest'
        }
      });

      if (res.code === 0) {
        this.setData({
          videoList: [...this.data.videoList, ...res.data.list],
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
      this.loadVideos();
    }
  },

  // 格式化时长
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  // 播放视频
  playVideo(e) {
    const video = e.currentTarget.dataset.video;
    wx.navigateTo({
      url: `/pages/video-detail/video-detail?id=${video.id}`
    });
  }
});
