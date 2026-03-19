/**
 * 钓点页面
 */

const app = getApp();

Page({
  data: {
    mode: 'list', // list | map
    spotList: [],
    page: 1,
    pageSize: 20,
    loading: false,
    hasMore: true,
    filters: {
      city: '',
      water_type: '',
      fish_type: '',
      sort: 'distance'
    },
    mapCenter: {
      lat: 22.5428,
      lng: 114.0543
    },
    markers: []
  },

  onLoad() {
    this.getLocation();
    this.loadSpots();
  },

  onPullDownRefresh() {
    this.data.page = 1;
    this.data.spotList = [];
    this.data.hasMore = true;
    this.loadSpots().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadSpots();
    }
  },

  // 获取位置
  async getLocation() {
    try {
      const res = await wx.getLocation({
        type: 'gcj02',
        isHighAccuracy: true
      });
      this.setData({
        'mapCenter.lat': res.latitude,
        'mapCenter.lng': res.longitude
      });
      this.loadSpots();
    } catch (err) {
      console.error('获取位置失败:', err);
    }
  },

  // 加载钓点列表
  async loadSpots() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { page, pageSize, filters, mapCenter } = this.data;
      const data = {
        page,
        page_size: pageSize,
        ...filters
      };

      // 附近搜索
      if (filters.sort === 'distance') {
        data.lat = mapCenter.lat;
        data.lng = mapCenter.lng;
        data.distance = 50;
      }

      const res = await app.request('/spots', { data });

      if (res.code === 0) {
        const newList = [...this.data.spotList, ...res.data.list];
        const markers = res.data.list.map(spot => ({
          id: spot.id,
          latitude: spot.latitude,
          longitude: spot.longitude,
          title: spot.name,
          callout: {
            display: 'ALWAYS',
            content: spot.name
          }
        }));

        this.setData({
          spotList: newList,
          markers,
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

  // 切换模式
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode });
  },

  // 显示筛选
  showFilter(e) {
    const type = e.currentTarget.dataset.type;
    const options = {
      city: ['深圳', '广州', '珠海', '东莞', '惠州'],
      water_type: [
        { label: '水库', value: 1 },
        { label: '河流', value: 2 },
        { label: '湖泊', value: 3 },
        { label: '海钓', value: 5 }
      ],
      fish_type: ['鲈鱼', '鳜鱼', '翘嘴', '马口', '罗非'],
      sort: [
        { label: '距离最近', value: 'distance' },
        { label: '评分最高', value: 'rating' },
        { label: '最热门', value: 'visits' }
      ]
    };

    wx.showActionSheet({
      itemList: options[type].map(item => item.label || item),
      success: (res) => {
        const selected = options[type][res.tapIndex];
        const value = selected.value || selected;
        const label = selected.label || selected;

        this.setData({
          [`filters.${type}`]: value === this.data.filters[type] ? '' : value
        });

        // 重置列表
        this.data.page = 1;
        this.data.spotList = [];
        this.data.hasMore = true;
        this.loadSpots();
      }
    });
  },

  // 跳转详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/spot-detail/spot-detail?id=${id}`
    });
  },

  // 地图标记点击
  onMarkerTap(e) {
    const id = e.detail.markerId;
    this.goDetail({ currentTarget: { dataset: { id } } });
  },

  // 跳转搜索
  goSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  // 添加钓点
  goAdd() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
});
