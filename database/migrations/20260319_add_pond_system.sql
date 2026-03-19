-- 黑坑管理系统数据库迁移
-- 添加黑坑、活动、报名相关表

USE lurebin;

-- 黑坑塘主表
CREATE TABLE pond_owners (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '关联用户 ID',
    
    -- 认证信息
    business_name VARCHAR(200) NOT NULL COMMENT '钓场名称',
    business_license VARCHAR(255) DEFAULT NULL COMMENT '营业执照 URL',
    contact_name VARCHAR(50) NOT NULL COMMENT '联系人',
    contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    contact_wechat VARCHAR(100) DEFAULT NULL COMMENT '联系微信',
    
    -- 认证状态
    verify_status TINYINT DEFAULT 0 COMMENT '认证状态 0-待审核 1-已通过 2-已拒绝',
    verify_remark TEXT DEFAULT NULL COMMENT '审核备注',
    verified_at TIMESTAMP DEFAULT NULL COMMENT '认证通过时间',
    
    -- 统计数据
    pond_count INT DEFAULT 0 COMMENT '钓场数量',
    event_count INT DEFAULT 0 COMMENT '活动数量',
    participant_count INT DEFAULT 0 COMMENT '累计报名人数',
    
    -- 信用
    credit_score INT DEFAULT 100 COMMENT '信用分',
    complaint_count INT DEFAULT 0 COMMENT '投诉次数',
    
    -- 状态
    status TINYINT DEFAULT 1 COMMENT '状态 1-正常 0-禁用',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_verify_status (verify_status),
    INDEX idx_status (status),
    
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='黑坑塘主表';

-- 黑坑钓场表
CREATE TABLE ponds (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL COMMENT '塘主 ID',
    
    -- 基本信息
    name VARCHAR(200) NOT NULL COMMENT '钓场名称',
    description TEXT DEFAULT NULL COMMENT '详细描述',
    
    -- 位置
    province VARCHAR(50) NOT NULL COMMENT '省',
    city VARCHAR(50) NOT NULL COMMENT '市',
    district VARCHAR(50) DEFAULT NULL COMMENT '区/县',
    address VARCHAR(255) NOT NULL COMMENT '详细地址',
    latitude DECIMAL(10, 7) DEFAULT NULL COMMENT '纬度',
    longitude DECIMAL(10, 7) DEFAULT NULL COMMENT '经度',
    
    -- 钓场属性
    water_type TINYINT DEFAULT 1 COMMENT '水域类型 1-池塘 2-水库 3-湖泊',
    total_area DECIMAL(10,2) DEFAULT NULL COMMENT '总面积 (亩)',
    fish_depth DECIMAL(5,2) DEFAULT NULL COMMENT '水深 (米)',
    fish_types JSON DEFAULT NULL COMMENT '鱼种 ["鲈鱼","鳜鱼"]',
    
    -- 设施
    facilities JSON DEFAULT NULL COMMENT '设施 ["停车场","厕所","餐饮","住宿","充电桩"]',
    services JSON DEFAULT NULL COMMENT '服务 ["提供饵料","提供钓椅","提供遮阳伞"]',
    
    -- 规则
    rules TEXT DEFAULT NULL COMMENT '钓场规则',
    allowed_rods INT DEFAULT 0 COMMENT '允许竿数',
    max_rod_length DECIMAL(4,1) DEFAULT NULL COMMENT '最大竿长 (米)',
    
    -- 图片
    photos JSON DEFAULT NULL COMMENT '照片 URLs',
    cover_url VARCHAR(255) DEFAULT NULL COMMENT '封面图',
    
    -- 统计
    view_count INT DEFAULT 0 COMMENT '浏览数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    event_count INT DEFAULT 0 COMMENT '活动数量',
    avg_rating DECIMAL(2,1) DEFAULT 0 COMMENT '平均评分',
    review_count INT DEFAULT 0 COMMENT '评价数',
    
    -- 状态
    status TINYINT DEFAULT 1 COMMENT '状态 1-营业中 0-已关闭',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_owner_id (owner_id),
    INDEX idx_location (province, city),
    INDEX idx_status (status),
    
    FOREIGN KEY (owner_id) REFERENCES pond_owners(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='黑坑钓场表';

-- 钓场活动表 (正钓/偷驴)
CREATE TABLE pond_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pond_id BIGINT UNSIGNED NOT NULL COMMENT '钓场 ID',
    owner_id BIGINT UNSIGNED NOT NULL COMMENT '塘主 ID',
    
    -- 活动信息
    title VARCHAR(200) NOT NULL COMMENT '活动标题',
    event_type TINYINT NOT NULL COMMENT '类型 1-正钓 2-偷驴 3-比赛 4-其他',
    description TEXT DEFAULT NULL COMMENT '活动详情',
    
    -- 时间
    event_date DATE NOT NULL COMMENT '活动日期',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    registration_deadline DATETIME DEFAULT NULL COMMENT '报名截止时间',
    
    -- 费用
    fee_amount DECIMAL(10,2) NOT NULL COMMENT '报名费用',
    deposit_amount DECIMAL(10,2) DEFAULT 0 COMMENT '押金',
    prize_pool DECIMAL(10,2) DEFAULT 0 COMMENT '总奖金',
    
    -- 规则
    fish_weight_rule VARCHAR(100) DEFAULT NULL COMMENT '计重方式 1-总重 2-单尾最重 3-尾数',
    allowed_rods INT DEFAULT 1 COMMENT '允许竿数',
    max_rod_length DECIMAL(4,1) DEFAULT NULL COMMENT '最大竿长',
    allowed_baits JSON DEFAULT NULL COMMENT '允许饵料',
    other_rules TEXT DEFAULT NULL COMMENT '其他规则',
    
    -- 名额
    max_participants INT DEFAULT 0 COMMENT '最大人数',
    current_participants INT DEFAULT 0 COMMENT '当前报名人数',
    
    -- 钓场提供
    provided_items JSON DEFAULT NULL COMMENT '提供物品 ["钓椅","遮阳伞","饮用水"]',
    
    -- 图片
    cover_url VARCHAR(255) DEFAULT NULL COMMENT '封面图',
    
    -- 状态
    status TINYINT DEFAULT 0 COMMENT '状态 0-报名中 1-已满员 2-进行中 3-已结束 4-已取消',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_pond_id (pond_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_event_date (event_date),
    INDEX idx_status (status),
    
    FOREIGN KEY (pond_id) REFERENCES ponds(id),
    FOREIGN KEY (owner_id) REFERENCES pond_owners(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钓场活动表';

-- 活动报名表
CREATE TABLE event_participants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL COMMENT '活动 ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
    
    -- 报名信息
    rod_count INT DEFAULT 1 COMMENT '竿数',
    remarks VARCHAR(500) DEFAULT NULL COMMENT '备注',
    
    -- 费用
    fee_amount DECIMAL(10,2) NOT NULL COMMENT '报名费',
    deposit_amount DECIMAL(10,2) DEFAULT 0 COMMENT '押金',
    payment_status TINYINT DEFAULT 0 COMMENT '支付状态 0-未支付 1-已支付 2-已退款',
    payment_time TIMESTAMP DEFAULT NULL COMMENT '支付时间',
    payment_method TINYINT DEFAULT 1 COMMENT '支付方式 1-微信 2-支付宝',
    
    -- 签到
    check_in_status TINYINT DEFAULT 0 COMMENT '签到状态 0-未签到 1-已签到',
    check_in_time TIMESTAMP DEFAULT NULL COMMENT '签到时间',
    
    -- 渔获
    catch_weight DECIMAL(10,2) DEFAULT NULL COMMENT '渔获重量 (斤)',
    catch_rank INT DEFAULT NULL COMMENT '排名',
    prize_amount DECIMAL(10,2) DEFAULT NULL COMMENT '奖金',
    
    -- 评价
    rating TINYINT DEFAULT NULL COMMENT '评分 1-5',
    review_content TEXT DEFAULT NULL COMMENT '评价内容',
    review_photos JSON DEFAULT NULL COMMENT '评价照片',
    
    -- 状态
    status TINYINT DEFAULT 0 COMMENT '状态 0-已报名 1-已取消 2-已完成',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_event_user (event_id, user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_payment_status (payment_status),
    
    FOREIGN KEY (event_id) REFERENCES pond_events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动报名表';

-- 钓场评价表
CREATE TABLE pond_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pond_id BIGINT UNSIGNED NOT NULL COMMENT '钓场 ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户 ID',
    event_id BIGINT UNSIGNED DEFAULT NULL COMMENT '关联活动 ID',
    
    rating TINYINT NOT NULL COMMENT '评分 1-5',
    content TEXT DEFAULT NULL COMMENT '评价内容',
    photos JSON DEFAULT NULL COMMENT '照片',
    
    -- 标签
    tags JSON DEFAULT NULL COMMENT '标签 ["鱼情好","环境好","停车方便","老板实在"]',
    
    like_count INT DEFAULT 0 COMMENT '点赞数',
    
    owner_reply TEXT DEFAULT NULL COMMENT '塘主回复',
    reply_time TIMESTAMP DEFAULT NULL COMMENT '回复时间',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_pond_id (pond_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    
    FOREIGN KEY (pond_id) REFERENCES ponds(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钓场评价表';

-- 投诉表
CREATE TABLE pond_complaints (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pond_id BIGINT UNSIGNED DEFAULT NULL COMMENT '钓场 ID',
    event_id BIGINT UNSIGNED NOT NULL COMMENT '活动 ID',
    owner_id BIGINT UNSIGNED NOT NULL COMMENT '被投诉塘主 ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '投诉人 ID',
    
    reason TINYINT NOT NULL COMMENT '投诉原因 1-虚假宣传 2-收费问题 3-服务问题 4-其他',
    content TEXT NOT NULL COMMENT '投诉内容',
    photos JSON DEFAULT NULL COMMENT '证据照片',
    
    -- 处理
    status TINYINT DEFAULT 0 COMMENT '状态 0-待处理 1-处理中 2-已解决 3-已关闭',
    admin_remark TEXT DEFAULT NULL COMMENT '管理员备注',
    resolved_at TIMESTAMP DEFAULT NULL COMMENT '解决时间',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_event_id (event_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status),
    
    FOREIGN KEY (pond_id) REFERENCES ponds(id),
    FOREIGN KEY (event_id) REFERENCES pond_events(id),
    FOREIGN KEY (owner_id) REFERENCES pond_owners(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投诉表';

-- 添加菜单权限到 admins 表
ALTER TABLE admins ADD COLUMN permissions JSON DEFAULT NULL COMMENT '权限列表' AFTER role;
