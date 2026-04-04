
CREATE TYPE public.order_status AS ENUM ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled');

CREATE TYPE public.payment_method AS ENUM ('InstaPay', 'Vodafone Cash', 'Cash on Delivery');

CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image TEXT DEFAULT '',
  gender TEXT NOT NULL DEFAULT 'Unisex' CHECK (gender IN ('Men', 'Women', 'Unisex')),
  scent_family TEXT NOT NULL DEFAULT 'Woody',
  sizes TEXT[] NOT NULL DEFAULT ARRAY['50ml', '100ml'],
  notes JSONB NOT NULL DEFAULT '{"top":[],"heart":[],"base":[]}',
  description TEXT DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  discount_percent INTEGER NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  status public.order_status NOT NULL DEFAULT 'Pending',
  payment_method public.payment_method NOT NULL,
  payment_screenshot TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  discount_code TEXT,
  is_fake BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_brand TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products can be inserted" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products can be updated" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Products can be deleted" ON public.products FOR DELETE USING (true);

CREATE POLICY "Discounts are publicly readable" ON public.discounts FOR SELECT USING (true);
CREATE POLICY "Discounts can be managed" ON public.discounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Discounts can be updated" ON public.discounts FOR UPDATE USING (true);
CREATE POLICY "Discounts can be deleted" ON public.discounts FOR DELETE USING (true);

CREATE POLICY "Orders can be created" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders are readable" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders can be updated" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Orders can be deleted" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Order items are readable" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Order items can be inserted" ON public.order_items FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
