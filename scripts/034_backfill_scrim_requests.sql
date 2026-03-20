-- =============================================================
-- 034: BACKFILL scrim_requests for existing teams
-- This fixes the core issue: teams exist but scrim_requests is empty
-- because the registration form was NOT inserting into scrim_requests.
-- =============================================================

-- Step 1: See what teams exist with a schedule_id
SELECT 
  t.id as team_id,
  t.team_name,
  t.status as team_status,
  t.schedule_id,
  s.title as schedule_title,
  s.is_active,
  p.email as leader_email
FROM teams t
LEFT JOIN schedules s ON s.id = t.schedule_id
LEFT JOIN profiles p ON p.id = t.leader_id
WHERE t.schedule_id IS NOT NULL
ORDER BY t.created_at DESC;

-- Step 2: Backfill scrim_requests for all teams that have a schedule_id
-- but NO existing scrim_request (avoids duplicates due to UNIQUE constraint)
INSERT INTO scrim_requests (team_id, schedule_id, status, preferred_maps)
SELECT 
  t.id,
  t.schedule_id,
  t.status,      -- carry over pending/approved/rejected from team
  COALESCE(t.maps_count, 1)
FROM teams t
WHERE 
  t.schedule_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM scrim_requests sr
    WHERE sr.team_id = t.id AND sr.schedule_id = t.schedule_id
  );

-- Step 3: Verify the result
SELECT sr.status, sr.slot_number, t.team_name, s.title as schedule, p.email
FROM scrim_requests sr
JOIN teams t ON t.id = sr.team_id
JOIN schedules s ON s.id = sr.schedule_id
JOIN profiles p ON p.id = t.leader_id
ORDER BY sr.created_at DESC;
