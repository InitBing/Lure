/**
 * 我的报名页面
 */

const app = getApp();

Page({
  data: {
    participantList: [],
    page: 1,
    pageSize: 20,
    loading: false,
    hasMore: true,
    currentTab: 0,
    eventTypeMap: {
      1: '正钓',
      2: '偷驴',
      3: '比赛',
      4: '其他'
    }
  },

  onLoad() {
    this.loadParticipants();
  },

  onPullDownRefresh() {
    this.data.page = 1;
    this.data.participantList = [];
    this.data.hasMore = true;
    this.loadParticipants().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载报名列表
  async loadParticipants() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { page, pageSize, currentTab } = this.data;
      const data = {
        page,
        page_size: pageSize
      };

      // 按状态筛选
      if (currentTab === 1) {
        data.payment_status = 0; // 未支付
      } else if (currentTab === 2) {
        data.status = 2; // 已完成
      }

      const res = await app.request('/pond/participants', { data });

      if (res.code === 0) {
        this.setData({
          participantList: [...this.data.participantList, ...res.data.list],
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
      this.loadParticipants();
    }
  },

  // 切换 Tab
  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    if (tab === this.data.currentTab) return;

    this.setData({
      currentTab: tab,
      page: 1,
      participantList: [],
      hasMore: true
    });
    this.loadParticipants();
  },

  // 获取状态文本
  getStatusText(status, paymentStatus) {
    if (paymentStatus === 0) return '待支付';
    if (status === 0) return '已报名';
    if (status === 1) return '已取消';
    if (status === 2) return '已完成';
    return '未知';
  },

  // 获取状态样式
  getStatusClass(status, paymentStatus) {
    if (paymentStatus === 0) return 'warning';
    if (status === 0) return 'active';
    if (status === 1) return 'cancelled';
    if (status === 2) return 'success';
    return '';
  },

  // 跳转活动详情
  goEvent(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/event-detail/event-detail?id=${id}`
    });
  },

  // 去支付
  goPay(e) {
    const participantId = e.currentTarget.dataset.id;
    const participant = this.data.participantList.find(p => p.id === participantId);
    if (participant) {
      wx.navigateTo({
        url: `/pages/join-event/join-event?id=${participant.event_id}&participant_id=${participantId}`
      });
    }
  },

  // 显示签到
  showCheckin(e) {
    const participantId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '现场签到',
      content: '请向塘主出示此页面进行签到',
      confirmText: '我已到场',
      success: (res) => {
        if (res.confirm) {
          this.doCheckin(participantId);
        }
      }
    });
  },

  // 执行签到
  async doCheckin(participantId) {
    try {
      const res = await app.request(`/pond/participants/${participantId}/checkin`, {
        method: 'POST'
      });

      if (res.code === 0) {
        app.toast('签到成功');
        this.loadParticipants();
      } else {
        app.toast(res.message || '签到失败');
      }
    } catch (err) {
      console.error('签到失败:', err);
      app.toast('签到失败');
    }
  },

  // 去评价
  goReview(e) {
    const participantId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/review-event/review-event?participant_id=${participantId}`
    });
  }
});
