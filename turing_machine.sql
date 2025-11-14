-- Set the correct character set
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create database if not exists
-- DROP DATABASE IF EXISTS turing_machine_learning;
-- CREATE DATABASE IF NOT EXISTS turing_machine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE turing_machine_learning;

-- -- Create game mode table
-- DROP TABLE IF EXISTS game_mode;
-- CREATE TABLE IF NOT EXISTS game_mode (
--     id BIGINT PRIMARY KEY AUTO_INCREMENT,
--     mode_name VARCHAR(50) NOT NULL UNIQUE,
--     description VARCHAR(500),
--     is_active BOOLEAN DEFAULT FALSE,
--     create_time DATETIME NOT NULL,
--     update_time DATETIME NOT NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- Create level table
-- DROP TABLE IF EXISTS level;
-- CREATE TABLE IF NOT EXISTS level (
--     id BIGINT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(100) NOT NULL,
--     type VARCHAR(50) NOT NULL,
--     description VARCHAR(500),
--     mode_type VARCHAR(50) NOT NULL,
--     difficulty INT NOT NULL,
--     initial_state VARCHAR(255),
--     target_state VARCHAR(255),
--     hints VARCHAR(500),
--     solution TEXT,
--     order_num INT NOT NULL,
--     is_locked BOOLEAN DEFAULT TRUE,
--     create_time DATETIME NOT NULL,
--     update_time DATETIME NOT NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure level table exists (uncommented)
DROP TABLE IF EXISTS level;
CREATE TABLE IF NOT EXISTS level (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    mode_type VARCHAR(50) NOT NULL,
    difficulty INT NOT NULL,
    initial_state VARCHAR(255),
    target_state VARCHAR(255),
    hints VARCHAR(500),
    solution TEXT,
    order_num INT NOT NULL,
    is_locked BOOLEAN DEFAULT TRUE,
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create turing machine table
DROP TABLE IF EXISTS turing_machine;
CREATE TABLE IF NOT EXISTS turing_machine (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    -- level_id BIGINT,
    user_id BIGINT NOT NULL,
    name VARCHAR(255),
    description VARCHAR(255),
    tape VARCHAR(255),
    head_position INT NOT NULL,
    current_state VARCHAR(50),
    configuration TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    execution_log TEXT,
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL
    -- FOREIGN KEY (level_id) REFERENCES level(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO turing_machine (user_id, name, description, tape, head_position, current_state, configuration, is_completed, execution_log, create_time, update_time) VALUES
(1, 'Basic Addition', 'Learn how to perform simple addition like 1+1=2 using a Turing machine', '101', 0, 'q0', '{"states":["q0","q1","q2"],"transitions":[...]}', FALSE, '[]', NOW(), NOW());
-- Create submission table
-- DROP TABLE IF EXISTS submission;
-- CREATE TABLE IF NOT EXISTS submission (
--     id BIGINT PRIMARY KEY AUTO_INCREMENT,
--     user_id BIGINT NOT NULL,
--     level_id BIGINT,
--     solution TEXT,
--     is_correct BOOLEAN,
--     feedback VARCHAR(255),
--     attempts INT DEFAULT 1,
--     time_spent BIGINT,
--     create_time DATETIME NOT NULL,
--     update_time DATETIME NOT NULL,
--     FOREIGN KEY (level_id) REFERENCES level(id) ON DELETE SET NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- Insert game mode sample data
-- INSERT INTO game_mode (mode_name, description, is_active, create_time, update_time) VALUES
-- ('FREE', 'Free Mode: Create and edit Turing machines freely, perfect for practice and exploration', TRUE, NOW(), NOW()),
-- ('LEARN', 'Learning Mode: Step-by-step tutorials to learn Turing machine concepts', FALSE, NOW(), NOW()),
-- ('CHALLENGE', 'Challenge Mode: Complete various Turing machine programming challenges', FALSE, NOW(), NOW());

-- -- Insert level sample data - Learning Mode
-- INSERT INTO level (name, type, description, mode_type, difficulty, initial_state, target_state, hints, solution, order_num, is_locked, create_time, update_time) VALUES
-- ('Basic Addition', 'ADDITION', 'Learn how to perform simple addition like 1+1=2 using a Turing machine', 'LEARN', 1, '1+1=', '1+1=2', 'Think about how to move the head and record numbers', '{"states":["q0","q1","q2"],"transitions":[...]}', 1, FALSE, NOW(), NOW()),
-- ('Parentheses Matching', 'PARENTHESES', 'Check if a sequence of parentheses is properly matched', 'LEARN', 2, '((()))', 'TRUE', 'Use states to keep track of encountered left parentheses', '{"states":["q0","q1","q2"],"transitions":[...]}', 2, TRUE, NOW(), NOW()),
-- ('Binary Addition', 'BINARY_ADDITION', 'Perform binary number addition', 'LEARN', 3, '101+11=', '101+11=1000', 'Consider carry handling', '{"states":["q0","q1","q2"],"transitions":[...]}', 3, TRUE, NOW(), NOW());

-- -- Insert level sample data - Challenge Mode
-- INSERT INTO level (name, type, description, mode_type, difficulty, initial_state, target_state, hints, solution, order_num, is_locked, create_time, update_time) VALUES
-- ('Palindrome Check', 'PALINDROME', 'Determine if a given string is a palindrome', 'CHALLENGE', 2, 'abcba', 'TRUE', 'Compare characters from both ends simultaneously', '{"states":["q0","q1","q2"],"transitions":[...]}', 1, FALSE, NOW(), NOW()),
-- ('Three Number Sum', 'ADDITION', 'Calculate the sum of three numbers', 'CHALLENGE', 3, '1+2+3=', '1+2+3=6', 'Break down into multiple two-number additions', '{"states":["q0","q1","q2"],"transitions":[...]}', 2, TRUE, NOW(), NOW()),
-- ('Multiplication', 'MULTIPLICATION', 'Implement multiplication of two numbers', 'CHALLENGE', 4, '3*4=', '3*4=12', 'Consider using repeated addition', '{"states":["q0","q1","q2"],"transitions":[...]}', 3, TRUE, NOW(), NOW());

-- Insert turing machine sample data
-- INSERT INTO turing_machine (user_id, tape, head_position, current_state, configuration, is_completed, execution_log, create_time, update_time) VALUES
-- (1, '10101', 0, 'q0', '{"states":["q0","q1","q2"],"transitions":[...]}', FALSE, '[]', NOW(), NOW()),
-- (1, '11111', 0, 'q0', '{"states":["q0","q1","q2"],"transitions":[...]}', FALSE, '[]', NOW(), NOW());

-- -- Insert submission sample data
-- INSERT INTO submission (user_id, level_id, solution, is_correct, feedback, attempts, time_spent, create_time, update_time) VALUES
-- (1, 1, '{"states":["q0","q1","q2"],"transitions":[...]}', TRUE, 'Perfect solution!', 1, 120000, NOW(), NOW()),
-- (1, 2, '{"states":["q0","q1","q2"],"transitions":[...]}', FALSE, 'Check parentheses matching logic', 2, 180000, NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1; 

-- 挑战题目表（用于保存学生提交的优秀作业并供教师审核）
DROP TABLE IF EXISTS challenge_question;
CREATE TABLE IF NOT EXISTS challenge_question (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    testcase_json TEXT,
    creator_user_id BIGINT,
    creator_username VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;