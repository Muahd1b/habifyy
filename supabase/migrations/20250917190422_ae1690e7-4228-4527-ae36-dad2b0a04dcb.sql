-- Fix create_payment_function search_path
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