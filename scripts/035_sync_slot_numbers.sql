-- Sync slot_number from teams table to scrim_requests where scrim_requests.slot_number is NULL
UPDATE scrim_requests sr
SET slot_number = t.slot_number
FROM teams t
WHERE sr.team_id = t.id
  AND sr.slot_number IS NULL
  AND t.slot_number IS NOT NULL;

-- Verify the result
SELECT sr.slot_number as req_slot, t.slot_number as team_slot, t.team_name, sr.status
FROM scrim_requests sr
JOIN teams t ON t.id = sr.team_id
ORDER BY sr.created_at DESC;
