-- =============================================
-- DIAMOND PERFUME - DATABASE SCHEMA BACKUP
-- Date: 2026-04-10
-- Project: cfpiizuovdhbbgkugxyy (Supabase)
-- =============================================

-- ENUMS
CREATE TYPE public.order_status AS ENUM ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled');
CREATE TYPE public.payment_method AS ENUM ('InstaPay', 'Vodafone Cash', 'Cash on Delivery');

-- TABLES

CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.discounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text,
  description text,
  discount_percent numeric NOT NULL,
  discount_amount numeric,
  min_order_amount numeric,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.governorate_shipping_rules (
  governorate text NOT NULL PRIMARY KEY,
  is_free bool NOT NULL DEFAULT false,
  shipping_fee numeric NOT NULL DEFAULT 15 CHECK (shipping_fee >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  arrival_eta text NOT NULL DEFAULT '3-5 business days'
);

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  brand text NOT NULL,
  price numeric NOT NULL,
  stock numeric NOT NULL,
  description text,
  gender text NOT NULL,
  scent_family text NOT NULL,
  sizes jsonb NOT NULL,
  notes jsonb NOT NULL,
  image text,
  discount_percent numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  subtotal numeric NOT NULL,
  shipping_cost numeric NOT NULL,
  discount_amount numeric NOT NULL,
  total numeric NOT NULL,
  discount_code text,
  payment_method payment_method NOT NULL,
  payment_screenshot text,
  admin_notes text,
  status order_status NOT NULL DEFAULT 'Pending',
  is_fake bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  product_brand text NOT NULL,
  size text NOT NULL,
  quantity numeric NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL
);

CREATE TABLE public.store_settings (
  id int NOT NULL DEFAULT 1 PRIMARY KEY CHECK (id = 1),
  shipping_is_free bool NOT NULL DEFAULT false,
  shipping_fee numeric NOT NULL DEFAULT 15 CHECK (shipping_fee >= 0),
  delivery_eta text NOT NULL DEFAULT '3-5 business days',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS POLICIES

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view admins" ON public.admins FOR SELECT TO authenticated USING (true);

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage discounts" ON public.discounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can view discounts" ON public.discounts FOR SELECT TO public USING (true);

ALTER TABLE public.governorate_shipping_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage governorate shipping rules" ON public.governorate_shipping_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can view governorate shipping rules" ON public.governorate_shipping_rules FOR SELECT TO public USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can view products" ON public.products FOR SELECT TO public USING (true);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage store settings" ON public.store_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT TO public USING (true);

-- RLS DISABLED (orders/order_items open to anon for customer checkout)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- FUNCTIONS

CREATE OR REPLACE FUNCTION public.decrement_product_stock_on_order_item_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
begin
  if new.quantity is null or new.quantity <= 0 then
    raise exception 'Invalid quantity for product %', new.product_id;
  end if;
  update public.products
  set stock = stock - new.quantity,
      updated_at = now()
  where id = new.product_id
    and stock >= new.quantity;
  if not found then
    raise exception 'Out of stock for product %', new.product_id;
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.authenticate_admin(p_identifier text, p_password text)
RETURNS TABLE(admin_id uuid, username text)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  select a.id, a.username
  from public.admins a
  where lower(a.username) = lower(trim(p_identifier))
    and a.password_hash = p_password
  limit 1;
$$;

-- TRIGGERS

CREATE TRIGGER trg_decrement_product_stock_on_order_item_insert
BEFORE INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.decrement_product_stock_on_order_item_insert();
