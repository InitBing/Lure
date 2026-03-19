<template>
  <div class="ponds-page">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="搜索钓场名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.verifyStatus" placeholder="认证状态" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadOwners">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 塘主列表 -->
      <el-table :data="ownerList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="塘主信息" min-width="200">
          <template #default="{ row }">
            <div class="owner-info">
              <el-avatar :size="40" :src="row.user?.avatar" />
              <div class="owner-detail">
                <div class="business-name">{{ row.business_name }}</div>
                <div class="contact">{{ row.contact_name }} - {{ row.contact_phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="统计" width="150">
          <template #default="{ row }">
            <span class="stat-tag">钓场：{{ row.pond_count }}</span>
            <span class="stat-tag">活动：{{ row.event_count }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="credit_score" label="信用分" width="100">
          <template #default="{ row }">
            <el-tag :type="row.credit_score >= 80 ? 'success' : row.credit_score >= 60 ? 'warning' : 'danger'">
              {{ row.credit_score }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.verify_status === 1 ? 'success' : row.verify_status === 0 ? 'warning' : 'danger'">
              {{ row.verify_status === 1 ? '已通过' : row.verify_status === 0 ? '待审核' : '已拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.verify_status === 0"
              type="success"
              size="small"
              @click="auditOwner(row.id, 1)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.verify_status === 0"
              type="danger"
              size="small"
              @click="auditOwner(row.id, 2)"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="warning"
              size="small"
              @click="updateOwnerStatus(row.id, 0)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              @click="updateOwnerStatus(row.id, 1)"
            >
              启用
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
        @current-change="loadOwners"
        @size-change="loadOwners"
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
const ownerList = ref([])
const searchForm = reactive({
  keyword: '',
  verifyStatus: null
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const loadOwners = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const res = await axios.get('/api/v1/admin/pond-owners', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        ...searchForm,
        page: pagination.page,
        page_size: pagination.page_size
      }
    })
    
    if (res.data.code === 0) {
      ownerList.value = res.data.data.list
      pagination.total = res.data.data.total
    }
  } catch (err) {
    ElMessage.error('加载塘主列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.verifyStatus = null
  pagination.page = 1
  loadOwners()
}

const auditOwner = async (ownerId, status) => {
  try {
    await ElMessageBox.confirm(
      `确定要${status === 1 ? '通过' : '拒绝'}该塘主申请吗？`,
      '提示',
      { type: 'warning' }
    )
    
    const token = localStorage.getItem('admin_token')
    const res = await axios.put(
      `/api/v1/admin/pond-owners/${ownerId}/audit`,
      { status },
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    
    if (res.data.code === 0) {
      ElMessage.success(res.data.message)
      loadOwners()
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const updateOwnerStatus = async (ownerId, status) => {
  try {
    await ElMessageBox.confirm(
      `确定要${status === 0 ? '禁用' : '启用'}该塘主吗？`,
      '提示',
      { type: 'warning' }
    )
    
    const token = localStorage.getItem('admin_token')
    const res = await axios.put(
      `/api/v1/admin/pond-owners/${ownerId}/status`,
      { status },
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    
    if (res.data.code === 0) {
      ElMessage.success('操作成功')
      loadOwners()
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  loadOwners()
})
</script>

<style scoped>
.ponds-page {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.owner-detail {
  display: flex;
  flex-direction: column;
}

.business-name {
  font-weight: bold;
  color: #333;
}

.contact {
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
