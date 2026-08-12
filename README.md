# 🐟 Chnemeas — Telegram Food Ordering Bot

A full-stack food ordering system for a Cambodian seafood restaurant, built as a **Telegram Mini App** with a customer-facing web app, admin panel, and Telegram bot integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TELEGRAM USERS                                  │
│   ┌──────────────┐        ┌──────────────┐       ┌──────────────┐      │
│   │   Customer   │        │   Customer   │       │    Admin     │      │
│   │  (Telegram)  │        │  (Web App)   │       │  (Telegram)  │      │
│   └──────┬───────┘        └──────┬───────┘       └──────┬───────┘      │
└──────────┼──────────────────────┼──────────────────────┼───────────────┘
           │                      │                      │
     ┌─────┴──────────────────────┴──────────────────────┴─────┐
     │                    VERCEL (Edge Network)                  │
     │  ┌──────────────────────────────────────────────────┐    │
     │  │              STATIC FILES (public/)               │    │
     │  │   ┌─────────────────┐    ┌───────────────────┐   │    │
     │  │   │  Customer SPA   │    │   Admin Panel     │   │    │
     │  │   │  (Vanilla JS)   │    │  (Vanilla JS)     │   │    │
     │  │   │  - Menu browse  │    │  - Orders (live)  │   │    │
     │  │   │  - Cart/Checkout│    │  - Analytics      │   │    │
     │  │   │  - i18n (3 lang)│    │  - Menu CRUD      │   │    │
     │  │   │  - Detail sheet │    │  - Photo upload   │   │    │
     │  │   └─────────────────┘    └───────────────────┘   │    │
     │  └──────────────────────────────────────────────────┘    │
     │  ┌──────────────────────────────────────────────────┐    │
     │  │            SERVERLESS FUNCTIONS (api/)            │    │
     │  │   ┌──────────┐  ┌───────────┐  ┌─────────────┐  │    │
     │  │   │ menu.js  │  │ checkout  │  │  webhook.js  │  │    │
     │  │   │ (public) │  │  .js      │  │ (Telegram)   │  │    │
     │  │   └──────────┘  └───────────┘  └─────────────┘  │    │
     │  │   ┌──────────┐  ┌───────────┐  ┌─────────────┐  │    │
     │  │   │ photo.js │  │upload-    │  │payment-     │  │    │
     │  │   │          │  │photo.js   │  │callback.js  │  │    │
     │  │   └──────────┘  └───────────┘  └─────────────┘  │    │
     │  │   ┌─────────────────────────────────────────┐   │    │
     │  │   │          ADMIN API (api/admin/)           │   │    │
     │  │   │   ┌──────────┐  ┌──────────┐  ┌──────┐  │   │    │
     │  │   │   │orders.js │  │ menu.js  │  │check-│  │   │    │
     │  │   │   │ (CRUD +  │  │ (CRUD +  │  │auth  │  │   │    │
     │  │   │   │  status  │  │ reorder) │  │.js   │  │   │    │
     │  │   │   │transitions│  │          │  │      │  │   │    │
     │  │   │   └──────────┘  └──────────┘  └──────┘  │   │    │
     │  │   └─────────────────────────────────────────┘   │    │
     │  └──────────────────────────────────────────────────┘    │
     └──────────────────────┬───────────────────────────────────┘
                            │
     ┌──────────────────────┴───────────────────────────────────┐
     │                   SUPABASE (PostgreSQL)                    │
     │   ┌──────────┐  ┌────────────┐  ┌────────────────────┐   │
     │   │customers │  │ categories │  │    menu_items      │   │
     │   │ (auth +  │  │ (i18n EN/  │  │  (i18n + photos)   │   │
     │   │ profiles)│  │  KH/CN)    │  │                    │   │
     │   └──────────┘  └────────────┘  └────────────────────┘   │
     │   ┌──────────┐  ┌────────────┐  ┌────────────────────┐   │
     │   │  orders  │  │order_items │  │ menu_item_variants │   │
     │   │ (status  │  │ (line      │  │ (sizes/weights/    │   │
     │   │ workflow)│  │  items)    │  │  prices)           │   │
     │   └──────────┘  └────────────┘  └────────────────────┘   │
     │   ┌──────────┐  ┌────────────┐  ┌────────────────────┐   │
     │   │  carts   │  │   admins   │  │customer_pending_   │   │
     │   │          │  │            │  │    actions         │   │
     │   └──────────┘  └────────────┘  └────────────────────┘   │
     │   ┌──────────────────────────────────────────────────┐   │
     │   │     STORAGE (menu-photos bucket — WebP images)    │   │
     │   └──────────────────────────────────────────────────┘   │
     └──────────────────────────────────────────────────────────┘
                            │
     ┌──────────────────────┴───────────────────────────────────┐
     │              TELEGRAM BOT (src/bot.js — Telegraf)         │
     │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
     │   │  Inline      │  │  Order       │  │   i18n +     │  │
     │   │  Keyboards   │  │  Notifications│  │ Localization │  │
     │   │  (approve/   │  │  (customer   │  │ (EN/KH/CN)   │  │
     │   │   reject/    │  │   receipts)  │  │              │  │
     │   │   cancel)    │  │              │  │              │  │
     │   └──────────────┘  └──────────────┘  └──────────────┘  │
     └──────────────────────────────────────────────────────────┘
```

## Order Workflow

```
                     ┌──────────────┐
                     │ Pending      │
                     │ Approval     │
                     └──────┬───────┘
                            │
                  ┌─────────┴─────────┐
                  │                   │
                  ▼                   ▼
           ┌────────────┐    ┌────────────┐
           │ Approved   │    │ Rejected   │
           └──────┬─────┘    └────────────┘
                  │
                  ▼
           ┌────────────┐
           │ Paid       │
           └──────┬─────┘
                  │
                  ▼
           ┌────────────┐
           │ Preparing  │
           └──────┬─────┘
                  │
                  ▼
           ┌────────────┐
           │ Ready      │
           └──────┬─────┘
                  │
          ┌───────┴───────┐
          │               │
          ▼               ▼
   ┌────────────┐  ┌────────────┐
   │ Fulfilled  │  │ Cancelled  │
   └────────────┘  └────────────┘
```

At any step before fulfillment, the admin can cancel the order with a reason.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JS (no framework), HTML5, CSS3 |
| **Backend API** | Node.js, Vercel Serverless Functions |
| **Bot** | Telegraf (Node.js Telegram Bot Framework) |
| **Database** | Supabase PostgreSQL |
| **Storage** | Supabase Storage (WebP images) |
| **Deployment** | Vercel (auto-deploys from GitHub `main`) |
| **i18n** | Custom translation system (English, Khmer, Chinese) |

## Project Structure

```
├── api/                          # Vercel Serverless Functions
│   ├── admin/
│   │   ├── check-auth.js         # Admin authentication check
│   │   ├── menu.js               # Menu CRUD + reorder
│   │   └── orders.js             # Order CRUD + status transitions
│   ├── checkout.js               # Place order
│   ├── menu.js                   # Public menu endpoint
│   ├── payment-callback.js       # ABA payment callback
│   ├── photo.js                  # Public photo serving
│   ├── upload-photo.js           # Menu item photo upload (WebP)
│   └── webhook.js                # Telegram webhook handler
├── public/                       # Static frontend files
│   ├── admin/
│   │   ├── index.html            # Admin panel HTML
│   │   ├── app.js                # Admin panel JS (SPA)
│   │   └── style.css             # Admin panel CSS
│   ├── assets/                   # App icons, images
│   └── index.html                # Customer web app
├── src/                          # Shared server logic
│   ├── bot.js                    # Telegraf bot — inline keyboards,
│   │                             #   notifications, text handlers
│   ├── db.js                     # PostgreSQL connection pool
│   ├── i18n.js                   # Translation helpers
│   ├── locales.js                # EN/KH/CN translation strings
│   └── payment.js                # ABA payment integration
├── scripts/                      # Dev & maintenance scripts
│   ├── dev-server.js             # Local dev server with API proxy
│   ├── setup-webhook.js          # Set Telegram webhook URL
│   └── bulk-import.js            # Bulk menu import
└── db/                           # Database migrations
```

## Admin Panel Features

The admin panel (`/admin?chat_id=...`) is a full SPA with:

- **Orders View** — Real-time polling (every 10s) with filter by status. Click any order card to open a detail sheet with:
  - Status timeline (color-coded progress through the workflow)
  - Customer info section
  - Fulfillment details (pickup time / delivery address)
  - Item breakdown with prices
  - Action buttons for each status step
  - Customer remarks
- **Analytics Dashboard** — Revenue line chart (last 7 days), popular items bar chart (top 5), orders by hour distribution, status funnel overview
- **Menu Management** — CRUD for categories, items, and variants (with i18n fields for EN/KH/CN). Drag handles on each item/category open a reorder modal with up/down arrows. Photo upload with canvas resize (max 800px, converts to WebP)
- **Authentication** — URL param `?chat_id=` validated against the `admins` table. New order count badge on the Orders nav tab.

## Customer Web App Features

- **Menu browsing** — Categories with expandable items, search with keyboard shortcut
- **Cart** — Floating cart button, slide-up cart sheet, quantity controls
- **Checkout** — Pickup or delivery, address input, customer remark, ABA QR payment
- **Language switcher** — English, Khmer, Chinese (persisted in Telegram user data)
- **Animations** — Fly-to-cart animation, skeleton shimmer loading, expandable search bar

## Data Model

```sql
customers       (id, telegram_chat_id, telegram_username, full_name, phone, 
                  default_address, language_code)

categories      (id, name, name_km, name_zh, sort_order, is_active)

menu_items      (id, category_id, name, name_km, name_zh, description,
                  description_km, description_zh, price, photo_url, 
                  is_available, sort_order)

menu_item_variants (id, menu_item_id, name, name_km, name_zh, price,
                     is_weight_based, sort_order)

orders          (id, customer_id, fulfillment, address, pickup_time, status,
                  subtotal, delivery_fee, total, payment_method, 
                  payment_status, aba_transaction_id, customer_remark,
                  cancel_reason)

order_items     (id, order_id, menu_item_id, variant_id, quantity,
                  unit_price, line_total)

carts           (id, customer_id, menu_item_id, quantity)

admins          (telegram_chat_id, name)

customer_pending_actions (id, customer_id, action, order_id, admin_chat_id)
```

## Quick Start

```bash
# Clone
git clone https://github.com/Vuthi1111/telegram-food-ordering-bot.git
cd telegram-food-ordering-bot

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your:
#   - DATABASE_URL (Supabase PostgreSQL)
#   - BOT_TOKEN (Telegram BotFather token)
#   - ADMIN_CHAT_ID (your Telegram user ID)
#   - SUPABASE_URL + SUPABASE_SERVICE_KEY
#   - WEB_APP_URL (Vercel deployment URL)

# Run locally (proxies API to production)
node scripts/dev-server.js

# Set Telegram webhook
node scripts/setup-webhook.js
```

## Deployment

The app deploys automatically to Vercel on every push to `main`:

- **Customer App**: `https://telegram-food-ordering-bot.vercel.app/`
- **Admin Panel**: `https://telegram-food-ordering-bot.vercel.app/admin/?chat_id=ADMIN_ID`
- **Telegram Bot**: Configured via webhook

Environment variables must be set in the Vercel dashboard (or `.env.production`).
