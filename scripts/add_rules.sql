-- Run this in Supabase SQL Editor to add rules
-- This version also ensures RLS is correctly set up

-- 1. Refresh Table Structure
CREATE TABLE IF NOT EXISTS public.rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clear existing and Insert new
TRUNCATE public.rules;

INSERT INTO public.rules (title, content, order_number)
VALUES 
('Anti-Cheat Protocol', 'ნებისმიერი ტიპის დამხმარე პროგრამის (Cheats, Scripts, Macros) გამოყენება მკაცრად აკრძალულია. დარღვევის შემთხვევაში მოთამაშე და გუნდი მიიღებს სამუდამო ბანს Arena-ს ყველა ტურნირზე.', 1),
('Professional Conduct', 'გუნდებმა უნდა დაიცვან ეთიკის ნორმები. შეურაცხყოფა, ტოქსიკურობა ან არასპორტული ქცევა გამოიწვევს გუნდის დისკვალიფიკაციას და ქულების ჩამორთმევას.', 2),
('Match Readiness', 'ყველა გუნდი ვალდებულია მატჩის დაწყებამდე 10 წუთით ადრე იყოს ლობიში. დაგვიანების შემთხვევაში გუნდი შესაძლოა ჩაენაცვლოს სხვა გუნდით.', 3),
('Registration Deadline', 'სკრიმებზე რეგისტრაცია წყდება მატჩის დაწყებამდე 2 საათით ადრე. ამ დროის შემდეგ მოთხოვნები აღარ განიხილება.', 4),
('Team Requirements', 'გუნდი უნდა შედგებოდეს მინიმუმ 4 ძირითადი მოთამაშისგან. დაუშვებელია სხვა გუნდის მოთამაშეების გამოყენება (Ringer) ადმინისტრაციასთან შეთანხმების გარეშე.', 5);

-- 3. FIX RLS (Row Level Security) - This ensures everyone can See rules
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view rules" ON public.rules;
CREATE POLICY "Anyone can view rules" ON public.rules FOR SELECT USING (true);

-- 4. Reload and Verify
NOTIFY pgrst, 'reload schema';
SELECT * FROM public.rules ORDER BY order_number;


