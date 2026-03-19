<template>
  <div class="contents-page">
    <el-card>
      <!-- 类型选择 -->
      <el-tabs v-model="contentType" @tab-change="loadContents">
        <el-tab-pane label="作钓记录" name="log" />
        <el-tab-pane label="二手商品" name="item" />
        <el-tab-pane label="视频" name="video" />
      </el-tabs>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" clearable>
            <el-option v-if="contentType === 'item'" label="在售" :value="1" />
            <el-option v-if="contentType === 'item'" label="已售" :value="2" />
            <el-option v-if="contentType === 'video'" label="待审核" :value="0" />
            <el-option v-if="contentType === 'video'" label="已发布" :value="1" />
            <el-option label="正常" :value="1" v-if="contentType === 'log'" />
            <el-option label="隐藏" :value="0" v-if="contentType === 'log'" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadContents">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 内容列表 -->
      <el-table :data="contentList" v-loading="loading" style="width: 100%">
        <!-- 作钓记录列 -->
        <template v-if="contentType === 'log'">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="用户" width="150">
            <template #default="{ row }">
              {{ row.user?.nickname || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="spot_name" label="钓点" width="150" />
          <el-table-column prop="log_date" label="作钓日期" width="120" />
          <el-table-column label="渔获" width="120">
            <template #default="{ row }">
              {{ row.catch_count || 0 }}条
              <span v-if="row.max_length">/{{ row.max_length }}cm</span>
            </template>
          </el-table-column>
          <el-table-column label="互动" width="150">
            <template #default="{ row }">
              <span class="stat-tag">❤️ {{ row.like_count }}</span>
              <span class="stat-tag">💬 {{ row.comment_count }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.is_public ? 'success' : 'info'">
                {{ row.is_public ? '公开' : '私密' }}
              </el-tag>
            </template>
          </el-table-column>
        </template>

        <!-- 二手商品列 -->
        <template v-else-if="contentType === 'item'">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="商品" min-width="200">
            <template #default="{ row }">
              <div class="item-title">{{ row.title }}</div>
              <div class="item-price">¥{{ row.price }}</div>
            </template>
          </el-table-column>
          <el-table-column label="卖家" width="150">
            <template #default="{ row }">
              {{ row.seller?.nickname || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="成色" width="80">
            <template #default="{ row }">
              {{ conditionMap[row.condition] || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'info' : 'danger'">
                {{ row.status === 1 ? '在售' : row.status === 2 ? '已售' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
        </template>

        <!-- 视频列 -->
        <template v-else-if="contentType === 'video'">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="视频" min-width="200">
            <template #default="{ row }">
              <div class="video-title">{{ row.title }}</div>
              <div class="video-uploader">UP: {{ row.uploader?.nickname || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="播放" width="100">
            <template #default="{ row }">
              {{ row.play_count || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="互动" width="150">
            <template #default="{ row }">
              <span class="stat-tag">❤️ {{ row.like_count }}</span>
              <span class="stat-tag">⭐ {{ row.favorite_count }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : row.status === 0 ? 'warning' : 'info'">
                {{ row.status === 1 ? '已发布' : row.status === 0 ? '待审核' : '已下架' }}
              </el-tag>
            </template>
          </el-table-column>
        </template>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="deleteContent(row.id)">
              删除
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
        @current-change="loadContents"
        @size-change="loadContents"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const contentType = ref('log')
const loading = ref(false)
const contentList = ref([])
const searchForm = reactive({
  status: null
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const conditionMap = {
  1: '全新',
  2: '95 新',
  3: '9 新',
  4: '8 新',
  5: '7 新',
  6: '战斗成色'
}

const loadContents = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const res = await axios.get('/api/v1/admin/contents', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        type: contentType.value,
        ...searchForm,
        page: pagination.page,
        page_size: pagination.page_size
      }
    })
    
    if (res.data.code === 0) {
      contentList.value = res.data.data.list
      pagination.total = res.data.data.total
    }
  } catch (err) {
    ElMessage.error('加载内容列表失败')
  } finally {
    loading.value = false
  }
}

const deleteContent = async (id) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条${contentType.value === 'log' ? '作钓记录' : contentType.value === 'item' ? '商品' : '视频'}吗？`,
      '警告',
      { type: 'warning' }
    )
    
    const token = localStorage.getItem('admin_token')
    const res = await axios.delete(
      `/api/v1/admin/contents/${contentType.value}/${id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    
    if (res.data.code === 0) {
      ElMessage.success('删除成功')
      loadContents()
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadContents()
})
</script>

<style scoped>
.contents-page {
  padding: 20px;
}

.search-form {
  margin-top: 20px;
  margin-bottom: 20px;
}

.item-title, .video-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.item-price {
  color: #ff5252;
  font-size: 14px;
}

.video-uploader {
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
