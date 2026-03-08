-- 1. დაამატეთ ბანის ვადის სვეტი profiles ცხრილში (თუ არ არსებობს)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_until timestamp with time zone;

-- 2. თავიდან შევქმნათ კავშირი teams-სა და profiles-ს შორის Schema Cache-ის პრობლემის მოსაგვარებლად
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_leader_id_fkey;

ALTER TABLE public.teams
ADD CONSTRAINT teams_leader_id_fkey
FOREIGN KEY (leader_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 3. Schema ქეშის გადატვირთვა PostgREST-ისთვის, რათა დაინახოს ახალი კავშირები
NOTIFY pgrst, 'reload schema';
