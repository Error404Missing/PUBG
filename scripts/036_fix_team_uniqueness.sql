-- 1. Remove global unique constraints for team name and tag
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_team_name_key;
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_team_tag_key;

-- 2. Add composite unique constraints per schedule
-- This allows the same team name/tag to be used across different schedules
ALTER TABLE teams ADD CONSTRAINT teams_unique_per_schedule UNIQUE (team_name, schedule_id);
ALTER TABLE teams ADD CONSTRAINT teams_tag_unique_per_schedule UNIQUE (team_tag, schedule_id);

-- 3. Verify
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'teams'::regclass;
