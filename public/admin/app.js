const urlParams = new URLSearchParams(window.location.search);
const chatId = urlParams.get('chat_id');

// ─── Admin panel translations (defined early so they work everywhere) ───
const adminLocales = {
  en: {
    // Nav & auth
    admin_panel: 'Admin Panel',
    dashboard: 'Dashboard', orders: 'Orders', menu: 'Menu', refunds: 'Refunds',
    access_denied: 'Access Denied', not_authorized: 'Not Authorized',
    open_from_bot: 'Open this page from the bot\'s /admin command.',
    no_access: 'You do not have admin access.',

    // Filter tabs
    filter_btn_all: 'All',
    all: 'All', pending: 'Pending ⏳', approved: 'Approved ✅',
    paid: 'Paid 💳', preparing: 'Preparing 👨‍🍳', ready: 'Ready 📦',
    fulfilled: 'Fulfilled ✓', cancelled: 'Cancelled 🚫', rejected: 'Rejected ✕',

    // Order action buttons
    approve: '✅ Approve', reject: '✕ Reject',
    mark_paid: '💳 Mark Paid', start_preparing: '👨‍🍳 Start Preparing',
    mark_ready: '📦 Mark Ready', mark_fulfilled: '✓ Mark Fulfilled',

    // Dashboard stats
    total_orders: 'Total Orders', pending_approval: 'Pending Approval',
    active_orders: 'Active Orders', revenue: 'Revenue (paid+)',

    // Dashboard charts
    revenue_this_week: '📈 Revenue This Week',
    paid_orders_only: 'Paid orders only',
    popular_items: '🔥 Popular Items',
    top_5_by_qty: 'Top 5 by quantity ordered',
    no_data_yet: 'No data yet',
    orders_by_hour: '🕐 Orders by Hour',
    when_orders_come: 'When orders come in',
    n_orders: (n) => `${n} orders`,
    status_overview: '📊 Status Overview',
    current_distribution: 'Current order distribution',

    // Dashboard status overview labels
    so_pending: '⏳ Pending',
    so_approved: '✅ Approved',
    so_paid: '💳 Paid',
    so_preparing: '👨‍🍳 Preparing',
    so_ready: '📦 Ready',
    so_fulfilled: '✓ Fulfilled',
    so_cancelled: '🚫 Cancelled',
    so_rejected: '✕ Rejected',

    // Dashboard sections
    recent_pending: 'Recent Pending Orders',
    no_pending_orders: 'No pending orders. Good! 🎉',
    menu_overview: 'Menu Overview',
    n_categories: (n) => `${n} categories`,
    n_items: (n) => `${n} items`,
    n_variants: (n) => `${n} variants`,
    could_not_load_menu: 'Could not load menu data.',

    // Orders list
    no_orders: 'No orders found.',
    orders_footer: (n) => `${n} order${n !== 1 ? 's' : ''} · Auto-refreshes every 10s`,

    // Order card
    order_num: (id) => `Order #${id}`,
    address_not_provided: 'Address not provided',
    pickup_label: 'Pickup',
    asap: 'ASAP',
    customer_fallback: 'Customer',

    // Order detail
    od_pending_approval: '⏳ Order Placed',
    od_approved: '✅ Approved',
    od_paid: '💳 Payment Received',
    od_preparing: '👨‍🍳 Preparing',
    od_ready: '📦 Ready for Pickup/Delivery',
    od_fulfilled: '✓ Completed',
    od_cancelled: '🚫 Cancelled',
    od_rejected: '✕ Rejected',
    reason_label: 'Reason',
    current_step: 'Current',
    detail_customer: 'Customer',
    unknown: 'Unknown',
    detail_fulfillment: 'Fulfillment',
    no_address: 'No address',
    pickup_asap: 'Pickup ASAP',
    detail_items: (n) => `Items (${n})`,
    total: 'Total',
    customer_remark: 'Customer Remark',
    cancellation_reason: 'Cancellation Reason',
    close: 'Close',

    // Order action toasts
    order_action_done: (id, status) => `Order #${id}: ${status}`,
    action_failed: 'Action failed',
    network_error: 'Network error',

    // Menu management
    menu_management: 'Menu Management',
    add_category_btn: '+ Category',
    bulk_price_btn: 'Bulk Price',
    bulk_price_title: 'Bulk Price Update',
    percentage_prompt: 'Percentage change (e.g., +10 or -5):',
    confirm_bulk_price: (pct) => `Apply ${pct}% price change to all items in this category?`,
    bulk_price_applied: 'Price updated',

    no_categories: 'No categories yet.',
    inactive: 'Inactive',
    edit: 'Edit',
    delete_btn: 'Delete',
    add_item_btn: '+ Item',
    unavailable: 'Unavailable',
    add_variant_btn: '+ Variant',
    no_photo: 'No photo',
    photo_btn: '📷 Photo',

    // Refunds tab
    refund_title: 'Refund Management',
    order_col: 'Order',
    customer_col: 'Customer',
    amount_col: 'Amount',
    reason_col: 'Reason',
    status_col: 'Status',
    action_col: 'Action',
    mark_refunded: 'Mark Refunded',
    manual_refund_note: 'Manually marked refunded',
    refund_completed: 'Refund completed',
    confirm_mark_refunded: 'Mark this refund as completed?',

    // Modal titles
    add_category_title: 'Add Category',
    edit_category_title: 'Edit Category',
    add_item_title: 'Add Item',
    edit_item_title: 'Edit Item',
    add_variant_title: 'Add Variant',
    edit_variant_title: 'Edit Variant',

    // Form labels
    name_en: 'Name (English)',
    name_km: 'Name (Khmer)',
    name_zh: 'Name (Chinese)',
    desc_en: 'Description (English)',
    desc_km: 'Description (Khmer)',
    desc_zh: 'Description (Chinese)',
    sort_order: 'Sort Order',
    active_label: 'Active',
    available_label: 'Available',
    price_label: 'Price ($)',
    per_kg: 'Per kg',

    // Modal buttons
    cancel_btn: 'Cancel',
    save_btn: 'Save',
    saving: 'Saving...',
    save_failed: 'Save failed',

    // Confirm dialogs
    confirm_delete_category: 'Delete this category and all its items?',
    confirm_delete_item: 'Delete this item and all its variants?',
    confirm_delete_variant: 'Delete this variant?',

    // Toasts
    category_created: 'Category created',
    category_updated: 'Category updated',
    category_deleted: 'Category deleted',
    item_created: 'Item created',
    item_updated: 'Item updated',
    item_deleted: 'Item deleted',
    variant_created: 'Variant created',
    variant_updated: 'Variant updated',
    variant_deleted: 'Variant deleted',
    name_required: 'English name required',

    // Reorder
    reorder_category: 'Reorder Category',
    reorder_item: 'Reorder Item',
    current_position: (pos, total) => `Current position: ${pos} of ${total}`,
    move_up: '⬆ Move Up',
    move_down: '⬇ Move Down',
    reordered: 'Reordered',
    reorder_failed: 'Reorder failed',

    // Photo upload
    upload_photo: 'Upload Photo',
    select_photo: 'Select Photo',
    uploading: 'Uploading...',
    upload_btn: 'Upload',
    photo_uploaded: 'Photo uploaded',
    upload_failed: 'Upload failed',
  },
  km: {
    // Nav & auth
    admin_panel: 'ផ្ទាំងគ្រប់គ្រង',
    dashboard: 'ផ្ទាំងគ្រប់គ្រង', orders: 'ការបញ្ជាទិញ', menu: 'ម៉ឺនុយ', refunds: 'សំណើសុំប្រាក់ត្រឡប់',
    access_denied: 'គ្មានសិទ្ធិចូល', not_authorized: 'គ្មានការអនុញ្ញាត',
    open_from_bot: 'សូមបើកទំព័រនេះពីពាក្យបញ្ជា /admin របស់ bot ។',
    no_access: 'អ្នកមិនមានសិទ្ធិចូលប្រើផ្ទាំងគ្រប់គ្រងទេ។',

    // Filter tabs
    filter_btn_all: 'ទាំងអស់',
    all: 'ទាំងអស់', pending: 'រង់ចាំ ⏳', approved: 'បានអនុម័ត ✅',
    paid: 'បានបង់ប្រាក់ 💳', preparing: 'កំពុងរៀបចំ 👨‍🍳', ready: 'រួចរាល់ 📦',
    fulfilled: 'បានបញ្ចប់ ✓', cancelled: 'បានបោះបង់ 🚫', rejected: 'បដិសេធ ✕',

    // Order action buttons
    approve: '✅ អនុម័ត', reject: '✕ បដិសេធ',
    mark_paid: '💳 សម្គាល់ថាបានបង់', start_preparing: '👨‍🍳 ចាប់ផ្តើមរៀបចំ',
    mark_ready: '📦 សម្គាល់ថារួចរាល់', mark_fulfilled: '✓ សម្គាល់ថាបានបញ្ចប់',

    // Dashboard stats
    total_orders: 'ការបញ្ជាទិញសរុប', pending_approval: 'រង់ចាំការអនុម័ត',
    active_orders: 'ការបញ្ជាទិញសកម្ម', revenue: 'ចំណូល (បានបង់+)',

    // Dashboard charts
    revenue_this_week: '📈 ចំណូលសប្ដាហ៍នេះ',
    paid_orders_only: 'ការបញ្ជាទិញដែលបានបង់ប្រាក់តែប៉ុណ្ណោះ',
    popular_items: '🔥 មុខម្ហូបពេញនិយម',
    top_5_by_qty: 'កំពូល ៥ តាមចំនួនដែលបានកម្ម៉ង់',
    no_data_yet: 'មិនមានទិន្នន័យនៅឡើយ',
    orders_by_hour: '🕐 ការបញ្ជាទិញតាមម៉ោង',
    when_orders_come: 'ពេលណាការបញ្ជាទិញចូលមក',
    n_orders: (n) => `${n} ការបញ្ជាទិញ`,
    status_overview: '📊 ទិដ្ឋភាពទូទៅនៃស្ថានភាព',
    current_distribution: 'ការចែកចាយការបញ្ជាទិញបច្ចុប្បន្ន',

    // Dashboard status overview labels
    so_pending: '⏳ រង់ចាំ',
    so_approved: '✅ បានអនុម័ត',
    so_paid: '💳 បានបង់ប្រាក់',
    so_preparing: '👨‍🍳 កំពុងរៀបចំ',
    so_ready: '📦 រួចរាល់',
    so_fulfilled: '✓ បានបញ្ចប់',
    so_cancelled: '🚫 បានបោះបង់',
    so_rejected: '✕ បដិសេធ',

    // Dashboard sections
    recent_pending: 'ការបញ្ជាទិញដែលកំពុងរង់ចាំថ្មីៗ',
    no_pending_orders: 'គ្មានការបញ្ជាទិញរង់ចាំទេ។ ល្អ! 🎉',
    menu_overview: 'ទិដ្ឋភាពទូទៅម៉ឺនុយ',
    n_categories: (n) => `${n} ប្រភេទ`,
    n_items: (n) => `${n} មុខម្ហូប`,
    n_variants: (n) => `${n} ប្រភេទរង`,
    could_not_load_menu: 'មិនអាចផ្ទុកទិន្នន័យម៉ឺនុយបានទេ។',

    // Orders list
    no_orders: 'រកមិនឃើញការបញ្ជាទិញទេ។',
    orders_footer: (n) => `${n} ការបញ្ជាទិញ · ធ្វើបច្ចុប្បន្នភាពរៀងរាល់ ១០វិ`,

    // Order card
    order_num: (id) => `ការបញ្ជាទិញ #${id}`,
    address_not_provided: 'មិនបានផ្ដល់អាសយដ្ឋាន',
    pickup_label: 'យកដោយខ្លួនឯង',
    asap: 'ឱ្យបានឆាប់',
    customer_fallback: 'អតិថិជន',

    // Order detail
    od_pending_approval: '⏳ បានដាក់ការបញ្ជាទិញ',
    od_approved: '✅ បានអនុម័ត',
    od_paid: '💳 បានទទួលការបង់ប្រាក់',
    od_preparing: '👨‍🍳 កំពុងរៀបចំ',
    od_ready: '📦 រួចរាល់សម្រាប់យក/ដឹកជញ្ជូន',
    od_fulfilled: '✓ បានបញ្ចប់',
    od_cancelled: '🚫 បានបោះបង់',
    od_rejected: '✕ បដិសេធ',
    reason_label: 'មូលហេតុ',
    current_step: 'បច្ចុប្បន្ន',
    detail_customer: 'អតិថិជន',
    unknown: 'មិនស្គាល់',
    detail_fulfillment: 'ការបំពេញ',
    no_address: 'គ្មានអាសយដ្ឋាន',
    pickup_asap: 'យកឱ្យបានឆាប់',
    detail_items: (n) => `មុខម្ហូប (${n})`,
    total: 'សរុប',
    customer_remark: 'កំណត់ចំណាំរបស់អតិថិជន',
    cancellation_reason: 'មូលហេតុនៃការបោះបង់',
    close: 'បិទ',

    // Order action toasts
    order_action_done: (id, status) => `ការបញ្ជាទិញ #${id}: ${status}`,
    action_failed: 'សកម្មភាពបរាជ័យ',
    network_error: 'បញ្ហាបណ្ដាញ',

    // Menu management
    menu_management: 'គ្រប់គ្រងម៉ឺនុយ',
    add_category_btn: '+ ប្រភេទ',
    bulk_price_btn: 'កែតម្លៃលក់ដុំ',
    bulk_price_title: 'កែតម្លៃលក់ដុំ',
    percentage_prompt: 'ការផ្លាស់ប្តូរជាភាគរយ (ឧទាហរណ៍ +10 ឬ -5):',
    confirm_bulk_price: (pct) => `អនុវត្តការផ្លាស់ប្តូរតម្លៃ ${pct}% ទៅលើមុខម្ហូបទាំងអស់ក្នុងប្រភេទនេះ?`,
    bulk_price_applied: 'បានធ្វើបច្ចុប្បន្នភាពតម្លៃ',

    no_categories: 'មិនមានប្រភេទនៅឡើយ។',
    inactive: 'អសកម្ម',
    edit: 'កែប្រែ',
    delete_btn: 'លុប',
    add_item_btn: '+ មុខម្ហូប',
    unavailable: 'មិនមាន',
    add_variant_btn: '+ ប្រភេទរង',
    no_photo: 'គ្មានរូបថត',
    photo_btn: '📷 រូបថត',

    // Modal titles
    add_category_title: 'បន្ថែមប្រភេទ',
    edit_category_title: 'កែប្រែប្រភេទ',
    add_item_title: 'បន្ថែមមុខម្ហូប',
    edit_item_title: 'កែប្រែមុខម្ហូប',
    add_variant_title: 'បន្ថែមប្រភេទរង',
    edit_variant_title: 'កែប្រែប្រភេទរង',

    // Form labels
    name_en: 'ឈ្មោះ (អង់គ្លេស)',
    name_km: 'ឈ្មោះ (ខ្មែរ)',
    name_zh: 'ឈ្មោះ (ចិន)',
    desc_en: 'ការពិពណ៌នា (អង់គ្លេស)',
    desc_km: 'ការពិពណ៌នា (ខ្មែរ)',
    desc_zh: 'ការពិពណ៌នា (ចិន)',
    sort_order: 'លំដាប់តម្រៀប',
    active_label: 'សកម្ម',
    available_label: 'មាន',
    price_label: 'តម្លៃ ($)',
    per_kg: 'ក្នុងមួយ kg',

    // Modal buttons
    cancel_btn: 'បោះបង់',
    save_btn: 'រក្សាទុក',
    saving: 'កំពុងរក្សាទុក...',
    save_failed: 'រក្សាទុកបរាជ័យ',

    // Confirm dialogs
    confirm_delete_category: 'លុបប្រភេទនេះ និងមុខម្ហូបទាំងអស់របស់វា?',
    confirm_delete_item: 'លុបមុខម្ហូបនេះ និងប្រភេទរងទាំងអស់របស់វា?',
    confirm_delete_variant: 'លុបប្រភេទរងនេះ?',

    // Toasts
    category_created: 'បានបង្កើតប្រភេទ',
    category_updated: 'បានធ្វើបច្ចុប្បន្នភាពប្រភេទ',
    category_deleted: 'បានលុបប្រភេទ',
    item_created: 'បានបង្កើតមុខម្ហូប',
    item_updated: 'បានធ្វើបច្ចុប្បន្នភាពមុខម្ហូប',
    item_deleted: 'បានលុបមុខម្ហូប',
    variant_created: 'បានបង្កើតប្រភេទរង',
    variant_updated: 'បានធ្វើបច្ចុប្បន្នភាពប្រភេទរង',
    variant_deleted: 'បានលុបប្រភេទរង',
    name_required: 'ត្រូវការឈ្មោះជាភាសាអង់គ្លេស',

    // Reorder
    reorder_category: 'ផ្លាស់ប្ដូរលំដាប់ប្រភេទ',
    reorder_item: 'ផ្លាស់ប្ដូរលំដាប់មុខម្ហូប',
    current_position: (pos, total) => `ទីតាំងបច្ចុប្បន្ន: ${pos} នៃ ${total}`,
    move_up: '⬆ ផ្លាស់ឡើង',
    move_down: '⬇ ផ្លាស់ចុះ',
    reordered: 'បានផ្លាស់ប្ដូរលំដាប់',
    reorder_failed: 'ការផ្លាស់ប្ដូរលំដាប់បរាជ័យ',

    // Photo upload
    upload_photo: 'ផ្ទុករូបថត',
    select_photo: 'ជ្រើសរើសរូបថត',
    uploading: 'កំពុងផ្ទុក...',
    upload_btn: 'ផ្ទុក',
    photo_uploaded: 'បានផ្ទុករូបថត',
    upload_failed: 'ការផ្ទុកបរាជ័យ',
  },
};

function getAdminLang() {
  return localStorage.getItem('admin_lang') || 'en';
}

function setAdminLang(lang) {
  localStorage.setItem('admin_lang', lang);
}

function _t(key, ...args) {
  const lang = getAdminLang();
  const val = adminLocales[lang]?.[key] ?? adminLocales.en[key];
  if (typeof val === 'function') return val(...args);
  return val ?? key;
}

if (!chatId) {
  const l = getAdminLang();
  document.querySelector('#view-container').innerHTML = `
    <div class="empty-state">
      <div class="icon">🔒</div>
      <h2>${_t('access_denied')}</h2>
      <p>${_t('open_from_bot')}</p>
    </div>
  `;
  throw new Error('No chat_id');
}

const API = {
  checkAuth: () => fetch(`/api/admin/check-auth?chat_id=${chatId}`).then(r => r.json()),
  getMenu: () => fetch(`/api/admin/menu?chat_id=${chatId}`).then(r => r.json()),
  postMenu: (data) => fetch('/api/admin/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, chatId }) }).then(r => r.json()),
  getOrders: (status) => fetch(`/api/admin/orders?chat_id=${chatId}${status ? `&status=${status}` : ''}`).then(r => r.json()),
  getRefunds: () => fetch(`/api/admin/refunds?chat_id=${chatId}`).then(r => r.json()),
  markRefunded: (orderId, refundNote) => fetch('/api/admin/refunds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark_refunded', order_id: orderId, refund_note: refundNote, chat_id: chatId }) }).then(r => r.json()),
  postOrder: (data) => fetch('/api/admin/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, chatId }) }).then(r => r.json()),
  uploadPhoto: (menuItemId, image) => fetch('/api/upload-photo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menuItemId, image, chatId }) }).then(r => r.json()),
};

let state = {
  isAdmin: false, isOwner: false,
  view: 'dashboard',
  orders: [], menu: null,
  lastOrderCount: 0,
  pollInterval: null,
  ordersFilter: '',
  newOrderCount: 0,
};
const container = document.querySelector('#view-container');

function $(sel, parent = document) { return parent.querySelector(sel); }
function $$(sel, parent = document) { return [...parent.querySelectorAll(sel)]; }
function money(v) { return `$${Number(v).toFixed(2)}`; }

// Display "YYYY-MM-DD HH:mm:ss" (Phnom Penh wall-clock) literally — no timezone shifts.
function formatWallClock(value) {
  if (!value) return _t('asap');
  if (typeof value === 'string' && value.includes(' ')) {
    return value.slice(0, 16).replace(' ', ' ');
  }
  try {
    return new Date(value).toLocaleString();
  } catch (_) {
    return String(value);
  }
}

// ─── TOAST ───
function toast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} ${msg}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

  // ─── REFUNDS ───
async function renderRefunds() {
  container.innerHTML = `<div style="text-align:center;padding:20px;"><div class="spinner spinner-lg"></div></div>`;
  const res = await API.getRefunds();
  const refunds = res.refunds || [];

  container.innerHTML = `
    <h2>${_t('refund_title')}</h2>
    <div style="overflow-x:auto;">
      <table class="admin-table">
        <thead>
          <tr>
            <th>${_t('order_col')}</th>
            <th>${_t('customer_col')}</th>
            <th>${_t('amount_col')}</th>
            <th>${_t('reason_col')}</th>
            <th>${_t('status_col')}</th>
            <th>${_t('action_col')}</th>
          </tr>
        </thead>
        <tbody>
          ${refunds.map(r => `
            <tr>
              <td>#${r.id}</td>
              <td>${escHtml(r.full_name || _t('unknown'))}</td>
              <td>${money(r.total)}</td>
              <td>${escHtml(r.cancel_reason || '')}</td>
              <td>${r.refund_status === 'completed' ? `✓ ${_t('refund_completed')}` : '⏳ Pending'}</td>
              <td>
                ${r.refund_status === 'pending' ? `
                  <button class="btn btn-sm btn-primary mark-refunded-btn" data-id="${r.id}">${_t('mark_refunded')}</button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  $$('.mark-refunded-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(_t('confirm_mark_refunded'))) return;
      const orderId = btn.dataset.id;
      await API.markRefunded(orderId, _t('manual_refund_note'));
      toast(_t('refund_completed'));
      renderRefunds();
    });
  });
}
function updateNavDot(count) {
  const dots = $$('.nav-dot');
  dots.forEach(d => d.classList.toggle('show', count > 0));
}

// ─── POLLING ───
function startPolling() {
  if (state.pollInterval) clearInterval(state.pollInterval);
  state.pollInterval = setInterval(async () => {
    try {
      const res = await API.getOrders();
      const orders = res.orders || [];
      // If we have orders and count increased, there are new orders
      if (state.lastOrderCount > 0 && orders.length > state.lastOrderCount) {
        state.newOrderCount += orders.length - state.lastOrderCount;
        updateNavDot(state.newOrderCount);
        // If we're on orders/dashboard view, refresh
        if (state.view === 'orders' || state.view === 'dashboard') {
          refreshCurrentView(false);
        }
      }
      state.orders = orders;
      state.lastOrderCount = orders.length;
    } catch (e) {
      // Silently fail — polling should never show errors
    }
  }, 10000);
}

function stopPolling() {
  if (state.pollInterval) {
    clearInterval(state.pollInterval);
    state.pollInterval = null;
  }
}

// ─── INIT ───
async function init() {
  const auth = await API.checkAuth();
  if (!auth.isAdmin) {
    container.innerHTML = `<div class="empty-state"><div class="icon">🔒</div><h2>${_t('not_authorized')}</h2><p>${_t('no_access')}</p></div>`;
    return;
  }
  state.isAdmin = true;
  state.isOwner = auth.isOwner;

  // Load orders once for polling baseline
  try {
    const orderRes = await API.getOrders();
    state.orders = orderRes.orders || [];
    state.lastOrderCount = state.orders.length;
  } catch(e) {}

  // Apply language to nav buttons and title
  document.title = _t('admin_panel');
  const h1 = document.querySelector('.admin-nav h1');
  if (h1) h1.textContent = _t('admin_panel');
  document.querySelectorAll('.nav-btn').forEach(b => {
    const key = b.dataset.view;
    const textNode = b.childNodes[0];
    if (textNode) textNode.textContent = _t(key);
  });

  startPolling();
  navigate(state.view);
}

// ─── NAVIGATION ───
function navigate(view) {
  state.newOrderCount = 0;
  updateNavDot(0);
  state.view = view;
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  switch (view) {
    case 'dashboard': renderDashboard(); break;
    case 'orders': renderOrders(); break;
    case 'menu': renderMenu(); break;
    case 'refunds': renderRefunds(); break;
  }
}

$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.view));
  // Add notification dot span
  const dot = document.createElement('span');
  dot.className = 'nav-dot';
  btn.appendChild(dot);
});

// ─── Language toggle ───
document.getElementById('lang-toggle')?.addEventListener('click', () => {
  const current = getAdminLang();
  const next = current === 'en' ? 'km' : 'en';
  setAdminLang(next);
  // Update title and nav
  document.title = _t('admin_panel');
  const h1 = document.querySelector('.admin-nav h1');
  if (h1) h1.textContent = _t('admin_panel');
  // Update nav button text (text before the dot span)
  document.querySelectorAll('.nav-btn').forEach(b => {
    const key = b.dataset.view;
    const textNode = b.childNodes[0];
    if (textNode) textNode.textContent = _t(key);
  });
  refreshCurrentView(true);
});

// ─── REFRESH CURRENT VIEW ───
function refreshCurrentView(showToast = true) {
  switch (state.view) {
    case 'dashboard': renderDashboard(); break;
    case 'orders': renderOrders(); break;
    case 'menu': renderMenu(); break;
  }
}

// ═══════════════════════════════════════════════
//  DASHBOARD + ANALYTICS
// ═══════════════════════════════════════════════

async function renderDashboard() {
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px;">
      ${Array.from({ length: 4 }, () => `
        <div style="background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);padding:18px;text-align:center;">
          <div class="skeleton" style="height:28px;width:60px;margin:0 auto 8px;"></div>
          <div class="skeleton" style="height:12px;width:80px;margin:0 auto;"></div>
        </div>
      `).join('')}
    </div>
    <div style="text-align:center;padding:20px;"><div class="spinner spinner-lg"></div></div>
  `;

  const [ordersRes, menuRes] = await Promise.all([API.getOrders(), API.getMenu()]);
  // Keep in sync with polled data
  state.orders = ordersRes.orders || [];
  state.lastOrderCount = state.orders.length;

  const orders = state.orders;
  const menu = menuRes;

  // ─── STATS ───
  const counts = {};
  for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1;

  const totalRevenue = orders
    .filter(o => ['paid', 'preparing', 'ready', 'fulfilled'].includes(o.status))
    .reduce((s, o) => s + Number(o.total), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending_approval');
  const activeOrders = orders.filter(o => ['approved', 'paid', 'preparing'].includes(o.status));

  // ─── ANALYTICS ───
  // Revenue by day (last 7 days)
  const revenueByDay = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en', { weekday: 'short' });
    revenueByDay[key] = 0;
  }
  for (const o of orders) {
    if (!['paid', 'preparing', 'ready', 'fulfilled'].includes(o.status)) continue;
    const d = new Date(o.created_at);
    const dayDiff = Math.round((today - d) / (1000 * 60 * 60 * 24));
    if (dayDiff >= 0 && dayDiff < 7) {
      const key = d.toLocaleDateString('en', { weekday: 'short' });
      revenueByDay[key] = (revenueByDay[key] || 0) + Number(o.total);
    }
  }

  // Popular items (top 5)
  const itemCounts = {};
  for (const o of orders) {
    for (const item of (o.items || [])) {
      const name = item.name || 'Unknown';
      itemCounts[name] = (itemCounts[name] || 0) + Number(item.quantity);
    }
  }
  const popularItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Orders by hour
  const ordersByHour = {};
  for (let h = 0; h < 24; h++) ordersByHour[h] = 0;
  for (const o of orders) {
    try {
      const h = new Date(o.created_at).getHours();
      ordersByHour[h]++;
    } catch(e) {}
  }

  const maxRevenue = Math.max(...Object.values(revenueByDay), 1);
  const maxHourCount = Math.max(...Object.values(ordersByHour), 1);
  const maxPopCount = popularItems.length ? popularItems[0][1] : 1;

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-number">${orders.length}</div><div class="stat-label">${_t('total_orders')}</div></div>
      <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-number">${pendingOrders.length}</div><div class="stat-label">${_t('pending_approval')}</div></div>
      <div class="stat-card"><div class="stat-icon">👨‍🍳</div><div class="stat-number">${activeOrders.length}</div><div class="stat-label">${_t('active_orders')}</div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-number">${money(totalRevenue)}</div><div class="stat-label">${_t('revenue')}</div></div>
    </div>

    <div style="display:grid;gap:16px;grid-template-columns:1fr 1fr;">

      <div class="chart-card">
        <h3>${_t('revenue_this_week')}</h3>
        <p class="chart-sub">${_t('paid_orders_only')}</p>
        <div class="bar-chart">
          ${Object.entries(revenueByDay).map(([day, val]) => `
            <div class="bar-item">
              <div class="bar" style="height:${Math.max((val / maxRevenue) * 120, 4)}px;" title="${money(val)}">
                <span class="bar-val">${money(val)}</span>
              </div>
              <span class="bar-label">${day}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="chart-card">
        <h3>${_t('popular_items')}</h3>
        <p class="chart-sub">${_t('top_5_by_qty')}</p>
        <div class="hbar-chart">
          ${popularItems.length ? popularItems.map(([name, count]) => `
            <div class="hbar-row">
              <span class="hbar-label" title="${name}">${name}</span>
              <div class="hbar-track">
                <div class="hbar-fill" style="width:${(count / maxPopCount) * 100}%;"></div>
              </div>
              <span class="hbar-count">${count}</span>
            </div>
          `).join('') : `<p style="font-size:13px;color:var(--text-muted);">${_t('no_data_yet')}</p>`}
        </div>
      </div>

      <div class="chart-card">
        <h3>${_t('orders_by_hour')}</h3>
        <p class="chart-sub">${_t('when_orders_come')}</p>
        <div class="bar-chart">
          ${Object.entries(ordersByHour).map(([hour, count]) => `
            <div class="bar-item">
              <div class="bar" style="height:${Math.max((count / maxHourCount) * 120, 4)}px;background:var(--teal);" title="${_t('n_orders', count)}">
                <span class="bar-val">${count}</span>
              </div>
              <span class="bar-label">${hour.padStart(2, '0')}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="chart-card">
        <h3>${_t('status_overview')}</h3>
        <p class="chart-sub">${_t('current_distribution')}</p>
        <div style="display:grid;gap:8px;">
          ${[
            ['pending_approval', _t('so_pending'), counts.pending_approval || 0],
            ['approved', _t('so_approved'), counts.approved || 0],
            ['paid', _t('so_paid'), counts.paid || 0],
            ['preparing', _t('so_preparing'), counts.preparing || 0],
            ['ready', _t('so_ready'), counts.ready || 0],
            ['fulfilled', _t('so_fulfilled'), counts.fulfilled || 0],
            ['cancelled', _t('so_cancelled'), counts.cancelled || 0],
            ['rejected', _t('so_rejected'), counts.rejected || 0],
          ].map(([status, label, count]) => {
            const maxStatus = Math.max(...['pending_approval','approved','paid','preparing','ready','fulfilled','cancelled','rejected'].map(s => counts[s] || 0), 1);
            return `
              <div class="hbar-row">
                <span class="hbar-label" style="width:120px;">${label}</span>
                <div class="hbar-track">
                  <div class="hbar-fill" style="width:${(count / maxStatus) * 100}%;background:var(--status-bg);background:${status === 'pending_approval' ? 'var(--orange)' : status === 'cancelled' || status === 'rejected' ? 'var(--red)' : status === 'fulfilled' ? 'var(--green)' : 'var(--blue)'};"></div>
                </div>
                <span class="hbar-count">${count}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>

    <h2 style="margin:24px 0 12px;font-size:16px;">${_t('recent_pending')}</h2>
    ${pendingOrders.length === 0 ? `<p style="color:var(--text-muted);font-size:14px;">${_t('no_pending_orders')}</p>` : ''}
    ${pendingOrders.slice(0, 5).map(o => renderOrderCard(o)).join('')}

    <h2 style="margin:24px 0 12px;font-size:16px;">${_t('menu_overview')}</h2>
    ${menu ? `
      <p style="color:var(--text-muted);font-size:14px;">
        ${_t('n_categories', menu.categories?.length || 0)} ·
        ${_t('n_items', menu.items?.length || 0)} ·
        ${_t('n_variants', menu.variants?.length || 0)}
      </p>
    ` : `<p style="color:var(--text-muted);font-size:14px;">${_t('could_not_load_menu')}</p>`}
  `;

  bindOrderCardClicks();
  bindOrderActions();
}

// ═══════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════

async function renderOrders() {
  container.innerHTML = `
    <div class="orders-filter" id="orders-filter-skeleton">
      ${Array.from({ length: 7 }, () => `<div class="skeleton" style="width:60px;height:30px;border-radius:16px;"></div>`).join('')}
    </div>
    ${Array.from({ length: 3 }, () => `
      <div style="background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 16px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <div class="skeleton" style="width:80px;height:16px;"></div>
          <div class="skeleton" style="width:70px;height:16px;"></div>
        </div>
        <div class="skeleton" style="width:140px;height:12px;margin-bottom:6px;"></div>
        <div class="skeleton" style="width:200px;height:12px;margin-bottom:6px;"></div>
        <div class="skeleton" style="width:60px;height:12px;"></div>
      </div>
    `).join('')}
  `;

  const statuses = ['', 'pending_approval', 'approved', 'paid', 'preparing', 'ready', 'fulfilled', 'cancelled', 'rejected'];
  const labels = {
    '': _t('filter_btn_all'), pending_approval: _t('pending'), approved: _t('approved'),
    paid: _t('paid'), preparing: _t('preparing'), ready: _t('ready'),
    fulfilled: _t('fulfilled'), cancelled: _t('cancelled'), rejected: _t('rejected')
  };

  const res = await API.getOrders(state.ordersFilter);
  state.orders = res.orders || [];
  state.lastOrderCount = state.orders.length;

  const orders = state.orders;

  container.innerHTML = `
    <div class="orders-filter">
      ${statuses.map(s => `<button class="filter-btn ${state.ordersFilter === s ? 'active' : ''}" data-status="${s}">${labels[s]}</button>`).join('')}
    </div>
    ${orders.length === 0 ? `<div class="empty-state"><div class="icon">📭</div><p>${_t('no_orders')}</p></div>` : ''}
    ${orders.map(o => renderOrderCard(o)).join('')}
    ${orders.length > 0 ? `<p style="text-align:center;color:var(--text-light);font-size:12px;margin-top:8px;">${_t('orders_footer', orders.length)}</p>` : ''}
  `;

  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.ordersFilter = btn.dataset.status;
      renderOrders();
    });
  });

  bindOrderCardClicks();
  bindOrderActions();
}

function renderOrderCard(o) {
  const fulfillment = o.fulfillment === 'delivery'
    ? `📍 ${escHtml(o.address || _t('address_not_provided'))}`
    : `🛍️ ${_t('pickup_label')} ${o.pickup_time ? formatWallClock(o.pickup_time) : _t('asap')}`;

  const items = (o.items || []).map(i =>
    `${i.name}${i.variant_name ? ` (${i.variant_name})` : ''} × ${Number(i.quantity)}`
  ).join(', ');

  const statusActions = getOrderActions(o.status, o.id);

  return `
    <div class="order-card" data-order-id="${o.id}">
      <div class="order-header">
        <span class="order-id">${_t('order_num', o.id)}</span>
        <span class="status-badge status-${o.status}">${_t('od_' + o.status) || o.status.replace(/_/g, ' ')}</span>
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">
        ${fulfillment}
      </div>
      <div class="order-customer">
        👤 ${escHtml(o.full_name || o.telegram_username || _t('customer_fallback'))}
        <span style="margin-left:auto;font-weight:700;color:var(--green);">${money(o.total)}</span>
      </div>
      <div class="order-items">${escHtml(items)}</div>
      ${o.customer_remark ? `<div style="font-size:12px;color:var(--text-muted);font-style:italic;margin-top:4px;">📝 ${escHtml(o.customer_remark)}</div>` : ''}
      ${o.cancel_reason ? `<div style="font-size:12px;color:var(--red);margin-top:4px;">🚫 ${escHtml(o.cancel_reason)}</div>` : ''}
      <div class="order-actions">
        ${statusActions}
      </div>
    </div>
  `;
}

function bindOrderCardClicks() {
  $$('.order-card').forEach(card => {
    // Only open detail on card body, not on action buttons
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn') || e.target.closest('.order-actions')) return;
      const id = parseInt(card.dataset.orderId);
      const order = state.orders.find(o => o.id === id);
      if (order) showOrderDetail(order);
    });
  });
}

// ─── ORDER DETAIL SHEET ───
function showOrderDetail(order) {
  const existing = document.querySelector('.detail-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'detail-overlay';

  const statusFlow = ['pending_approval', 'approved', 'paid', 'preparing', 'ready', 'fulfilled'];
  const statusLabels = {
    pending_approval: _t('od_pending_approval'),
    approved: _t('od_approved'),
    paid: _t('od_paid'),
    preparing: _t('od_preparing'),
    ready: _t('od_ready'),
    fulfilled: _t('od_fulfilled'),
    cancelled: _t('od_cancelled'),
    rejected: _t('od_rejected'),
  };
  const statusIcons = {
    pending_approval: '⏳',
    approved: '✅',
    paid: '💳',
    preparing: '👨‍🍳',
    ready: '📦',
    fulfilled: '✓',
  };

  const currentIdx = statusFlow.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'rejected';

  const items = order.items || [];

  const fulfillmentDetail = order.fulfillment === 'delivery'
    ? `📍 ${escHtml(order.address || _t('no_address'))}`
    : `🛍️ ${order.pickup_time ? formatWallClock(order.pickup_time) : _t('pickup_asap')}`;

  overlay.innerHTML = `
    <div class="detail-sheet">
      <div class="detail-header">
        <h2>${_t('order_num', order.id)}</h2>
        <button class="detail-close-btn" type="button">✕</button>
      </div>

      <div class="detail-body">

        <!-- Status Timeline -->
        <div class="status-timeline">
          ${isCancelled ? `
            <div class="timeline-step" style="opacity:0.5;">
              <div class="timeline-dot done"></div>
              <div class="timeline-info">
                <div class="tl-label">${statusLabels[order.status] || order.status}</div>
                <div class="tl-meta">${order.cancel_reason ? `${_t('reason_label')}: ${escHtml(order.cancel_reason)}` : ''}</div>
              </div>
            </div>
          ` : statusFlow.map((s, i) => {
            const isPast = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isFuture = i > currentIdx;
            return `
              <div class="timeline-step ${isPast ? 'done' : ''}">
                <div class="timeline-dot ${isPast ? 'done' : isCurrent ? 'current' : ''}"></div>
                <div class="timeline-info">
                  <div class="tl-label" style="${isCurrent ? 'font-weight:800;color:var(--text);' : isPast ? 'color:var(--text);' : 'color:var(--text-light);'}">${statusLabels[s]}</div>
                  ${isCurrent ? `<div class="tl-meta">${_t('current_step')}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Customer Info -->
        <div class="detail-section">
          <h3>${_t('detail_customer')}</h3>
          <div style="font-size:14px;font-weight:600;">${escHtml(order.full_name || order.telegram_username || _t('unknown'))}</div>
          ${order.phone ? `<div style="font-size:13px;color:var(--text-muted);">📞 ${escHtml(order.phone)}</div>` : ''}
          ${order.telegram_username ? `<div style="font-size:13px;color:var(--text-muted);">📱 @${escHtml(order.telegram_username)}</div>` : ''}
        </div>

        <!-- Fulfillment -->
        <div class="detail-section">
          <h3>${_t('detail_fulfillment')}</h3>
          <div style="font-size:14px;">${fulfillmentDetail}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">
            ${new Date(order.created_at).toLocaleString()}
          </div>
        </div>

        <!-- Items -->
        <div class="detail-section">
          <h3>${_t('detail_items', items.length)}</h3>
          ${items.map(i => `
            <div class="detail-item-row">
              <div>
                <div style="font-weight:600;font-size:14px;">${i.name}${i.variant_name ? ` <span style="font-weight:400;color:var(--text-muted);">(${i.variant_name})</span>` : ''}</div>
                <div style="font-size:12px;color:var(--text-muted);">× ${i.quantity}</div>
              </div>
              <span style="font-weight:700;">${money(i.line_total)}</span>
            </div>
          `).join('')}
          <div class="detail-item-row" style="border-top:2px solid var(--border);margin-top:8px;padding-top:10px;font-weight:800;font-size:16px;">
            <span>${_t('total')}</span>
            <span style="color:var(--green);">${money(order.total)}</span>
          </div>
        </div>

        <!-- Remark -->
        ${order.customer_remark ? `
          <div class="detail-section">
            <h3>${_t('customer_remark')}</h3>
            <div style="font-size:14px;font-style:italic;color:var(--text-muted);">${escHtml(order.customer_remark)}</div>
          </div>
        ` : ''}

        ${order.cancel_reason ? `
          <div class="detail-section" style="border-color:var(--red);">
            <h3 style="color:var(--red);">${_t('cancellation_reason')}</h3>
            <div style="font-size:14px;color:var(--red);">${escHtml(order.cancel_reason)}</div>
          </div>
        ` : ''}

      </div>

      <!-- Actions -->
      <div class="detail-actions">
        ${getOrderActions(order.status, order.id)}
        <button class="btn btn-outline close-detail-btn" type="button">${_t('close')}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close handlers
  overlay.querySelector('.detail-close-btn').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.close-detail-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // Bind action buttons inside detail sheet
  $$('.detail-actions [data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      const orderId = btn.dataset.id;
      btn.disabled = true;
      btn.textContent = '...';
      try {
        const res = await API.postOrder({ action, orderId });
        if (res.success || res.status) {
          toast(_t('order_action_done', orderId, res.status || action));
          overlay.remove();
          refreshCurrentView(true);
        } else {
          toast(res.error || _t('action_failed'), 'error');
          btn.disabled = false;
          btn.textContent = action.replace(/_/g, ' ');
        }
      } catch (e) {
        toast(_t('network_error'), 'error');
        btn.disabled = false;
      }
    });
  });
}

function getOrderActions(status, orderId) {
  const actions = {
    pending_approval: [
      `<button class="btn btn-primary btn-sm" data-action="approve" data-id="${orderId}">${_t('approve')}</button>`,
      `<button class="btn btn-danger btn-sm" data-action="reject" data-id="${orderId}">${_t('reject')}</button>`,
    ],
    approved: [
      `<button class="btn btn-primary btn-sm" data-action="mark_paid" data-id="${orderId}">${_t('mark_paid')}</button>`,
    ],
    paid: [
      `<button class="btn btn-primary btn-sm" data-action="start_preparing" data-id="${orderId}">${_t('start_preparing')}</button>`,
    ],
    preparing: [
      `<button class="btn btn-primary btn-sm" data-action="mark_ready" data-id="${orderId}">${_t('mark_ready')}</button>`,
    ],
    ready: [
      `<button class="btn btn-primary btn-sm" data-action="mark_fulfilled" data-id="${orderId}">${_t('mark_fulfilled')}</button>`,
    ],
    fulfilled: [],
    cancelled: [],
    rejected: [],
  };
  return (actions[status] || []).join('');
}

function bindOrderActions() {
  $$('[data-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const orderId = btn.dataset.id;
      btn.disabled = true;
      btn.textContent = '...';
      try {
        const res = await API.postOrder({ action, orderId });
        if (res.success || res.status) {
          toast(`Order #${orderId}: ${res.status || action}`);
          if (state.view === 'dashboard') renderDashboard();
          else renderOrders();
        } else {
          toast(res.error || 'Action failed', 'error');
          btn.disabled = false;
          btn.textContent = action.replace(/_/g, ' ');
        }
      } catch (e) {
        toast('Network error', 'error');
        btn.disabled = false;
      }
    });
  });
}

// ═══════════════════════════════════════════════
//  MENU
// ═══════════════════════════════════════════════

async function renderMenu(targetCategoryId) {
  const scrollY = window.scrollY;
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:24px;">
      ${Array.from({ length: 3 }, () => `
        <div style="background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;">
          <div class="skeleton" style="height:16px;width:120px;margin-bottom:12px;"></div>
          <div class="skeleton" style="height:12px;width:80px;margin-bottom:8px;"></div>
          <div class="skeleton" style="height:12px;width:60px;"></div>
        </div>
      `).join('')}
    </div>
  `;

  const res = await API.getMenu();
  state.menu = res;

  const cats = res.categories || [];
  const items = res.items || [];
  const variants = res.variants || [];

  const itemsByCat = {};
  items.forEach(i => {
    if (!itemsByCat[i.category_id]) itemsByCat[i.category_id] = [];
    itemsByCat[i.category_id].push(i);
  });

  const variantsByItem = {};
  variants.forEach(v => {
    if (!variantsByItem[v.menu_item_id]) variantsByItem[v.menu_item_id] = [];
    variantsByItem[v.menu_item_id].push(v);
  });

  // Sort items by sort_order
  Object.values(itemsByCat).forEach(arr => arr.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));

  container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <h2 style="font-size:18px;margin:0;">${_t('menu_management')}</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="add-category-btn" class="btn btn-primary btn-sm">${_t('add_category_btn')}</button>
        </div>
      </div>
      ${cats.length === 0 ? `<div class="empty-state"><div class="icon">🍽️</div><p>${_t('no_categories')}</p></div>` : ''}
      ${cats.map((cat, catIdx) => {
          const catItems = itemsByCat[cat.id] || [];
          return `
            <div class="menu-category" id="cat-${cat.id}">
              <div class="menu-category-header">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="drag-handle" data-type="category" data-id="${cat.id}">⠿</span>
                  <div>
                    <strong style="font-size:15px;">${cat.name}</strong>
                    ${cat.name_km ? ` <span style="font-size:12px;color:var(--text-muted);">🇰🇭 ${cat.name_km}</span>` : ''}
                    ${cat.name_zh ? ` <span style="font-size:12px;color:var(--text-muted);">🇨🇳 ${cat.name_zh}</span>` : ''}
                    <span style="font-size:12px;color:var(--text-muted);margin-left:8px;">${catItems.length} items</span>
                    ${!cat.is_active ? `<span class="status-badge status-cancelled" style="margin-left:6px;">${_t('inactive')}</span>` : ''}
                  </div>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  <button class="btn btn-sm bulk-price-btn" data-id="${cat.id}">${_t('bulk_price_btn')}</button>
                  <button class="btn btn-sm toggle-cat-btn" data-id="${cat.id}" data-active="${cat.is_active}">${cat.is_active ? '✅' : '🚫'}</button>
                  <button class="btn btn-sm edit-cat-btn" data-id="${cat.id}" data-name="${cat.name}" data-name-km="${cat.name_km || ''}" data-name-zh="${cat.name_zh || ''}" data-sort="${cat.sort_order || 0}" data-active="${cat.is_active}">${_t('edit')}</button>
                  <button class="btn btn-sm btn-danger delete-cat-btn" data-id="${cat.id}">${_t('delete_btn')}</button>
                  <button class="btn btn-primary btn-sm add-item-btn" data-cat-id="${cat.id}">${_t('add_item_btn')}</button>
                </div>
              </div>
              ${catItems.map((item, itemIdx) => {
                const itemVariants = variantsByItem[item.id] || [];
                return `
                  <div class="menu-item-row" data-item-id="${item.id}" data-cat-id="${cat.id}">
                    <div class="menu-item-info">
                      <div class="menu-item-name">
                        <span class="drag-handle" data-type="item" data-id="${item.id}" style="font-size:14px;">⠿</span>
                        ${item.name}
                        ${item.name_km ? `<span style="font-size:11px;color:var(--text-light);margin-left:2px;">🇰🇭${item.name_km}</span>` : ''}
                        ${item.name_zh ? `<span style="font-size:11px;color:var(--text-light);margin-left:2px;">🇨🇳${item.name_zh}</span>` : ''}
                        ${!item.is_available ? `<span class="status-badge status-cancelled" style="margin-left:6px;">${_t('unavailable')}</span>` : ''}
                      </div>
                      <div class="menu-item-meta">
                        ${item.description ? `${item.description.substring(0, 60)}${item.description.length > 60 ? '…' : ''}` : ''}
                        ${item.description_km || item.description_zh ? '<span style="font-size:11px;color:var(--text-light);">🌐</span>' : ''}
                      </div>
                      <div style="margin-top:4px;">
                        ${itemVariants.map(v => `
                          <div class="variant-row">
                            <span style="font-weight:500;">${v.name}</span>
                            ${v.name_km ? `<span style="font-size:11px;color:var(--text-light);">🇰🇭${v.name_km}</span>` : ''}
                            ${v.name_zh ? `<span style="font-size:11px;color:var(--text-light);">🇨🇳${v.name_zh}</span>` : ''}
                            <span class="price">${money(v.price)}</span>
                            ${v.is_weight_based ? `<span style="font-size:11px;color:var(--text-light);">${_t('per_kg')}</span>` : ''}
                            <button class="btn btn-sm edit-variant-btn" style="padding:2px 6px;font-size:11px;" data-id="${v.id}" data-item-id="${item.id}" data-name="${v.name}" data-name-km="${v.name_km || ''}" data-name-zh="${v.name_zh || ''}" data-price="${v.price}" data-weight="${v.is_weight_based}" data-sort="${v.sort_order}">✎</button>
                            <button class="btn btn-sm btn-danger delete-variant-btn" style="padding:2px 6px;font-size:11px;" data-id="${v.id}" data-item-id="${item.id}">×</button>
                          </div>
                        `).join('')}
                        <button class="btn btn-sm add-variant-btn" data-item-id="${item.id}" style="margin-top:4px;font-size:11px;">${_t('add_variant_btn')}</button>
                      </div>
                    </div>
                    <div class="menu-item-actions">
                      ${item.photo_url
                        ? `<img src="${item.photo_url}" class="photo-preview" alt="" loading="lazy">`
                        : `<span style="font-size:11px;color:var(--text-light);width:80px;text-align:center;">${_t('no_photo')}</span>`
                      }
                      <button class="btn btn-sm photo-btn" data-id="${item.id}">${_t('photo_btn')}</button>
                      <button class="btn btn-sm edit-item-btn" data-id="${item.id}" data-cat-id="${item.category_id}" data-name="${item.name}" data-name-km="${item.name_km || ''}" data-name-zh="${item.name_zh || ''}" data-desc="${item.description || ''}" data-desc-km="${item.description_km || ''}" data-desc-zh="${item.description_zh || ''}" data-price="${item.price}" data-avail="${item.is_available}" data-sort="${item.sort_order || 0}">${_t('edit')}</button>
                      <button class="btn btn-sm btn-danger delete-item-btn" data-id="${item.id}">${_t('delete_btn')}</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
  `;

  bindMenuEvents();
  bindDragReorder();

  // Restore scroll position
  if (targetCategoryId) {
    const el = document.getElementById(`cat-${targetCategoryId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo(0, scrollY);
  }
}

// ─── DRAG REORDER ───
function bindDragReorder() {
  // Simple approach: up/down buttons using touch-friendly UI
  // For items: click drag handle to move up or down via modal
  $$('.drag-handle').forEach(handle => {
    handle.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = handle.dataset.type; // 'category' or 'item'
      const id = parseInt(handle.dataset.id);

      if (type === 'category') {
        const catEl = handle.closest('.menu-category');
        const allCats = [...document.querySelectorAll('.menu-category')];
        const idx = allCats.indexOf(catEl);
        showReorderModal(type, id, idx, allCats.length);
      } else if (type === 'item') {
        const row = handle.closest('.menu-item-row');
        const catEl = row.closest('.menu-category');
        const allItems = [...catEl.querySelectorAll('.menu-item-row')];
        const idx = allItems.indexOf(row);
        showReorderModal(type, id, idx, allItems.length, row.dataset.catId);
      }
    });
  });
}

function showReorderModal(type, id, currentIdx, maxIdx, catId) {
  showModal(_t(type === 'category' ? 'reorder_category' : 'reorder_item'), `
    <div style="text-align:center;">
      <p style="margin-bottom:16px;color:var(--text-muted);">${_t('current_position', currentIdx + 1, maxIdx)}</p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="move-up-btn" class="btn" ${currentIdx === 0 ? 'disabled' : ''}>${_t('move_up')}</button>
        <button id="move-down-btn" class="btn" ${currentIdx >= maxIdx - 1 ? 'disabled' : ''}>${_t('move_down')}</button>
      </div>
    </div>
  `, async () => {
    // Save is handled by the buttons below, not the modal save
  });

  // Remove default save behavior and handle manually
  const saveBtn = document.querySelector('.modal .save-btn');
  const cancelBtn = document.querySelector('.modal .cancel-btn');
  if (saveBtn) saveBtn.style.display = 'none';

  const moveUp = document.getElementById('move-up-btn');
  const moveDown = document.getElementById('move-down-btn');

  async function doMove(direction) {
    try {
      await API.postMenu({
        action: type === 'category' ? 'reorder_category' : 'reorder_item',
        id,
        direction, // 'up' or 'down'
        categoryId: catId || undefined,
      });
      toast('Reordered');
      document.querySelector('.modal-overlay')?.remove();
      renderMenu();
    } catch (e) {
      toast('Reorder failed', 'error');
    }
  }

  moveUp?.addEventListener('click', () => doMove('up'));
  moveDown?.addEventListener('click', () => doMove('down'));
}

// ─── MENU EVENTS ───
function bindMenuEvents() {
  $('#add-category-btn')?.addEventListener('click', () => showModal(_t('add_category_title'), `
    <div class="form-group"><label>${_t('name_en')}</label><input id="cat-name" placeholder="Category name"></div>
    <div class="form-group"><label>${_t('name_km')}</label><input id="cat-name-km" placeholder="ឈ្មោះប្រភេទ"></div>
    <div class="form-group"><label>${_t('name_zh')}</label><input id="cat-name-zh" placeholder="分类名称"></div>
    <div class="form-group"><label>${_t('sort_order')}</label><input id="cat-sort" type="number" value="0"></div>
  `, async () => {
    await API.postMenu({ action: 'create_category', name: $('#cat-name').value, nameKm: $('#cat-name-km').value, nameZh: $('#cat-name-zh').value, sortOrder: parseInt($('#cat-sort').value) });
    toast(_t('category_created'));
    renderMenu();
  }));

  $$('.edit-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      showModal(_t('edit_category_title'), `
        <div class="form-group"><label>${_t('name_en')}</label><input id="cat-name" value="${escHtml(btn.dataset.name)}"></div>
        <div class="form-group"><label>${_t('name_km')}</label><input id="cat-name-km" value="${escHtml(btn.dataset.nameKm)}"></div>
        <div class="form-group"><label>${_t('name_zh')}</label><input id="cat-name-zh" value="${escHtml(btn.dataset.nameZh)}"></div>
        <div class="form-group"><label>${_t('sort_order')}</label><input id="cat-sort" type="number" value="${btn.dataset.sort || 0}"></div>
        <div class="form-group">
          <label><input type="checkbox" id="cat-active" ${btn.dataset.active === 'true' ? 'checked' : ''}> ${_t('active_label')}</label>
        </div>
      `, async () => {
        await API.postMenu({ action: 'update_category', id, name: $('#cat-name').value, nameKm: $('#cat-name-km').value, nameZh: $('#cat-name-zh').value, sortOrder: parseInt($('#cat-sort').value), isActive: $('#cat-active').checked });
        toast(_t('category_updated'));
        renderMenu();
      });
    });
  });

  $$('.delete-cat-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(_t('confirm_delete_category'))) return;
      await API.postMenu({ action: 'delete_category', id: parseInt(btn.dataset.id) });
      toast(_t('category_deleted'));
      renderMenu();
    });
  });

  $$('.toggle-cat-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id);
      const isActive = btn.dataset.active === 'true';
      await API.postMenu({ action: 'update_category', id, isActive: !isActive });
      toast(_t('category_updated'));
      renderMenu();
    });
  });

  $$('.bulk-price-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = parseInt(btn.dataset.id);
      showModal(_t('bulk_price_title'), `
        <div class="form-group"><label>${_t('percentage_prompt')}</label><input id="bulk-pct" type="number" placeholder="+10" value="0"></div>
      `, async () => {
        const pct = $('#bulk-pct').value;
        if (!pct || pct == 0) return;
        if (!confirm(_t('confirm_bulk_price', pct))) return;
        await API.postMenu({ action: 'bulk_price_update', categoryId: catId, percentage: pct });
        toast(_t('bulk_price_applied'));
        renderMenu(catId);
      });
    });
  });
  $$('.add-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = parseInt(btn.dataset.catId);
      showModal(_t('add_item_title'), `
        <div class="form-group"><label>${_t('name_en')}</label><input id="item-name" placeholder="Item name"></div>
        <div class="form-group"><label>${_t('name_km')}</label><input id="item-name-km" placeholder="ឈ្មោះម្ហូប"></div>
        <div class="form-group"><label>${_t('name_zh')}</label><input id="item-name-zh" placeholder="菜品名称"></div>
        <div class="form-group"><label>${_t('desc_en')}</label><textarea id="item-desc" rows="2"></textarea></div>
        <div class="form-group"><label>${_t('desc_km')}</label><textarea id="item-desc-km" rows="2"></textarea></div>
        <div class="form-group"><label>${_t('desc_zh')}</label><textarea id="item-desc-zh" rows="2"></textarea></div>
        <div class="form-group"><label>${_t('price_label')}</label><input id="item-price" type="number" step="0.01" min="0" value="0"></div>
      `, async () => {
        const name = $('#item-name').value.trim();
        if (!name) { toast(_t('name_required'), 'error'); return; }
        const price = parseFloat($('#item-price').value) || 0;
        await API.postMenu({ action: 'create_item', categoryId: catId, name, nameKm: $('#item-name-km').value, nameZh: $('#item-name-zh').value, description: $('#item-desc').value.trim(), descriptionKm: $('#item-desc-km').value.trim(), descriptionZh: $('#item-desc-zh').value.trim(), price });
        toast(_t('item_created'));
        renderMenu(catId);
      });
    });
  });

  $$('.edit-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      showModal(_t('edit_item_title'), `
        <div class="form-group"><label>${_t('name_en')}</label><input id="item-name" value="${escHtml(btn.dataset.name)}"></div>
        <div class="form-group"><label>${_t('name_km')}</label><input id="item-name-km" value="${escHtml(btn.dataset.nameKm)}"></div>
        <div class="form-group"><label>${_t('name_zh')}</label><input id="item-name-zh" value="${escHtml(btn.dataset.nameZh)}"></div>
        <div class="form-group"><label>${_t('desc_en')}</label><textarea id="item-desc" rows="2">${escHtml(btn.dataset.desc)}</textarea></div>
        <div class="form-group"><label>${_t('desc_km')}</label><textarea id="item-desc-km" rows="2">${escHtml(btn.dataset.descKm)}</textarea></div>
        <div class="form-group"><label>${_t('desc_zh')}</label><textarea id="item-desc-zh" rows="2">${escHtml(btn.dataset.descZh)}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>${_t('price_label')}</label><input id="item-price" type="number" step="0.01" value="${btn.dataset.price}"></div>
          <div class="form-group"><label>${_t('sort_order')}</label><input id="item-sort" type="number" value="${btn.dataset.sort || 0}"></div>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="item-avail" ${btn.dataset.avail === 'true' ? 'checked' : ''}> ${_t('available_label')}</label>
        </div>
      `, async () => {
        await API.postMenu({
          action: 'update_item', id,
          name: $('#item-name').value,
          nameKm: $('#item-name-km').value,
          nameZh: $('#item-name-zh').value,
          description: $('#item-desc').value,
          descriptionKm: $('#item-desc-km').value,
          descriptionZh: $('#item-desc-zh').value,
          price: parseFloat($('#item-price').value) || 0,
          sortOrder: parseInt($('#item-sort').value) || 0,
          isAvailable: $('#item-avail').checked,
        });
        toast(_t('item_updated'));
        renderMenu();
      });
    });
  });

  $$('.delete-item-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(_t('confirm_delete_item'))) return;
      await API.postMenu({ action: 'delete_item', id: parseInt(btn.dataset.id) });
      toast(_t('item_deleted'));
      renderMenu();
    });
  });

  $$('.add-variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = parseInt(btn.dataset.itemId);
      showModal(_t('add_variant_title'), `
        <div class="form-group"><label>${_t('name_en')}</label><input id="var-name" placeholder="e.g. Small, Large"></div>
        <div class="form-group"><label>${_t('name_km')}</label><input id="var-name-km" placeholder="ឈ្មោះប្រភេទ"></div>
        <div class="form-group"><label>${_t('name_zh')}</label><input id="var-name-zh" placeholder="规格名称"></div>
        <div class="form-row">
          <div class="form-group"><label>${_t('price_label')}</label><input id="var-price" type="number" step="0.01" min="0" value="0"></div>
          <div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:10px;">
            <label><input type="checkbox" id="var-weight"> ${_t('per_kg')}</label>
          </div>
        </div>
      `, async () => {
        const name = $('#var-name').value.trim();
        if (!name) { toast(_t('name_required'), 'error'); return; }
        await API.postMenu({ action: 'create_variant', menuItemId: itemId, name, nameKm: $('#var-name-km').value, nameZh: $('#var-name-zh').value, price: parseFloat($('#var-price').value) || 0, isWeightBased: $('#var-weight').checked });
        toast(_t('variant_created'));
        renderMenu();
      });
    });
  });

  $$('.edit-variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      showModal(_t('edit_variant_title'), `
        <div class="form-group"><label>${_t('name_en')}</label><input id="var-name" value="${escHtml(btn.dataset.name)}"></div>
        <div class="form-group"><label>${_t('name_km')}</label><input id="var-name-km" value="${escHtml(btn.dataset.nameKm)}"></div>
        <div class="form-group"><label>${_t('name_zh')}</label><input id="var-name-zh" value="${escHtml(btn.dataset.nameZh)}"></div>
        <div class="form-row">
          <div class="form-group"><label>${_t('price_label')}</label><input id="var-price" type="number" step="0.01" value="${btn.dataset.price}"></div>
          <div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:10px;">
            <label><input type="checkbox" id="var-weight" ${btn.dataset.weight === 'true' ? 'checked' : ''}> ${_t('per_kg')}</label>
          </div>
        </div>
      `, async () => {
        await API.postMenu({ action: 'update_variant', id, name: $('#var-name').value, nameKm: $('#var-name-km').value, nameZh: $('#var-name-zh').value, price: parseFloat($('#var-price').value) || 0, isWeightBased: $('#var-weight').checked });
        toast(_t('variant_updated'));
        renderMenu();
      });
    });
  });

  $$('.delete-variant-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(_t('confirm_delete_variant'))) return;
      await API.postMenu({ action: 'delete_variant', id: parseInt(btn.dataset.id) });
      toast(_t('variant_deleted'));
      renderMenu();
    });
  });

  $$('.photo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = parseInt(btn.dataset.id);
      showPhotoUpload(itemId);
    });
  });
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── PHOTO UPLOAD ───
function showPhotoUpload(itemId) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>${_t('upload_photo')}</h2>
      <div style="text-align:center;margin-bottom:16px;">
        <canvas id="photo-canvas" hidden></canvas>
        <div id="photo-preview-area" style="width:200px;height:200px;margin:0 auto;border:2px dashed var(--border);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:13px;overflow:hidden;background:var(--cream-dark);">
          <input type="file" id="photo-file-input" accept="image/*" style="display:none">
          <button id="select-photo-btn" class="btn">${_t('select_photo')}</button>
        </div>
      </div>
      <div id="upload-progress" style="text-align:center;display:none;"><div class="spinner"></div><p style="margin-top:8px;color:var(--text-muted);">${_t('uploading')}</p></div>
      <div class="modal-actions">
        <button id="cancel-photo" class="btn">${_t('cancel_btn')}</button>
        <button id="save-photo" class="btn btn-primary" disabled>${_t('upload_btn')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  let selectedFile = null;

  $('#select-photo-btn', overlay).addEventListener('click', () => {
    $('#photo-file-input', overlay).click();
  });

  $('#photo-file-input', overlay).addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = $('#photo-canvas', overlay);
        const ctx = canvas.getContext('2d');
        let w = img.width, h = img.height;
        const maxDim = 800;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const preview = $('#photo-preview-area', overlay);
        preview.innerHTML = '';
        preview.style.border = 'none';
        const previewImg = document.createElement('img');
        previewImg.src = canvas.toDataURL('image/jpeg', 0.8);
        previewImg.style.width = '100%';
        previewImg.style.height = '100%';
        previewImg.style.objectFit = 'cover';
        preview.appendChild(previewImg);

        $('#save-photo', overlay).disabled = false;
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  $('#save-photo', overlay).addEventListener('click', async () => {
    if (!selectedFile) return;
    const canvas = $('#photo-canvas', overlay);
    const base64 = canvas.toDataURL('image/jpeg', 0.8);

    $('#upload-progress', overlay).style.display = 'block';
    $('#save-photo', overlay).disabled = true;
    $('#cancel-photo', overlay).disabled = true;

    try {
      const res = await API.uploadPhoto(itemId, base64);
      if (res.photoUrl) {
        const item = (state.menu?.items || []).find(i => i.id === itemId);
        if (item) item.photo_url = res.photoUrl;

        // Update preview in-place
        const row = document.querySelector(`.photo-btn[data-id="${itemId}"]`)?.closest('.menu-item-row');
        if (row) {
          const actions = row.querySelector('.menu-item-actions');
          if (actions) {
            const oldPreview = actions.querySelector('.photo-preview');
            const oldNoPhoto = actions.querySelector('span:first-child');
            if (oldPreview) oldPreview.remove();
            else if (oldNoPhoto && oldNoPhoto.textContent === _t('no_photo')) oldNoPhoto.remove();

            const photoBtn = actions.querySelector('.photo-btn');
            const img = document.createElement('img');
            img.className = 'photo-preview';
            img.src = res.photoUrl;
            actions.insertBefore(img, photoBtn);
          }
        }
        toast(_t('photo_uploaded'));
        overlay.remove();
      } else {
        toast(res.error || _t('upload_failed'), 'error');
      }
    } catch (e) {
      toast(_t('upload_failed'), 'error');
    }
  });

  $('#cancel-photo', overlay).addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ─── MODAL HELPER ───
function showModal(title, bodyHtml, onSave) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>${title}</h2>
      ${bodyHtml}
      <div class="modal-actions">
        <button class="btn cancel-btn">${_t('cancel_btn')}</button>
        <button class="btn btn-primary save-btn">${_t('save_btn')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  $('.cancel-btn', overlay).addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  $('.save-btn', overlay).addEventListener('click', async () => {
    $('.save-btn', overlay).disabled = true;
    $('.save-btn', overlay).textContent = _t('saving');
    try {
      await onSave();
      overlay.remove();
    } catch (e) {
      toast(_t('save_failed'), 'error');
      $('.save-btn', overlay).disabled = false;
      $('.save-btn', overlay).textContent = _t('save_btn');
    }
  });
}

init();
