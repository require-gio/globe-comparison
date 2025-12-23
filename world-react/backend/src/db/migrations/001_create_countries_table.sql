-- Migration: Create countries table
-- Version: 001
-- Date: 2025-10-09

CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  iso_code VARCHAR(3) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  official_name VARCHAR(255),
  capital VARCHAR(255),
  population BIGINT,
  area_km2 DECIMAL(15, 2),
  continent VARCHAR(50),
  currency_code VARCHAR(3),
  currency_name VARCHAR(100),
  languages TEXT[],
  flag_emoji VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on iso_code for faster lookups
CREATE INDEX idx_countries_iso_code ON countries(iso_code);

-- Create index on name for search functionality
CREATE INDEX idx_countries_name ON countries(name);

-- Add comment to table
COMMENT ON TABLE countries IS 'Stores country information for the interactive globe application';
COMMENT ON COLUMN countries.iso_code IS 'ISO 3166-1 alpha-3 country code';
COMMENT ON COLUMN countries.area_km2 IS 'Area in square kilometers';
COMMENT ON COLUMN countries.languages IS 'Array of official languages';
