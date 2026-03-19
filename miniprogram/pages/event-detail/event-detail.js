/**
 * 活动详情页
 */

const app = getApp();

Page({
  data: {
    eventId: 0,
    event: {},
    eventTypeMap: {
      1: '正钓',
      2: '偷驴',
      3: '比赛',
      4: '其他'
    },
    fishWeightRuleMap: {
      1: '总重量',
      2: '单尾最重',
      3: '尾数'
    }
  },

  onLoad(options) {
    this.setData({ eventId: parseInt(options.id) });
    this.loadEventDetail();
  },

  // 加载活动详情
  async loadEventDetail() {
    try {
      const res = await app.request(`/pond/events/${this.data.eventId}`);
      if (res.code === 0) {
        this.setData({ event: res.data.event });
      }
    } catch (err) {
      console.error('加载失败:', err);
      app.toast('加载失败');
    }
  },

  // 跳转钓场详情
  goPond() {
    const pondId = this.data.event.pond.id;
    wx.navigateTo({
      url: `/pages/pond-detail/pond-detail?id=${pondId}`
    });
  },

  // 联系塘主
  contactOwner() {
    // TODO: 实现联系功能
    app.toast('咨询功能开发中');
  },

  // 报名活动
  async joinEvent() {
    if (!app.isLogin()) {
      app.showLoginModal();
      return;
    }

    wx.showModal({
      title: '确认报名',
      content: `报名费用：¥${this.data.event.fee_amount}\n\n确定要报名吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await app.request(`/pond/events/${this.data.eventId}/join`, {
              method: 'POST',
              data: {
                rod_count: 1,
                remarks: ''
              }
            });

            if (result.code === 0) {
              app.toast('报名成功，请支付');
              // 跳转支付页面
              wx.navigateTo({
                url: `/pages/join-event/join-event?id=${this.data.eventId}&participant_id=${result.data.participant.id}`
              });
            } else {
              app.toast(result.message || '报名失败');
            }
          } catch (err) {
            console.error('报名失败:', err);
            app.toast('报名失败');
          }
        }
      }
    });
  }
});
