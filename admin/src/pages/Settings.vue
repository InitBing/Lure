<template>
  <div class="settings-page">
    <el-card>
      <template #header>
        <span>⚙️ 系统设置</span>
      </template>

      <el-tabs>
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息">
          <el-form label-width="120px" style="max-width: 600px">
            <el-form-item label="网站名称">
              <el-input v-model="settings.siteName" />
            </el-form-item>
            <el-form-item label="Logo">
              <el-upload action="/api/v1/upload/image" :show-file-list="false" :on-success="handleLogoSuccess">
                <el-button type="primary">上传 Logo</el-button>
              </el-upload>
            </el-form-item>
            <el-form-item label="联系方式">
              <el-input v-model="settings.contact" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 审核设置 -->
        <el-tab-pane label="审核设置">
          <el-form label-width="150px" style="max-width: 600px">
            <el-form-item label="钓点审核">
              <el-switch v-model="settings.spotAudit" active-text="需要审核" />
            </el-form-item>
            <el-form-item label="视频审核">
              <el-switch v-model="settings.videoAudit" active-text="需要审核" />
            </el-form-item>
            <el-form-item label="敏感词过滤">
              <el-switch v-model="settings.wordFilter" active-text="启用" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 管理员管理 -->
        <el-tab-pane label="管理员管理">
          <el-button type="primary" @click="showAddAdmin = true" style="margin-bottom: 20px">
            添加管理员
          </el-button>
          <el-table :data="adminList" style="width: 100%">
            <el-table-column prop="username" label="用户名" />
            <el-table-column label="角色">
              <template #default="{ row }">
                {{ roleMap[row.role] }}
              </template>
            </el-table-column>
            <el-table-column prop="last_login_at" label="最后登录" />
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 系统信息 -->
        <el-tab-pane label="系统信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="后端框架">Koa 2 + Sequelize</el-descriptions-item>
            <el-descriptions-item label="前端框架">Vue 3 + Element Plus</el-descriptions-item>
            <el-descriptions-item label="数据库">MySQL 8.0</el-descriptions-item>
            <el-descriptions-item label="服务器时间">{{ currentTime }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加管理员对话框 -->
    <el-dialog v-model="showAddAdmin" title="添加管理员" width="400px">
      <el-form :model="newAdmin" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="newAdmin.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="newAdmin.password" type="password" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="newAdmin.role">
            <el-option label="超级管理员" :value="1" />
            <el-option label="内容审核" :value="2" />
            <el-option label="运营" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddAdmin = false">取消</el-button>
        <el-button type="primary" @click="addAdmin">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const showAddAdmin = ref(false)

const settings = reactive({
  siteName: 'LureBin',
  logo: '',
  contact: '',
  spotAudit: true,
  videoAudit: true,
  wordFilter: true
})

const adminList = ref([
  { username: 'admin', role: 1, last_login_at: '2024-03-19 10:00:00', status: 1 }
])

const roleMap = {
  1: '超级管理员',
  2: '内容审核',
  3: '运营'
}

const currentTime = ref(new Date().toLocaleString('zh-CN'))

const newAdmin = reactive({
  username: '',
  password: '',
  role: 2
})

const saveSettings = () => {
  ElMessage.success('设置已保存')
}

const handleLogoSuccess = (response) => {
  if (response.code === 0) {
    settings.logo = response.data.url
    ElMessage.success('Logo 上传成功')
  }
}

const addAdmin = () => {
  if (!newAdmin.username || !newAdmin.password) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  adminList.value.push({
    username: newAdmin.username,
    role: newAdmin.role,
    last_login_at: '-',
    status: 1
  })
  
  showAddAdmin.value = false
  ElMessage.success('管理员添加成功')
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
}
</style>
