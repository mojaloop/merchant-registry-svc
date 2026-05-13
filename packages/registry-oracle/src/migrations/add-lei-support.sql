-- Migration: Add LEI support to registry oracle
-- Description: Add indexes and optimize for LEI lookups
-- Date: 2024-01-17

-- Add composite index for LEI lookups (alias_type + alias_value)
-- This will speed up LEI -> FSP lookups significantly
CREATE INDEX IF NOT EXISTS idx_registry_lei_lookup 
ON registry (alias_type, alias_value) 
WHERE alias_type = 'LEI';

-- Add index for merchant_id lookups (useful for sync operations)
CREATE INDEX IF NOT EXISTS idx_registry_merchant_id 
ON registry (merchant_id) 
WHERE merchant_id IS NOT NULL;

-- Add index for fspId lookups (useful for reverse lookups)
CREATE INDEX IF NOT EXISTS idx_registry_fsp_id 
ON registry (fspId);

-- Add index for alias_type to speed up filtering
CREATE INDEX IF NOT EXISTS idx_registry_alias_type 
ON registry (alias_type);

-- Optional: Add check constraint to ensure LEI format is correct
-- Uncomment if you want database-level LEI validation
-- ALTER TABLE registry 
-- ADD CONSTRAINT chk_lei_format 
-- CHECK (alias_type != 'LEI' OR (alias_value REGEXP '^[A-Z0-9]{20}$'));

-- Verify indexes were created
SHOW INDEX FROM registry WHERE Key_name LIKE 'idx_registry_%';