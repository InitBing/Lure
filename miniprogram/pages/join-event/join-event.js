/**
 * 报名缴费页面
 */

const app = getApp();

Page({
  data: {
    eventId: 0,
    participantId: 0,
    event: {},
    participant: {},
    rodOptions: ['1 根', '2 根', '3 根', '4 根', '5 根'],
    rodIndex: 0,
    remarks: '',
    paymentMethod: 1, // 1-微信 2-支付宝
    paying: false,
    totalAmount: '0.00'
  },

  onLoad(options) {
    this.setData({
      eventId: parseInt(options.id),
      participantId: parseInt(options.participant_id)
    });
    this.loadEventDetail();
  },

  // 加载活动详情
  async loadEventDetail() {
    try {
      const res = await app.request(`/pond/events/${this.data.eventId}`);
      if (res.code === 0) {
        const event = res.data.event;
        const total = parseFloat(event.fee_amount) + parseFloat(event.deposit_amount || 0);
        this.setData({
          event,
          participant: {
            fee_amount: event.fee_amount,
            deposit_amount: event.deposit_amount || 0
          },
          totalAmount: total.toFixed(2)
        });
      }
    } catch (err) {
      console.error('加载失败:', err);
      app.toast('加载失败');
    }
  },

  // 选择竿数
  onRodChange(e) {
    this.setData({ rodIndex: parseInt(e.detail.value) });
  },

  // 输入备注
  onRemarksInput(e) {
    this.setData({ remarks: e.detail.value });
  },

  // 选择支付方式
  selectPayment(e) {
    this.setData({ paymentMethod: parseInt(e.currentTarget.dataset.method) });
  },

  // 确认支付
  async confirmPay() {
    if (this.data.paying) return;

    this.setData({ paying: true });

    try {
      // 调用支付接口
      const res = await app.request(`/pond/participants/${this.data.participantId}/pay`, {
        method: 'POST',
        data: {
          payment_method: this.data.paymentMethod
        }
      });

      if (res.code === 0) {
        // 模拟支付成功 (实际应调起微信支付)
        wx.showModal({
          title: '支付成功',
          content: '报名成功！请按时参加活动。',
          showCancel: false,
          success: () => {
            wx.navigateBack();
          }
        });
      } else {
        app.toast(res.message || '支付失败');
      }
    } catch (err) {
      console.error('支付失败:', err);
      app.toast('支付失败');
    } finally {
      this.setData({ paying: false });
    }
  }
});
