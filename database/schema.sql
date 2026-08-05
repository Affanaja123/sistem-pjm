-- Database: spmi_audit
-- Create database
CREATE DATABASE IF NOT EXISTS spmi_audit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spmi_audit;

-- CMS Contents table
CREATE TABLE IF NOT EXISTS cms_contents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_key VARCHAR(50) NOT NULL,
    field_name VARCHAR(50) NOT NULL,
    content_value TEXT,
    is_active TINYINT(1) DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX unique_field (section_key, field_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin Konten table
CREATE TABLE IF NOT EXISTS admin_konten (
    id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin konten user
-- Run api/setup.php to generate real hashed passwords
-- Default credentials: adminkonten@pjm.ac.id / adminkonten123