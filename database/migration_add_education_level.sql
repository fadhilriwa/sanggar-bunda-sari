-- Migration script to add education_level and school fields to existing students table
-- Run this if you already have a database with students table
-- Note: If column already exists, you'll get an error. That's okay, just ignore it.

USE sanggar_bunda_sari;

-- Add education_level column
-- If you get "Duplicate column name" error, the column already exists - you can ignore it
ALTER TABLE students 
ADD COLUMN education_level VARCHAR(20) DEFAULT NULL AFTER age;

-- Add school_sd column
ALTER TABLE students 
ADD COLUMN school_sd VARCHAR(200) DEFAULT NULL AFTER education_level;

-- Add school_smp column
ALTER TABLE students 
ADD COLUMN school_smp VARCHAR(200) DEFAULT NULL AFTER school_sd;

-- Add school_smp_address column
ALTER TABLE students 
ADD COLUMN school_smp_address TEXT DEFAULT NULL AFTER school_smp;

