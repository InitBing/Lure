/**
 * 发布作钓记录页面
 */

const app = getApp();

Page({
  data: {
    spotId: 0,
    spotName: '',
    logDate: '',
    weatherIndex: 0,
    weatherOptions: [
      { label: '☀️ 晴', value: 1 },
      { label: '⛅ 多云', value: 2 },
      { label: '☁️ 阴', value: 3 },
      { label: '🌧️ 小雨', value: 4 },
      { label: '⛈️ 大雨', value: 5 },
      { label: '⚡ 雷阵雨', value: 6 }
    ],
    temperature: '',
    waterTemp: '',
    wind: '',
    catches: [],
    rod: '',
    reel: '',
    lures: [],
    notes: '',
    photos: [],
    isPublic: true,
    submitting: false
  },

  onLoad(options) {
    if (options.spot_id) {
      this.setData({
        spotId: parseInt(options.spot_id),
        spotName: options.spot_name || ''
      });
    }
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    this.setData({ logDate: today });
  },

  // 选择钓点
  chooseSpot() {
    wx.navigateTo({
      url: '/pages/spots/spots?select=true'
    });
  },

  // 选择日期
  chooseDate() {
    const now = new Date();
    wx.showDatePicker({
      title: '选择日期',
      start: '2020-01-01',
      end: now.toISOString().split('T')[0],
      selected: this.data.logDate,
      success: (res) => {
        this.setData({ logDate: res.date });
      }
    });
  },

  // 天气选择
  onWeatherChange(e) {
    this.setData({ weatherIndex: parseInt(e.detail.value) });
  },

  // 气温输入
  onTempInput(e) {
    this.setData({ temperature: e.detail.value });
  },

  // 水温输入
  onWaterTempInput(e) {
    this.setData({ waterTemp: e.detail.value });
  },

  // 风力输入
  onWindInput(e) {
    this.setData({ wind: e.detail.value });
  },

  // 添加渔获
  addCatch() {
    const catches = [...this.data.catches, { fish_type: '', length: '', weight: '' }];
    this.setData({ catches });
  },

  // 删除渔获
  removeCatch(e) {
    const index = e.currentTarget.dataset.index;
    const catches = this.data.catches.filter((_, i) => i !== index);
    this.setData({ catches });
  },

  // 渔获鱼种输入
  onCatchFishType(e) {
    const index = e.currentTarget.dataset.index;
    const catches = [...this.data.catches];
    catches[index].fish_type = e.detail.value;
    this.setData({ catches });
  },

  // 渔获长度输入
  onCatchLength(e) {
    const index = e.currentTarget.dataset.index;
    const catches = [...this.data.catches];
    catches[index].length = e.detail.value;
    this.setData({ catches });
  },

  // 渔获重量输入
  onCatchWeight(e) {
    const index = e.currentTarget.dataset.index;
    const catches = [...this.data.catches];
    catches[index].weight = e.detail.value;
    this.setData({ catches });
  },

  // 竿子输入
  onRodInput(e) {
    this.setData({ rod: e.detail.value });
  },

  // 轮子输入
  onReelInput(e) {
    this.setData({ reel: e.detail.value });
  },

  // 添加拟饵
  addLure() {
    const lures = [...this.data.lures, ''];
    this.setData({ lures });
  },

  // 拟饵输入
  onLureInput(e) {
    const index = e.currentTarget.dataset.index;
    const lures = [...this.data.lures];
    lures[index] = e.detail.value;
    this.setData({ lures });
  },

  // 删除拟饵
  removeLure(e) {
    const index = e.currentTarget.dataset.index;
    const lures = this.data.lures.filter((_, i) => i !== index);
    this.setData({ lures });
  },

  // 心得输入
  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },

  // 公开设置
  onSwitchChange(e) {
    this.setData({ isPublic: e.detail.value });
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
  async onSubmit(e) {
    if (!app.isLogin()) {
      app.toast('请先登录');
      return;
    }

    if (!this.data.spotId) {
      app.toast('请选择钓点');
      return;
    }

    if (this.data.submitting) return;

    this.setData({ submitting: true });

    try {
      // 解析拟饵
      const luresUsed = this.data.lures.filter(l => l.trim()).map(l => {
        const parts = l.split(' ');
        return {
          brand: parts[0] || '',
          model: parts[1] || '',
          color: parts[2] || ''
        };
      });

      const data = {
        spot_id: this.data.spotId,
        spot_name: this.data.spotName,
        log_date: this.data.logDate,
        weather: this.data.weatherOptions[this.data.weatherIndex].value,
        temperature: this.data.temperature ? parseFloat(this.data.temperature) : null,
        water_temp: this.data.waterTemp ? parseFloat(this.data.waterTemp) : null,
        wind: this.data.wind,
        rod: this.data.rod,
        reel: this.data.reel,
        lures_used: luresUsed,
        catches: this.data.catches.filter(c => c.fish_type),
        notes: this.data.notes,
        photos: this.data.photos, // TODO: 替换为上传后的 URL
        is_public: this.data.isPublic ? 1 : 0
      };

      const res = await app.request('/logs', {
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
