-- 默认每次 source 的时候都重建表格
-- 默认插入数据使用 POST ，以确保正确加密密码

DROP TABLE if exists `sys_user`;
CREATE TABLE `sys_user` (
                            `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                            `username` varchar(50) NOT NULL COMMENT '用户名',
                            `password` varchar(100) NOT NULL COMMENT '密码，明文插入，密文保存',
                            `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
                            `role` varchar(20) DEFAULT 'STUDENT' COMMENT '用户角色 STUDENT/TEACHER',
                            `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
                            `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
                            `status` tinyint(1) DEFAULT '1' COMMENT '状态 0-禁用 1-正常',
                            `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                            `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                                        `role` varchar(20) DEFAULT 'STUDENT' COMMENT '用户角色：STUDENT/TEACHER',
                            PRIMARY KEY (`id`),
                            UNIQUE KEY `idx_username` (`username`),
                            UNIQUE KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 操作日志表，用于记录敏感操作（如删除）
DROP TABLE IF EXISTS `operation_log`;
CREATE TABLE `operation_log` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL,
    `action` varchar(100) NOT NULL,
    `target_id` bigint DEFAULT NULL,
    `details` text,
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作审计日志表';