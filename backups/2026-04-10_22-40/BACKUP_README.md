# Diamond Perfume — Full Backup
**Date:** 2026-04-10 22:40  
**Project:** Diamond Perfume (diamondperfume.vercel.app)  
**Supabase Project:** cfpiizuovdhbbgkugxyy  
**GitHub:** https://github.com/nourjudoka/Diamond-perfumes

---

## Contents

| File | Description |
|---|---|
| `db_schema.sql` | Full DB schema: tables, enums, RLS policies, functions, triggers |
| `data_products.json` | All 29 products with images, prices, stock |
| `data_orders.json` | All 6 orders |
| `data_order_items.json` | All 2 order items |
| `data_discounts.json` | Discounts / promo codes |
| `data_store_settings.json` | Shipping fee, delivery ETA settings |
| `data_governorate_shipping_rules.json` | All 27 Egyptian governorate shipping rules |
| `data_admins.json` | Admin users (passwords stored as hashes) |
| `source_code.zip` | Full website source code (5.7 MB, 117 files, excl. node_modules) |

---

## How to Restore

### Database
1. Create a new Supabase project.
2. Run `db_schema.sql` in the SQL editor.
3. Import each `data_*.json` file into the matching table.

### Website
1. Extract `source_code.zip`.
2. Run `npm install` to restore dependencies.
3. Update `.env` with new Supabase URL + key.
4. Deploy to Vercel.

---

## Key Info
- **Live URL:** https://diamondperfume.vercel.app/
- **Admin Login:** https://diamondperfume.vercel.app/staff-access
- **Admin users:** adminnour / adminkareem
- **Supabase URL:** https://cfpiizuovdhbbgkugxyy.supabase.co
