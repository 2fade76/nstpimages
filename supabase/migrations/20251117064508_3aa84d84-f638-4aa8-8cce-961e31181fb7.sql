-- Create enum type for assignment categories (3 options only)
CREATE TYPE assignment_category AS ENUM ('News', 'Sports', 'Entertainment');

-- Add category column to assignments table with default value
ALTER TABLE assignments 
ADD COLUMN category assignment_category NOT NULL DEFAULT 'News';

-- Add index for better query performance when filtering by category
CREATE INDEX idx_assignments_category ON assignments(category);