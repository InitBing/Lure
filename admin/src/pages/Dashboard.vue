<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="item in statsList" :key="item.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ background: item.color }">
            <el-icon :size="30"><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待审核提醒 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>⏳ 待审核钓点</span>
              <el-button type="primary" link @click="$router.push('/spots?status=0')">查看全部</el-button>
            </div>
          </template>
          <div class="pending-item" v-if="stats.spots_pending > 0">
            <el-tag type="warning">待审核</el-tag>
            <span>{{ stats.spots_pending }} 个钓点等待审核</span>
          </div>
          <el-empty v-else description="暂无待审核钓点" :image-size="80" />
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>⏳ 待审核视频</span>
              <el-button type="primary" link @click="$router.push('/contents?type=video&status=0')">查看全部</el-button>
            </div>
          </template>
          <div class="pending-item" v-if="stats.videos_pending > 0">
            <el-tag type="warning">待审核</el-tag>
            <span>{{ stats.videos_pending }} 个视频等待审核</span>
          </div>
          <el-empty v-else description="暂无待审核视频" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card shadow="hover" style="margin-top: 20px">
      <template #header>
        <span>⚡ 快捷操作</span>
      </template>
      <el-space wrap>
        <el-button type="primary" @click="$router.push('/users')">用户管理</el-button>
        <el-button type="success" @click="$router.push('/spots')">钓点审核</el-button>
        <el-button type="warning" @click="$router.push('/contents')">内容管理</el-button>
        <el-button type="info" @click="refreshStats">刷新数据</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const stats = ref({
  users: 0,
  spots: 0,
  logs: 0,
  items: 0,
  videos: 0,
  spots_pending: 0,
  videos_pending: 0,
  new_users_7d: 0
})

const statsList = computed(() => [
  { label: '总用户数', value: stats.value.users, icon: 'User', color: '#409EFF' },
  { label: '钓点总数', value: stats.value.spots, icon: 'Location', color: '#67C23A' },
  { label: '作钓记录', value: stats.value.logs, icon: 'Document', color: '#E6A23C' },
  { label: '二手商品', value: stats.value.items, icon: 'ShoppingCart', color: '#F56C6C' },
  { label: '视频总数', value: stats.value.videos, icon: 'VideoCamera', color: '#909399' },
  { label: '7 日新增', value: stats.value.new_users_7d, icon: 'TrendCharts', color: '#13C2C2' }
])

const loadStats = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    const res = await axios.get('/api/v1/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res.data.code === 0) {
      stats.value = res.data.data
    }
  } catch (err) {
    console.error('加载统计失败:', err)
  }
}

const refreshStats = () => {
  loadStats()
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pending-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #666;
}
</style>
