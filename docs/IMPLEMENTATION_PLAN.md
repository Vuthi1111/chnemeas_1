# Implementation Plan — Client Requirements (3 Features)

Based on client requirements and clarifications answered on the call.

---

## Feature 1 — Admin-Confirmed Pickup Time

### Business Flow (from client)
1. Customer selects a **preferred** pickup time when placing the order.
2. Admin receives the order notification.
3. **On approval**, admin confirms the **final** pickup time with the customer (typically **20–30 min** on a normal day).
4. The final time is **always** set by admin — the 35-min auto-calc is **disabled** once admin confirms.
5. Customer receives the order-approved receipt showing the **confirmed** time.

### Current State
| Step | Status |
|------|--------|
| Customer selects time | ✅ Works (frontend stores `pickup_time`) |
| 35-min auto-calc | ⚠️ Frontend auto-sets `confirmed_pickup_time = pickup_time + 35min` — must be REMOVED |
| Admin confirmation UI | ❌ Does not exist |
| `confirmed_pickup_time` column | ✅ Already exists in DB |
| Customer sees confirmed time | ⚠️ Shows `confirmed_pickup_time || pickup_time` — will show confirmed time once set |

### Proposed UX
**Approve = instant approve (no time prompt). Don't Approve = two paths: Cancel OR Select Time.**

1. New order arrives → admin sees **Approve Order** / **Don't Approve** buttons.
2. **Admin taps Approve** → order approved immediately, `confirmed_pickup_time` stays as customer requested (no time selection). ✅ Simple, one tap.
3. **Admin taps Don't Approve** → bot shows two sub-options:
   - ❌ **Cancel Order** → existing rejection flow (admin gives reason: no food / no ingredients / etc.) → order `rejected`, customer notified.
   - ⏱ **Select Pickup Time** → bot shows time options:
     - ⏱ **+20 min**
     - ⏱ **+25 min**
     - ⏱ **+30 min**  *(default highlight)*
     - ⏱ **+35 min**
     - 📅 **Custom time** (admin types e.g. `14:30`)
     - ↩️ **Use customer's requested time** (e.g. "Use 12:00 PM")
   - Once admin picks a time → order becomes `approved` with `confirmed_pickup_time` set, customer gets the receipt **with confirmed time**.

> **Key insight:** "Select Pickup Time" is the admin's way to approve WITH a corrected/confirmed time. "Cancel Order" is the way to reject. Direct "Approve" trusts the customer's requested time.
>
> **Alternative considered:** admin panel field to edit pickup time.
> **Decision:** bot-first flow (matches where approval already happens). Admin panel can later get an edit-time button as a backup (Phase 2).

### Tasks
| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1.1 | Remove frontend auto-calc | `public/assets/app.js` | Stop sending `confirmedPickupTime` in checkout (send `null`). Customer still picks their preferred time. |
| 1.2 | Keep backend tolerant | `api/checkout.js` | Accept `confirmed_pickup_time = NULL` (already nullable — verify insert handles null). |
| 1.3 | Change approve handler | `src/bot.js` | `approve_order` → approve immediately (current behavior, no change to timing). |
| 1.4 | Change "Reject" → "Don't Approve" sub-menu | `src/bot.js` | `reject_order:{id}` now shows sub-buttons: **Cancel Order** (`admin_reject_confirm:{id}`) + **Select Pickup Time** (`select_pickup_time:{id}`). |
| 1.5 | Pickup-time selection flow | `src/bot.js` | New action handler `confirm_pickup_time:{orderId}:{option}` → on pick, approve order + set `confirmed_pickup_time` + notify customer with confirmed time. |
| 1.6 | Locale keys | `src/locales.js` | Add: `dont_approve`, `select_pickup_time`, `cancel_order_btn`, `pickup_20min`, `pickup_25min`, `pickup_30min`, `pickup_35min`, `pickup_custom`, `pickup_use_requested`, `pickup_confirm_done`, `pickup_custom_prompt` — in **en / km / zh**. |
| 1.7 | Customer receipt shows confirmed time | `src/bot.js` (formatCustomerReceipt) | Already shows `confirmed_pickup_time || pickup_time`. Add "confirmed time" label when admin-set. |
| 1.8 | Custom time input flow | `src/bot.js` | Admin types a time → parse `HH:mm` → validate → set. Reuse session pattern from cancel-reason flow. **Same-day only (confirmed by client), so `HH:mm` is sufficient; no date picker needed.** |

### Acceptance Criteria
- [ ] Customer picks a preferred time → stored as `pickup_time`, `confirmed_pickup_time` stays NULL.
- [ ] Admin taps **Approve** → order approved immediately, no time prompt, `confirmed_pickup_time` unchanged (customer's request used).
- [ ] Admin taps **Don't Approve** → sees **Cancel Order** + **Select Pickup Time** sub-options.
- [ ] Admin taps **Cancel Order** → rejection reason flow (existing), order `rejected`, customer notified.
- [ ] Admin taps **Select Pickup Time** → picks +30 min → order `approved`, `confirmed_pickup_time = now + 30min`, customer gets receipt with that time.
- [ ] Admin picks "Use customer's time" → `confirmed_pickup_time = pickup_time`.
- [ ] All UI strings translated in Khmer + Chinese.

---

## Feature 2 — Post-Payment Cancellation & Refund Tracking

### Business Flow (from client)
1. Customer cancels a **paid** order → admin gets the cancel request (already works).
2. Admin **contacts customer** to confirm the cancellation.
3. After confirmation → admin **manually processes the refund** in ABA.
4. Admin **informs the boss** → boss **transfers the refund** via ABA Bank.
5. Admin keeps a **screenshot of the transfer** as proof.
6. Refund is tracked end-to-end: `none → pending → completed`.

### Current State
| Step | Status |
|------|--------|
| Customer cancels paid order → admin notified | ✅ Works (approve/keep buttons, retry, language-aware) |
| Admin approves cancellation | ✅ Works (`refund_status='pending'` is set) |
| Refund status column | ✅ `refund_status` exists (`none/pending/completed`) |
| Boss informed | ❌ No flow |
| Refund proof (screenshot) storage | ❌ Does not exist |
| "Mark refunded" tracking UI | ❌ Does not exist |

### Proposed Design

**A) Notification flow**
- When admin approves a paid cancellation → order `cancelled`, `refund_status='pending'`.
- A second notification goes out: **"Boss — please transfer refund for Order #X ($Y) to the customer."** sent to the owner chat (boss).

**B) Refund tracking UI (Admin Panel)**
- New **"Refunds"** tab in the admin panel:
  - Pending refunds list (filter `refund_status='pending'`).
  - Each row: order #, customer, amount, cancel reason.
  - **"Mark Refunded"** button → prompts to upload the **screenshot proof**.
- On submit:
  - Screenshot uploaded to Supabase Storage bucket `refund-proofs`.
  - Order updated: `refund_status='completed'`, `refunded_at=NOW()`, `refund_proof_url=<storage URL>`.
- Khmer/English fully translated.

**C) Bot reply-to-message capture (primary method — per client preference)**
- The "Boss refund request" message includes: `⚠️ Refund pending for Order #16 ($52.50)`.
- Admin simply **replies to that bot message** with either:
  - **a screenshot** (photo) → bot downloads it → uploads to `refund-proofs` bucket → saves `refund_proof_url`, OR
  - **a text note** (e.g. "transferred", or the ABA transaction reference) → saves as `refund_note`.
- Bot extracts the order ID from the replied-to message text (`Order #16` regex) → updates that order: `refund_status='completed'`, `refunded_at=NOW()`.
- Also works if admin replies to ANY bot message containing `Order #16` (new-order notification, cancel request, etc.).
- Inline button **"📎 Attach Proof"** on the refund message as a fallback → bot asks admin to send the screenshot as a normal message (no reply needed).

**D) Bot button (optional, for staff)**
- `mark_refunded:{orderId}` inline button on the paid-cancel approval message → sets `refund_status='completed'` quickly without the panel or screenshot. Panel/attachment is still recommended for proof.

### Tasks
| # | Task | File(s) | Details |
|---|------|---------|---------|
| 2.1 | DB migration | `db/migrate-refund-tracking.sql` | Add `refunded_at TIMESTAMP`, `refund_proof_url TEXT`, `refund_note TEXT` to `orders`. |
| 2.2 | Create Storage bucket | Supabase (manual or SQL) | Bucket `refund-proofs` (private, authenticated access). |
| 2.3 | Notify boss on paid cancel | `src/bot.js` | When `refund_status='pending'` set → send "Boss refund request" to owner chat. **Boss = owner (`ADMIN_CHAT_ID`) — same person, no separate ID.** |
| 2.4 | Bot reply-to-message capture | `src/bot.js` | Detect admin replying to a bot message containing `Order #N` → photo saved as proof / text saved as note → mark refund completed. |
| 2.5 | Refunds API endpoint | `api/admin/refunds.js` | List pending, upload proof (multipart or signed URL), mark completed. |
| 2.6 | Admin panel Refunds tab | `public/admin/app.js`, `index.html` | Tab UI, list, upload modal, language-aware. |
| 2.7 | Locale keys | `src/locales.js` + `public/admin/app.js` | Refund labels in en/km/zh. |
| 2.8 | (Optional) Bot `mark_refunded` button | `src/bot.js` | Quick-complete refund without screenshot. |

### Acceptance Criteria (Feature 2)
- [ ] Paid order cancelled → `refund_status='pending'`, owner (boss) notified with "Refund pending for Order #N ($X)".
- [ ] Admin replies to that bot message with a **screenshot** → proof saved to storage, `refund_status='completed'`, proof URL stored.
- [ ] Admin replies with a **text note** → saved as `refund_note`, refund marked completed.
- [ ] Replying to ANY bot message mentioning `Order #N` attaches proof to the right order.
- [ ] Admin panel Refunds tab shows pending + completed refunds with proof thumbnail.
- [ ] All UI in Khmer.

---

## Feature 3 — Admin Panel Full Khmer Support

### Current State
| Area | Status |
|------|--------|
| Nav toggle 🇰🇭/🇺🇸 | ✅ Done |
| Navigation buttons | ✅ Translated |
| Dashboard stats | ✅ Translated |
| Filter tabs | ✅ Translated |
| Order action buttons | ✅ Translated |
| Order detail body (labels) | ⚠️ Partially hardcoded English (`Customer:`, `Pickup`, `Total:`, `Status:`, etc.) |
| Menu management | ⚠️ Likely still English |
| Modals / confirmations | ⚠️ Mixed |
| Refunds tab (new) | Will be built Khmer-first |

### Tasks
| # | Task | File(s) | Details |
|---|------|---------|---------|
| 3.1 | Audit every hardcoded string | `public/admin/app.js`, `public/admin/index.html` | Find all `\`...\`` literals rendered in UI. |
| 3.2 | Add missing keys to `adminLocales` | `public/admin/app.js` | en + km. |
| 3.3 | Convert string literals to `_t()` | `public/admin/app.js` | Order detail, menu editor, modal buttons. |
| 3.4 | Order detail labels | `public/admin/app.js` | `Customer`, `Items`, `Total`, `Status`, `Payment`, `Pickup time` labels. |
| 3.5 | Test both languages | Manual | Toggle back/forth, verify no English remnants. |

### Acceptance Criteria
- [ ] Every visible string in the admin panel has a Khmer translation.
- [ ] Toggling 🇰🇭/🇺🇸 updates the whole page without refresh issues.
- [ ] New order detail, menu management, and modals all localized.

---

## Sequence (Recommended Order)

```
Phase 1: Feature 1 (pickup time)     → highest impact for daily ops
Phase 2: Feature 3 (admin Khmer)     → staff usability (cheap, fast)
Phase 3: Feature 2 (refund tracking) → bigger build (storage + panel tab)
```

Each phase is deployable independently. No phase blocks another.

---

## Open Questions — RESOLVED
1. ✅ **Custom pickup time format**: Same-day only → admin types `HH:mm` (e.g. `14:30`). No date picker needed. *(Confirmed: customers order same-day.)*
2. ✅ **Boss notification**: Boss = owner = `ADMIN_CHAT_ID`. Same person, no separate ID.
3. ✅ **Refund proof**: **Reply-to-message capture** — admin replies to the order's bot message with a screenshot (image) or text (e.g. ABA reference) and it gets attached to that order. Panel upload remains as backup.
