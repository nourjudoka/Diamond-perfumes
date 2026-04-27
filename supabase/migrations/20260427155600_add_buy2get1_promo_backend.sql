ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS promo_buy2get1_enabled boolean NOT NULL DEFAULT true;

UPDATE public.store_settings
SET promo_buy2get1_enabled = true
WHERE id = 1;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS promo_buy2get1_discount_amount numeric NOT NULL DEFAULT 0;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.recalculate_order_buy2get1_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  target_order_id uuid;
  promo_enabled boolean;
  calculated_subtotal numeric;
  promo_saving numeric;
BEGIN
  target_order_id := COALESCE(NEW.order_id, OLD.order_id);

  SELECT COALESCE(promo_buy2get1_enabled, true)
  INTO promo_enabled
  FROM public.store_settings
  WHERE id = 1;

  calculated_subtotal := COALESCE((
    SELECT SUM(oi.unit_price * oi.quantity)
    FROM public.order_items oi
    WHERE oi.order_id = target_order_id
  ), 0);

  IF COALESCE(promo_enabled, true) THEN
    WITH unit_prices AS (
      SELECT
        p.product_type,
        oi.unit_price::numeric AS price
      FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      CROSS JOIN generate_series(1, oi.quantity)
      WHERE oi.order_id = target_order_id
        AND p.product_type IN ('Master Box', 'Tester')
    ),
    ranked_prices AS (
      SELECT
        product_type,
        price,
        row_number() OVER (PARTITION BY product_type ORDER BY price DESC) AS rn
      FROM unit_prices
    )
    SELECT COALESCE(SUM(price), 0)
    INTO promo_saving
    FROM ranked_prices
    WHERE rn % 3 = 0;
  ELSE
    promo_saving := 0;
  END IF;

  UPDATE public.orders
  SET
    subtotal = calculated_subtotal,
    promo_buy2get1_discount_amount = promo_saving,
    total = GREATEST(
      0,
      calculated_subtotal + COALESCE(shipping_cost, 0) - COALESCE(discount_amount, 0) - promo_saving
    ),
    updated_at = now()
  WHERE id = target_order_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_recalculate_order_buy2get1_totals ON public.order_items;
CREATE TRIGGER trg_recalculate_order_buy2get1_totals
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION private.recalculate_order_buy2get1_totals();
