-- Add logo_required and registration_status fields to schedules table
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS logo_required BOOLEAN DEFAULT FALSE;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'open' CHECK (registration_status IN ('open', 'vip_only', 'closed'));

-- Migrate existing registration_open data to registration_status
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'schedules' AND column_name = 'registration_open'
    ) THEN
        UPDATE schedules 
        SET registration_status = CASE 
            WHEN registration_open = TRUE THEN 'open' 
            ELSE 'closed' 
        END;
        
        -- Optionally remove registration_open after migration
        -- ALTER TABLE schedules DROP COLUMN registration_open;
    END IF;
END $$;
