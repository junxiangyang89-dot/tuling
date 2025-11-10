package com.example.webpj.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * 启动时检查数据库连接是否为可读可写模式，并记录警告。
 */
@Component
@Order(1)
public class DatabaseConfigChecker implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            boolean readOnly = conn.isReadOnly();
            System.out.println("数据库连接 readOnly=" + readOnly);
            if (readOnly) {
                System.out.println("警告：数据库连接为只读模式，请检查数据源配置，确保教师账户具有写权限。");
            } else {
                System.out.println("数据库连接为可写模式。");
            }
        } catch (Exception e) {
            System.out.println("检查数据库连接失败: " + e.getMessage());
        }
    }
}
