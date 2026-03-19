<template>
  <div class="users-page">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="搜索用户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="封禁" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadUsers">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表 -->
      <el-table :data="userList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar" />
              <div class="user-detail">
                <div class="nickname">{{ row.nickname }}</div>
                <div class="region">{{ row.region || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知' }}
          </template>
        </el-table-column>
        <el-table-column label="统计" width="200">
          <template #default="{ row }">
            <span class="stat-tag">作钓：{{ row.log_count }}</span>
            <span class="stat-tag">粉丝：{{ row.follower_count }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="credit_score" label="信用分" width="100">
          <template #default="{ row }">
            <el-tag :type="row.credit_score >= 80 ? 'success' : row.credit_score >= 60 ? 'warning' : 'danger'">
              {{ row.credit_score }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              type="danger"
              size="small"
              @click="updateStatus(row.id, 0)"
            >
              封禁
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              @click="updateStatus(row.id, 1)"
            >
              解封
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
        @current-change="loadUsers"
        @size-change="loadUsers"
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
const userList = ref([])
const searchForm = reactive({
  keyword: '',
  status: null
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const loadUsers = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const res = await axios.get('/api/v1/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        ...searchForm,
        page: pagination.page,
        page_size: pagination.page_size
      }
    })
    
    if (res.data.code === 0) {
      userList.value = res.data.data.list
      pagination.total = res.data.data.total
    }
  } catch (err) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = null
  pagination.page = 1
  loadUsers()
}

const updateStatus = async (userId, status) => {
  try {
    await ElMessageBox.confirm(
      `确定要${status === 0 ? '封禁' : '解封'}该用户吗？`,
      '提示',
      { type: 'warning' }
    )
    
    const token = localStorage.getItem('admin_token')
    const res = await axios.put(
      `/api/v1/admin/users/${userId}/status`,
      { status },
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    
    if (res.data.code === 0) {
      ElMessage.success(res.data.message)
      loadUsers()
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-page {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-weight: bold;
  color: #333;
}

.region {
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
