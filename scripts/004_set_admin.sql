-- შეცვალეთ 'your-email@example.com' თქვენი რეგისტრირებული იმეილით
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';
