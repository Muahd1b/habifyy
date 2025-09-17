-- Fix remaining function search_path security issues

-- Fix update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix handle_notification_preferences function  
DROP FUNCTION IF EXISTS public.handle_notification_preferences();
CREATE OR REPLACE FUNCTION public.handle_notification_preferences()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix update_notification_updated_at function
DROP FUNCTION IF EXISTS public.update_notification_updated_at();
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix create_payment_function (set proper security)
DROP FUNCTION IF EXISTS public.create_payment_function();
CREATE OR REPLACE FUNCTION public.create_payment_function()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'Edge function placeholder - actual implementation will be in create-payment/index.ts';
END;
$$;