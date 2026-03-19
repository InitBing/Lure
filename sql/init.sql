-- LureBin 路亚小程序 - 数据库初始化脚本
-- MySQL 8.0+
-- 执行：mysql -u root -p < init.sql

CREATE DATABASE IF NOT EXISTS lurebin DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lurebin;

-- 用户表
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(64) NOT NULL UNIQUE COMMENT '微信 openid',
    unionid VARCHAR(64) DEFAULT NULL COMMENT '微信 unionid (多应用统一)',
    nickname VARCHAR(64) NOT NULL COMMENT '昵称',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像 URL',
    gender TINYINT DEFAULT 0 COMMENT '性别 0-未知 1-男 2-女',
    region VARCHAR(64) DEFAULT NULL COMMENT '地区 (省 - 市)',
    phone VARCHAR(20) DEFAULT NULL COMMENT '手机号 (可选)',
    log_count INT DEFAULT 0 COMMENT '作钓次数',
    catch_count INT DEFAULT 0 COMMENT '渔获数量',
    post_count INT DEFAULT 0 COMMENT '发布动态数',
    follower_count INT DEFAULT 0 COMMENT '粉丝数',
    following_count INT DEFAULT 0 COMMENT '关注数',
    credit_score INT DEFAULT 100 COMMENT '信用分 (0-100)',
    trade_count INT DEFAULT 0 COMMENT '成交订单数',
    trade_rating DECIMAL(2,1) DEFAULT 5.0 COMMENT '交易评分 (0-5)',
    status TINYINT DEFAULT 1 COMMENT '状态 1-正常 0-封禁',
    is_admin TINYINT DEFAULT 0 COMMENT '是否管理员',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP DEFAULT NULL,
    INDEX idx_openid (openid),
    INDEX idx_region (region),
    INDEX idx_credit (credit_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 钓点表
CREATE TABLE spots (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '钓点名称',
    description TEXT DEFAULT NULL COMMENT '详细描述',
    province VARCHAR(50) NOT NULL COMMENT '省',
    city VARCHAR(50) NOT NULL COMMENT '市',
    district VARCHAR(50) DEFAULT NULL COMMENT '区/县',
    address VARCHAR(255) DEFAULT NULL COMMENT '详细地址',
    latitude DECIMAL(10, 7) NOT NULL COMMENT '纬度',
    longitude DECIMAL(10, 7) NOT NULL COMMENT '经度',
    water_type TINYINT NOT NULL COMMENT '水域类型 1-水库 2-河流 3-湖泊 4-溪流 5-海钓 6-池塘',
    fish_types JSON DEFAULT NULL COMMENT '鱼种',
    fee_status TINYINT DEFAULT 1 COMMENT '收费 1-免费 2-收费 3-会员制',
    fee_amount DECIMAL(10,2) DEFAULT NULL COMMENT '收费金额',
    best_seasons JSON DEFAULT NULL COMMENT '最佳季节',
    facilities JSON DEFAULT NULL COMMENT '设施',
    visit_count INT DEFAULT 0 COMMENT '访问次数',
    log_count INT DEFAULT 0 COMMENT '作钓记录数',
    avg_rating DECIMAL(2,1) DEFAULT 0 COMMENT '平均评分',
    review_count INT DEFAULT 0 COMMENT '评价数',
    status TINYINT DEFAULT 0 COMMENT '状态 0-待审核 1-已上线 2-已下线',
    created_by BIGINT UNSIGNED NOT NULL COMMENT '创建者 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (latitude, longitude),
    INDEX idx_city (city),
    INDEX idx_water_type (water_type),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钓点表';

-- 作钓记录表
CREATE TABLE logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
    spot_id BIGINT UNSIGNED DEFAULT NULL COMMENT '钓点 ID',
    spot_name VARCHAR(100) DEFAULT NULL COMMENT '钓点名称',
    log_date DATE NOT NULL COMMENT '作钓日期',
    weather TINYINT DEFAULT 1 COMMENT '天气 1-晴 2-多云 3-阴 4-小雨 5-大雨 6-雷阵雨',
    temperature DECIMAL(4,1) DEFAULT NULL COMMENT '气温',
    water_temp DECIMAL(4,1) DEFAULT NULL COMMENT '水温',
    wind VARCHAR(20) DEFAULT NULL COMMENT '风力风向',
    water_level TINYINT DEFAULT 2 COMMENT '水位 1-低 2-中 3-高',
    lures_used JSON DEFAULT NULL COMMENT '使用拟饵',
    rod VARCHAR(100) DEFAULT NULL COMMENT '使用竿子',
    reel VARCHAR(100) DEFAULT NULL COMMENT '使用轮子',
    line VARCHAR(100) DEFAULT NULL COMMENT '使用线组',
    catch_count INT DEFAULT 0 COMMENT '渔获数量',
    max_length DECIMAL(5,1) DEFAULT NULL COMMENT '最长大鱼',
    max_weight DECIMAL(5,2) DEFAULT NULL COMMENT '最重大鱼',
    notes TEXT DEFAULT NULL COMMENT '心得描述',
    photos JSON DEFAULT NULL COMMENT '照片 URLs',
    video_url VARCHAR(255) DEFAULT NULL COMMENT '视频 URL',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    is_public TINYINT DEFAULT 1 COMMENT '是否公开',
    status TINYINT DEFAULT 1 COMMENT '状态 1-正常 0-隐藏',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_spot_id (spot_id),
    INDEX idx_log_date (log_date),
    INDEX idx_public (is_public, status),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (spot_id) REFERENCES spots(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作钓记录表';

-- 渔获明细表
CREATE TABLE log_catches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    log_id BIGINT UNSIGNED NOT NULL COMMENT '作钓记录 ID',
    fish_type VARCHAR(50) NOT NULL COMMENT '鱼种',
    length DECIMAL(5,1) DEFAULT NULL COMMENT '长度 (cm)',
    weight DECIMAL(6,1) DEFAULT NULL COMMENT '重量 (g)',
    photo_url VARCHAR(255) DEFAULT NULL COMMENT '照片 URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_id (log_id),
    FOREIGN KEY (log_id) REFERENCES logs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='渔获明细表';

-- 钓点评价表
CREATE TABLE spot_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    spot_id BIGINT UNSIGNED NOT NULL COMMENT '钓点 ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
    rating TINYINT NOT NULL COMMENT '评分 1-5',
    content TEXT DEFAULT NULL COMMENT '评价内容',
    photos JSON DEFAULT NULL COMMENT '照片 URLs',
    tags JSON DEFAULT NULL COMMENT '标签',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_spot_user (spot_id, user_id),
    INDEX idx_spot_id (spot_id),
    INDEX idx_rating (rating),
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钓点评价表';

-- 二手商品表
CREATE TABLE items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '卖家 ID',
    category TINYINT NOT NULL COMMENT '分类 1-拟饵 2-竿子 3-轮子 4-线组 5-配件 6-其他',
    sub_category VARCHAR(50) DEFAULT NULL COMMENT '子分类',
    brand VARCHAR(100) DEFAULT NULL COMMENT '品牌',
    model VARCHAR(100) DEFAULT NULL COMMENT '型号',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    description TEXT DEFAULT NULL COMMENT '详细描述',
    condition TINYINT NOT NULL COMMENT '成色 1-全新 2-95 新 3-9 新 4-8 新 5-7 新 6-战斗成色',
    price DECIMAL(10,2) NOT NULL COMMENT '售价',
    original_price DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
    photos JSON NOT NULL COMMENT '照片 URLs',
    video_url VARCHAR(255) DEFAULT NULL COMMENT '视频 URL',
    province VARCHAR(50) NOT NULL COMMENT '省',
    city VARCHAR(50) NOT NULL COMMENT '市',
    shipping TINYINT DEFAULT 1 COMMENT '物流 1-包邮 2-不包邮 3-面议',
    status TINYINT DEFAULT 1 COMMENT '状态 1-在售 2-已售出 3-已下架',
    view_count INT DEFAULT 0 COMMENT '浏览数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    inquiry_count INT DEFAULT 0 COMMENT '咨询数',
    sold_at TIMESTAMP DEFAULT NULL COMMENT '售出时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_price (price),
    INDEX idx_location (province, city),
    INDEX idx_created (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='二手商品表';

-- 消息表
CREATE TABLE messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL COMMENT '会话 ID',
    sender_id BIGINT UNSIGNED NOT NULL COMMENT '发送者 ID',
    receiver_id BIGINT UNSIGNED NOT NULL COMMENT '接收者 ID',
    type TINYINT DEFAULT 1 COMMENT '类型 1-文本 2-图片 3-商品卡片 4-钓点卡片',
    content TEXT NOT NULL COMMENT '消息内容',
    media_url VARCHAR(255) DEFAULT NULL COMMENT '媒体 URL',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id, created_at DESC),
    INDEX idx_receiver (receiver_id, is_read, created_at DESC),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- 视频表
CREATE TABLE videos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '上传者 ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    description TEXT DEFAULT NULL COMMENT '描述',
    video_url VARCHAR(255) NOT NULL COMMENT '视频 URL',
    cover_url VARCHAR(255) DEFAULT NULL COMMENT '封面 URL',
    duration INT DEFAULT NULL COMMENT '时长 (秒)',
    spot_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联钓点 ID',
    spot_name VARCHAR(100) DEFAULT NULL COMMENT '关联钓点名称',
    lures_used JSON DEFAULT NULL COMMENT '使用拟饵',
    tags JSON DEFAULT NULL COMMENT '标签',
    play_count INT DEFAULT 0 COMMENT '播放数',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    source TINYINT DEFAULT 1 COMMENT '来源 1-用户上传 2-运营上传',
    status TINYINT DEFAULT 0 COMMENT '状态 0-审核中 1-已发布 2-已下架',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at DESC),
    INDEX idx_play_count (play_count DESC),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (spot_id) REFERENCES spots(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频表';

-- 资讯表
CREATE TABLE articles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '标题',
    summary VARCHAR(500) DEFAULT NULL COMMENT '摘要',
    content TEXT DEFAULT NULL COMMENT '内容',
    cover_url VARCHAR(255) DEFAULT NULL COMMENT '封面图',
    source_name VARCHAR(100) NOT NULL COMMENT '来源名称',
    source_url VARCHAR(500) DEFAULT NULL COMMENT '原文链接',
    author VARCHAR(100) DEFAULT NULL COMMENT '作者',
    category TINYINT DEFAULT 1 COMMENT '分类 1-新闻 2-赛事 3-评测 4-教学 5-新品',
    tags JSON DEFAULT NULL COMMENT '标签',
    view_count INT DEFAULT 0 COMMENT '阅读数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    crawl_source VARCHAR(50) DEFAULT NULL COMMENT '抓取来源标识',
    crawl_time TIMESTAMP DEFAULT NULL COMMENT '抓取时间',
    status TINYINT DEFAULT 1 COMMENT '状态 1-已发布 0-隐藏',
    is_recommend TINYINT DEFAULT 0 COMMENT '是否推荐',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP DEFAULT NULL COMMENT '发布时间',
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_recommend (is_recommend),
    INDEX idx_published (published_at DESC),
    INDEX idx_crawl_time (crawl_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资讯表';

-- 收藏表
CREATE TABLE favorites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
    target_type TINYINT NOT NULL COMMENT '类型 1-作钓记录 2-钓点 3-二手商品 4-视频 5-资讯',
    target_id BIGINT UNSIGNED NOT NULL COMMENT '目标 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_target (user_id, target_type, target_id),
    INDEX idx_user_id (user_id),
    INDEX idx_target (target_type, target_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 点赞表
CREATE TABLE likes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
    target_type TINYINT NOT NULL COMMENT '类型 1-作钓记录 2-钓点评价 3-二手商品 4-视频 5-评论',
    target_id BIGINT UNSIGNED NOT NULL COMMENT '目标 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_target (user_id, target_type, target_id),
    INDEX idx_target (target_type, target_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';

-- 关注表
CREATE TABLE follows (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT UNSIGNED NOT NULL COMMENT '关注者 ID',
    following_id BIGINT UNSIGNED NOT NULL COMMENT '被关注者 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follower_following (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注表';

-- 评论表
CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
    target_type TINYINT NOT NULL COMMENT '类型 1-作钓记录 2-视频 3-资讯 4-二手商品',
    target_id BIGINT UNSIGNED NOT NULL COMMENT '目标 ID',
    parent_id BIGINT UNSIGNED DEFAULT NULL COMMENT '父评论 ID',
    content TEXT NOT NULL COMMENT '评论内容',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    status TINYINT DEFAULT 1 COMMENT '状态 1-正常 0-隐藏',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_target (target_type, target_id, created_at),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 管理员表
CREATE TABLE admins (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '关联用户 ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    role TINYINT DEFAULT 1 COMMENT '角色 1-超级管理员 2-内容审核 3-运营',
    permissions JSON DEFAULT NULL COMMENT '权限列表',
    status TINYINT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    last_login_at TIMESTAMP DEFAULT NULL,
    last_login_ip VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 操作日志表
CREATE TABLE admin_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT UNSIGNED NOT NULL COMMENT '管理员 ID',
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    target_type VARCHAR(50) DEFAULT NULL COMMENT '目标类型',
    target_id BIGINT UNSIGNED DEFAULT NULL COMMENT '目标 ID',
    details JSON DEFAULT NULL COMMENT '操作详情',
    ip VARCHAR(50) DEFAULT NULL COMMENT 'IP 地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin (admin_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员操作日志表';

-- 插入默认管理员 (密码：admin123, 实际使用请修改)
-- INSERT INTO users (openid, nickname, is_admin) VALUES ('admin_openid', '系统管理员', 1);
-- INSERT INTO admins (user_id, username, password_hash, role) VALUES (1, 'admin', '$2b$10$...', 1);
