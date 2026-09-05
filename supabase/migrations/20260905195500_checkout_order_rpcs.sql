-- Checkout helpers: create pending orders and mark paid without service-role table writes from the app.

CREATE OR REPLACE FUNCTION public.af_create_pending_order(
  p_email text,
  p_user_id uuid,
  p_total_cents integer,
  p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_product record;
  v_qty integer;
  v_computed_total integer := 0;
BEGIN
  IF p_email IS NULL OR position('@' in p_email) = 0 THEN
    RAISE EXCEPTION 'valid email required';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'items required';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := COALESCE((v_item->>'quantity')::int, 0);
    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'invalid quantity';
    END IF;

    SELECT id, name, slug, price_cents, stock, active
      INTO v_product
    FROM public.af_products
    WHERE id = (v_item->>'product_id')::uuid
    FOR UPDATE;

    IF NOT FOUND OR v_product.active IS NOT TRUE OR v_product.stock < v_qty THEN
      RAISE EXCEPTION 'product unavailable: %', v_item->>'product_id';
    END IF;

    v_computed_total := v_computed_total + (v_product.price_cents * v_qty);
  END LOOP;

  INSERT INTO public.af_orders (user_id, email, status, total_cents)
  VALUES (p_user_id, lower(trim(p_email)), 'pending', v_computed_total)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::int;
    SELECT id, name, slug, price_cents
      INTO v_product
    FROM public.af_products
    WHERE id = (v_item->>'product_id')::uuid;

    INSERT INTO public.af_order_items (
      order_id, product_id, product_name, product_slug, quantity, unit_price_cents
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.slug,
      v_qty,
      v_product.price_cents
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.af_attach_stripe_session(
  p_order_id uuid,
  p_session_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.af_orders
  SET stripe_session_id = p_session_id,
      updated_at = now()
  WHERE id = p_order_id
    AND status = 'pending';
END;
$$;

CREATE OR REPLACE FUNCTION public.af_mark_order_paid_by_session(
  p_session_id text,
  p_payment_intent_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  UPDATE public.af_orders
  SET status = 'paid',
      stripe_payment_intent_id = COALESCE(p_payment_intent_id, stripe_payment_intent_id),
      updated_at = now()
  WHERE stripe_session_id = p_session_id
    AND status = 'pending'
  RETURNING id INTO v_order_id;

  IF v_order_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.af_products p
  SET stock = GREATEST(0, p.stock - oi.quantity),
      updated_at = now()
  FROM public.af_order_items oi
  WHERE oi.order_id = v_order_id
    AND oi.product_id = p.id;
END;
$$;

REVOKE ALL ON FUNCTION public.af_create_pending_order(text, uuid, integer, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.af_attach_stripe_session(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.af_mark_order_paid_by_session(text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.af_create_pending_order(text, uuid, integer, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.af_attach_stripe_session(uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.af_mark_order_paid_by_session(text, text) TO anon, authenticated, service_role;
