/**
 * LureBin 路亚小程序 - 入口文件
 */

App({
  onLaunch() {
    // 检查更新
    this.checkUpdate();
    
    // 登录
    this.login();
  },

  globalData: {
    userInfo: null,
    token: null,
    isOpenid: false,
    systemInfo: null
  },

  // 配置
  config: {
    // 开发环境
    // apiBaseUrl: 'http://localhost:3000/api/v1',
    // 生产环境
    apiBaseUrl: 'https://api.lurebin.com/api/v1',
    uploadMaxSize: 50 * 1024 * 1024, // 50MB
    imageMaxCount: 9
  },

  // 微信登录
  async login() {
    try {
      const { code } = await wx.login();
      
      // 获取用户信息 (需要用户授权)
      const userProfile = await this.getUserProfile();
      
      // 调用后端登录接口
      const res = await this.request('/auth/wechat', {
        method: 'POST',
        data: {
          code,
          ...userProfile
        }
      });
      
      if (res.code === 0) {
        this.globalData.token = res.data.token;
        this.globalData.userInfo = res.data.user;
        
        // 存储 token
        wx.setStorageSync('token', res.data.token);
        
        // 存储用户信息
        if (res.data.user) {
          wx.setStorageSync('userInfo', res.data.user);
        }
      }
    } catch (err) {
      console.error('登录失败:', err);
    }
  },

  // 获取用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve({
            nickname: res.userInfo.nickName,
            avatar: res.userInfo.avatarUrl,
            gender: res.userInfo.Gender
          });
        },
        fail: (err) => {
          // 用户拒绝，使用默认信息
          resolve({
            nickname: '路亚爱好者',
            avatar: '',
            gender: 0
          });
        }
      });
    });
  },

  // 封装请求
  async request(url, options = {}) {
    const token = this.globalData.token || wx.getStorageSync('token');
    
    const defaultOptions = {
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      timeout: 10000
    };

    const config = { ...defaultOptions, ...options };
    config.url = this.config.apiBaseUrl + url;

    return new Promise((resolve, reject) => {
      wx.request({
        ...config,
        success: (res) => {
          if (res.statusCode === 401) {
            // Token 过期，重新登录
            this.login().then(() => {
              // 重试请求
              this.request(url, options).then(resolve).catch(reject);
            });
            return;
          }
          resolve(res.data);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 上传文件
  async uploadFile(filePath, type = 'image') {
    const token = this.globalData.token || wx.getStorageSync('token');
    const url = `${this.config.apiBaseUrl}/upload/${type}`;

    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url,
        filePath,
        name: 'file',
        header: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data.data.url);
          } else {
            reject(new Error(data.message));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 显示提示
  toast(message, icon = 'none') {
    wx.showToast({
      title: message,
      icon,
      duration: 2000
    });
  },

  // 检查更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
        }
      });
    }
  },

  // 检查登录状态
  checkLogin() {
    if (!this.globalData.token) {
      wx.switchTab({
        url: '/pages/mine/mine'
      });
      return false;
    }
    return true;
  }
});
