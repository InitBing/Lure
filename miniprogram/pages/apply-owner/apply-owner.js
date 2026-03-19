/**
 * 塘主入驻申请页面
 */

const app = getApp();

Page({
  data: {
    form: {
      business_name: '',
      contact_name: '',
      contact_phone: '',
      contact_wechat: '',
      business_license: '',
      total_area: ''
    },
    location: {
      province: '',
      city: '',
      district: '',
      address: '',
      latitude: 0,
      longitude: 0
    },
    waterTypes: ['池塘', '水库', '湖泊'],
    waterTypeIndex: 0,
    submitting: false
  },

  onLoad() {
    // 获取用户信息预填充
    const userInfo = app.getCurrentUser();
    if (userInfo) {
      this.setData({
        'form.contact_name': userInfo.nickname
      });
    }
  },

  // 选择水域类型
  onWaterTypeChange(e) {
    this.setData({ waterTypeIndex: parseInt(e.detail.value) });
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: {
            province: res.address.province,
            city: res.address.city,
            district: res.address.district,
            address: res.address + res.name,
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
      }
    });
  },

  // 上传营业执照
  uploadLicense() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ 'form.business_license': tempFilePath });
        // TODO: 上传到服务器
      }
    });
  },

  // 提交申请
  async onSubmit(e) {
    const form = e.detail.value;

    // 验证必填项
    if (!form.business_name.trim()) {
      app.toast('请输入钓场名称');
      return;
    }
    if (!form.contact_name.trim()) {
      app.toast('请输入联系人姓名');
      return;
    }
    if (!form.contact_phone.trim()) {
      app.toast('请输入联系电话');
      return;
    }

    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(form.contact_phone)) {
      app.toast('请输入正确的手机号');
      return;
    }

    this.setData({ submitting: true });

    try {
      const data = {
        ...form,
        water_type: this.data.waterTypeIndex + 1,
        ...this.data.location
      };

      const res = await app.request('/pond/owner/apply', {
        method: 'POST',
        data
      });

      if (res.code === 0) {
        wx.showModal({
          title: '申请提交成功',
          content: '我们将在 1-3 个工作日内完成审核，请耐心等待。',
          showCancel: false,
          success: () => {
            wx.navigateBack();
          }
        });
      } else {
        app.toast(res.message || '申请失败');
      }
    } catch (err) {
      console.error('申请失败:', err);
      app.toast('申请失败，请重试');
    } finally {
      this.setData({ submitting: false });
    }
  }
});
