# LureBin API 接口文档

## 基础信息

- **Base URL**: `https://api.lurebin.com` (生产环境)
- **API 版本**: v1
- **认证方式**: JWT Token (微信登录获取)
- **数据格式**: JSON

## 响应格式

### 成功响应
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 错误响应
```json
{
  "code": 40001,
  "message": "参数错误",
  "data": null
}
```

### 通用状态码
| Code | 说明 |
|------|------|
| 0 | 成功 |
| 40001 | 参数错误 |
| 40100 | 未登录/Token 过期 |
| 40300 | 无权限 |
| 40400 | 资源不存在 |
| 50000 | 服务器错误 |

---

## 认证模块

### 1. 微信登录
```
POST /api/v1/auth/wechat
```

**请求:**
```json
{
  "code": "微信登录 code"
}
```

**响应:**
```json
{
  "code": 0,
  "data": {
    "token": "JWT Token",
    "user": {
      "id": 1,
      "nickname": "路亚小王",
      "avatar": "https://...",
      "region": "广东深圳",
      "is_new": false
    }
  }
}
```

### 2. 刷新 Token
```
POST /api/v1/auth/refresh
```

**Header:** `Authorization: Bearer {token}`

---

## 用户模块

### 1. 获取个人信息
```
GET /api/v1/user/profile
```

### 2. 更新个人信息
```
PUT /api/v1/user/profile
```

**请求:**
```json
{
  "nickname": "新昵称",
  "avatar": "头像 URL",
  "gender": 1,
  "region": "广东深圳"
}
```

### 3. 获取个人统计
```
GET /api/v1/user/stats
```

**响应:**
```json
{
  "code": 0,
  "data": {
    "log_count": 12,
    "catch_count": 45,
    "post_count": 28,
    "follower_count": 156,
    "following_count": 89,
    "favorite_count": 234
  }
}
```

### 4. 关注/取消关注
```
POST /api/v1/user/{user_id}/follow
DELETE /api/v1/user/{user_id}/follow
```

### 5. 获取用户列表
```
GET /api/v1/users
```

**参数:**
- `keyword`: 搜索关键词
- `region`: 地区筛选
- `page`: 页码
- `page_size`: 每页数量

---

## 钓点模块

### 1. 钓点列表
```
GET /api/v1/spots
```

**参数:**
- `lat`: 纬度 (用于附近搜索)
- `lng`: 经度
- `distance`: 距离范围 (km)
- `city`: 城市
- `water_type`: 水域类型
- `fish_type`: 鱼种
- `fee_status`: 收费状态
- `keyword`: 搜索关键词
- `sort`: 排序 (distance|rating|visits)
- `page`: 页码
- `page_size`: 每页数量

**响应:**
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "XX 水库",
        "distance": 12.5,
        "avg_rating": 4.8,
        "review_count": 128,
        "fish_types": ["鲈鱼", "鳜鱼"],
        "water_type": 1,
        "fee_status": 2,
        "fee_amount": 50.00,
        "cover_url": "https://..."
      }
    ],
    "total": 156,
    "page": 1,
    "page_size": 20
  }
}
```

### 2. 钓点详情
```
GET /api/v1/spots/{id}
```

### 3. 创建钓点
```
POST /api/v1/spots
```

**请求:**
```json
{
  "name": "XX 水库",
  "description": "详细描述",
  "province": "广东省",
  "city": "深圳市",
  "district": "龙岗区",
  "address": "具体地址",
  "latitude": 22.5428,
  "longitude": 114.0543,
  "water_type": 1,
  "fish_types": ["鲈鱼", "鳜鱼"],
  "fee_status": 2,
  "fee_amount": 50.00,
  "best_seasons": ["春", "秋"],
  "facilities": ["停车场", "厕所"]
}
```

### 4. 钓点评价
```
POST /api/v1/spots/{id}/reviews
GET /api/v1/spots/{id}/reviews
```

---

## 作钓记录模块

### 1. 发布作钓记录
```
POST /api/v1/logs
```

**请求:**
```json
{
  "spot_id": 1,
  "spot_name": "XX 水库",
  "log_date": "2024-03-19",
  "weather": 1,
  "temperature": 25.5,
  "water_temp": 18.5,
  "wind": "东南风 2 级",
  "lures_used": [
    {"brand": "Megabass", "model": "Vision 110", "color": "Mat Tiger"}
  ],
  "rod": "Major Craft Solpara",
  "reel": "Shimano SLX",
  "catches": [
    {"fish_type": "鲈鱼", "length": 52.0, "weight": 1850, "photo_url": "..."}
  ],
  "notes": "今天天气不错，口很好...",
  "photos": ["url1", "url2"],
  "is_public": 1
}
```

### 2. 作钓记录列表
```
GET /api/v1/logs
```

**参数:**
- `user_id`: 用户 ID (可选)
- `spot_id`: 钓点 ID (可选)
- `fish_type`: 鱼种筛选
- `date_from`: 开始日期
- `date_to`: 结束日期
- `is_public`: 是否公开
- `page`: 页码
- `page_size`: 每页数量

### 3. 作钓记录详情
```
GET /api/v1/logs/{id}
```

### 4. 更新/删除作钓记录
```
PUT /api/v1/logs/{id}
DELETE /api/v1/logs/{id}
```

### 5. 点赞/收藏
```
POST /api/v1/logs/{id}/like
POST /api/v1/logs/{id}/favorite
DELETE /api/v1/logs/{id}/like
DELETE /api/v1/logs/{id}/favorite
```

---

## 二手市场模块

### 1. 商品列表
```
GET /api/v1/items
```

**参数:**
- `category`: 分类 (1-拟饵 2-竿子 3-轮子...)
- `brand`: 品牌
- `condition`: 成色
- `price_min`: 最低价格
- `price_max`: 最高价格
- `province`: 省
- `city`: 市
- `keyword`: 搜索关键词
- `sort`: 排序 (newest|price_asc|price_desc)
- `page`: 页码
- `page_size`: 每页数量

### 2. 商品详情
```
GET /api/v1/items/{id}
```

### 3. 发布商品
```
POST /api/v1/items
```

**请求:**
```json
{
  "category": 1,
  "brand": "Shimano",
  "model": "SLX DC 70",
  "title": "Shimano 水滴轮 SLX DC 70",
  "description": "用了 3 次，无磕碰...",
  "condition": 2,
  "price": 350.00,
  "original_price": 680.00,
  "photos": ["url1", "url2", "url3"],
  "province": "广东省",
  "city": "深圳市",
  "shipping": 1
}
```

### 4. 更新/删除商品
```
PUT /api/v1/items/{id}
DELETE /api/v1/items/{id}
```

### 5. 标记已售
```
PUT /api/v1/items/{id}/sold
```

---

## 消息模块

### 1. 会话列表
```
GET /api/v1/messages/conversations
```

### 2. 消息列表
```
GET /api/v1/messages
```

**参数:**
- `conversation_id`: 会话 ID
- `partner_id`: 对方用户 ID
- `page`: 页码

### 3. 发送消息
```
POST /api/v1/messages
```

**请求:**
```json
{
  "receiver_id": 2,
  "type": 1,
  "content": "你好，这个还在吗？"
}
```

### 4. 消息已读
```
PUT /api/v1/messages/read
```

**请求:**
```json
{
  "conversation_id": "1_2"
}
```

---

## 视频模块

### 1. 视频列表
```
GET /api/v1/videos
```

**参数:**
- `user_id`: 用户 ID
- `spot_id`: 钓点 ID
- `tag`: 标签
- `sort`: 排序 (newest|hot|plays)
- `page`: 页码

### 2. 视频详情
```
GET /api/v1/videos/{id}
```

### 3. 上传视频
```
POST /api/v1/videos
```

**请求:**
```json
{
  "title": "XX 水库路亚鲈鱼",
  "description": "今天战果不错...",
  "video_url": "视频 URL",
  "cover_url": "封面 URL",
  "duration": 45,
  "spot_id": 1,
  "tags": ["#鲈鱼", "#路亚"]
}
```

### 4. 点赞/收藏/分享
```
POST /api/v1/videos/{id}/like
POST /api/v1/videos/{id}/favorite
POST /api/v1/videos/{id}/share
```

---

## 资讯模块

### 1. 资讯列表
```
GET /api/v1/articles
```

**参数:**
- `category`: 分类 (1-新闻 2-赛事 3-评测...)
- `tag`: 标签
- `is_recommend`: 是否推荐
- `page`: 页码

### 2. 资讯详情
```
GET /api/v1/articles/{id}
```

---

## 评论模块

### 1. 评论列表
```
GET /api/v1/comments
```

**参数:**
- `target_type`: 目标类型
- `target_id`: 目标 ID
- `page`: 页码

### 2. 发布评论
```
POST /api/v1/comments
```

**请求:**
```json
{
  "target_type": 1,
  "target_id": 123,
  "content": "写得真好！",
  "parent_id": null
}
```

### 3. 删除评论
```
DELETE /api/v1/comments/{id}
```

---

## 搜索模块

### 综合搜索
```
GET /api/v1/search
```

**参数:**
- `keyword`: 搜索关键词
- `type`: 类型 (all|spots|logs|items|videos|users)
- `page`: 页码

**响应:**
```json
{
  "code": 0,
  "data": {
    "spots": [],
    "logs": [],
    "items": [],
    "videos": [],
    "users": []
  }
}
```

---

## 上传模块

### 上传图片
```
POST /api/v1/upload/image
```

**请求:** `multipart/form-data`
- `file`: 图片文件

**响应:**
```json
{
  "code": 0,
  "data": {
    "url": "https://cos.lurebin.com/..."
  }
}
```

### 上传视频
```
POST /api/v1/upload/video
```

---

## 错误码大全

| Code | 说明 |
|------|------|
| 0 | 成功 |
| 40001 | 参数错误 |
| 40002 | 参数格式错误 |
| 40003 | 参数超出范围 |
| 40100 | 未登录 |
| 40101 | Token 过期 |
| 40102 | Token 无效 |
| 40300 | 无权限 |
| 40301 | 已被封禁 |
| 40400 | 资源不存在 |
| 40401 | 用户不存在 |
| 40402 | 钓点不存在 |
| 40403 | 商品不存在 |
| 40900 | 重复操作 |
| 40901 | 已关注 |
| 40902 | 已点赞 |
| 40903 | 已收藏 |
| 50000 | 服务器错误 |
| 50001 | 数据库错误 |
| 50002 | 第三方服务错误 |

---

## 限流策略

- 普通接口：100 次/分钟/IP
- 发送消息：20 次/分钟/用户
- 上传文件：10 次/分钟/用户
- 搜索接口：30 次/分钟/IP

## 版本管理

- URL 中包含版本号：`/api/v1/...`
- 向后兼容至少 2 个版本
- 废弃接口提前 30 天通知
