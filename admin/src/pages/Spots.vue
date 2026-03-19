<template>
  <div class="spots-page">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="搜索钓点名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已上线" :value="1" />
            <el-option label="已下线" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadSpots">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 钓点列表 -->
      <el-table :data="spotList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="钓点信息" min-width="200">
          <template #default="{ row }">
            <div class="spot-name">{{ row.name }}</div>
            <div class="spot-address">{{ row.province }}{{ row.city }}{{ row.district }}</div>
          </template>
        </el-table-column>
        <el-table-column label="水域类型" width="100">
          <template #default="{ row }">
            {{ waterTypeMap[row.water_type] || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="鱼种" width="150">
          <template #default="{ row }">
            <el-tag v-for="fish in (row.fish_types || [])" :key="fish" size="small" style="margin-right: 5px">
              {{ fish }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="收费" width="100">
          <template #default="{ row }">
            {{ row.fee_status === 1 ? '免费' : '¥' + (row.fee_amount || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="统计" width="150">
          <template #default="{ row }">
            <span class="stat-tag">访问：{{ row.visit_count }}</span>
            <span class="stat-tag">记录：{{ row.log_count }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 0 ? 'warning' : 'info'">
              {{ row.status === 1 ? '已上线' : row.status === 0 ? '待审核' : '已下线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="success"
              size="small"
              @click="auditSpot(row.id, 1)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              size="small"
              @click="auditSpot(row.id, 2)"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="warning"
              size="small"
              @click="auditSpot(row.id, 2)"
            >
              下线
            </el-button>
            <el-button
              v-if="row.status === 2"
              type="success"
              size="small"
              @click="auditSpot(row.id, 1)"
            >
              上线
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadSpots"
        @size-change="loadSpots"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const spotList = ref([])
const searchForm = reactive({
  keyword: '',
  status: null
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const waterTypeMap = {
  1: '水库',
  2: '河流',
  3: '湖泊',
  4: '溪流',
  5: '海钓',
  6: '池塘'
}

const loadSpots = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const res = await axios.get('/api/v1/admin/spots', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        ...searchForm,
        page: pagination.page,
        page_size: pagination.page_size
      }
    })
    
    if (res.data.code === 0) {
      spotList.value = res.data.data.list
      pagination.total = res.data.data.total
    }
  } catch (err) {
    ElMessage.error('加载钓点列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = null
  pagination.page = 1
  loadSpots()
}

const auditSpot = async (spotId, status) => {
  const statusText = status === 1 ? '通过' : status === 2 ? '拒绝' : '操作'
  
  try {
    await ElMessageBox.confirm(
      `确定要${statusText}该钓点吗？`,
      '提示',
      { type: 'warning' }
    )
    
    const token = localStorage.getItem('admin_token')
    const res = await axios.put(
      `/api/v1/admin/spots/${spotId}/audit`,
      { status },
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    
    if (res.data.code === 0) {
      ElMessage.success(res.data.message)
      loadSpots()
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  loadSpots()
})
</script>

<style scoped>
.spots-page {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.spot-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.spot-address {
  font-size: 12px;
  color: #999;
}

.stat-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  margin-right: 8px;
}
</style>
