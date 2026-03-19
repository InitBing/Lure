/**
 * 发布商品页面
 */

const app = getApp();

Page({
  data: {
    category: 1,
    categories: [
      { value: 1, label: '拟饵', icon: '🎣' },
      { value: 2, label: '竿子', icon: '🎏' },
      { value: 3, label: '轮子', icon: '⚙️' },
      { value: 4, label: '线组', icon: '🧵' },
      { value: 5, label: '配件', icon: '🔧' },
      { value: 6, label: '其他', icon: '📦' }
    ],
    title: '',
    brand: '',
    model: '',
    description: '',
    conditionIndex: 1,
    conditions: ['全新', '95 新', '9 新', '8 新', '7 新', '战斗成色'],
    price: '',
    originalPrice: '',
    shippingIndex: 0,
    shippingOptions: ['包邮', '不包邮', '面议'],
    photos: [],
    location: '',
    submitting: false
  },

  onLoad() {
    // 获取用户位置
    this.getLocation();
  },

  // 获取位置
  async getLocation() {
    try {
      const res = await wx.getLocation({ type: 'gcj02' });
      // 这里应该调用逆地理编码 API
      this.setData({ location: '广东省深圳市' });
    } catch (err) {
      console.error('获取位置失败:', err);
      this.setData({ location: '请选择地区' });
    }
  },

  // 选择分类
  selectCategory(e) {
    this.setData({ category: parseInt(e.currentTarget.dataset.value) });
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  // 品牌输入
  onBrandInput(e) {
    this.setData({ brand: e.detail.value });
  },

  // 型号输入
  onModelInput(e) {
    this.setData({ model: e.detail.value });
  },

  // 描述输入
  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 成色选择
  onConditionChange(e) {
    this.setData({ conditionIndex: parseInt(e.detail.value) });
  },

  // 价格输入
  onPriceInput(e) {
    this.setData({ price: e.detail.value });
  },

  // 原价输入
  onOriginalPriceInput(e) {
    this.setData({ originalPrice: e.detail.value });
  },

  // 物流选择
  onShippingChange(e) {
    this.setData({ shippingIndex: parseInt(e.detail.value) });
  },

  // 选择地区
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: res.address + res.name
        });
      }
    });
  },

  // 上传照片
  uploadPhoto() {
    wx.chooseMedia({
      count: 9 - this.data.photos.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(f => f.tempFilePath);
        this.setData({
          photos: [...this.data.photos, ...tempFiles]
        });
        // TODO: 上传到服务器
      }
    });
  },

  // 删除照片
  removePhoto(e) {
    const index = e.currentTarget.dataset.index;
    const photos = this.data.photos.filter((_, i) => i !== index);
    this.setData({ photos });
  },

  // 提交
  async onSubmit() {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }

    // 验证必填项
    if (!this.data.title.trim()) {
      app.toast('请输入商品标题');
      return;
    }

    if (!this.data.price) {
      app.toast('请输入售价');
      return;
    }

    if (this.data.photos.length === 0) {
      app.toast('请至少上传一张照片');
      return;
    }

    this.setData({ submitting: true });

    try {
      const data = {
        category: this.data.category,
        brand: this.data.brand,
        model: this.data.model,
        title: this.data.title,
        description: this.data.description,
        condition: this.data.conditionIndex + 1,
        price: parseFloat(this.data.price),
        original_price: this.data.originalPrice ? parseFloat(this.data.originalPrice) : null,
        shipping: this.data.shippingIndex + 1,
        photos: this.data.photos, // TODO: 替换为上传后的 URL
        province: this.data.location.split('省')[0] || '',
        city: this.data.location.split('省')[1]?.split('市')[0] || ''
      };

      const res = await app.request('/items', {
        method: 'POST',
        data
      });

      if (res.code === 0) {
        app.toast('发布成功');
        wx.navigateBack();
      } else {
        app.toast(res.message || '发布失败');
      }
    } catch (err) {
      console.error('发布失败:', err);
      app.toast('发布失败，请重试');
    } finally {
      this.setData({ submitting: false });
    }
  }
});
