const telegram = window.Telegram?.WebApp;
const urlParams = new URLSearchParams(window.location.search);
const urlInitData = urlParams.get('tgWebAppData');
const urlChatId = urlParams.get('chat_id');
telegram?.ready();
telegram?.expand();

// ─── LANGUAGE ───
async function detectLang() {
  // 1) Check localStorage first
  const saved = localStorage.getItem('lang');
  if (saved) return saved;

  // 2) Fetch from backend (user's saved choice from the bot)
  if (urlChatId) {
    try {
      const resp = await fetch(`/api/user-language?chat_id=${urlChatId}`);
      const data = await resp.json();
      if (['en', 'km', 'zh'].includes(data.lang)) {
        localStorage.setItem('lang', data.lang);
        return data.lang;
      }
    } catch (_) {}
  }

  // 3) Fallback to Telegram's initData language
  const userLang = (telegram?.initDataUnsafe?.user?.language_code || 'en').toLowerCase();
  const detected = userLang.startsWith('zh') ? 'zh' : userLang === 'km' ? 'km' : 'en';
  localStorage.setItem('lang', detected);
  return detected;
}

function t(obj, field) {
  const val = obj[field + '_' + state.lang];
  if (val && val.trim()) return val;
  return obj[field]; // fallback to English
}

function setLang(lang) {
  state.lang = lang;
  localStorage.setItem('lang', lang);
  document.querySelector('#lang-select').value = lang;
  // Re-render everything
  renderCategories();
  renderMenu();
  renderCart();
  applyStaticI18n();
  // Persist to backend so Telegram notifications (receipts, status updates)
  // are sent in the same language the customer uses in the web app.
  if (urlChatId) {
    fetch('/api/user-language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: urlChatId, lang }),
    }).catch(() => {});
  }
}

// ─── UI STRING DICTIONARY (menu items come from the DB via t()) ───
const UI_TEXT = {
  en: {
    tagline: 'Delivery & Pickup',
    all_categories: 'All',
    search_menu: 'Search menu',
    search_placeholder: 'Rice, noodles, drinks...',
    your_cart: 'Your cart',
    total: 'Total',
    review_payment_and_address: 'Review payment and address',
    view_cart: 'View cart',
    am: 'AM',
    pm: 'PM',
    add: '+ Add',
    add_kg: 'Add kg',
    kg: 'kg',
    no_items_found: 'No items found',
    no_items_hint: 'Try a different category or search term',
    photo_coming: '📸 Photo coming soon',
    priced_by_weight: 'Priced by weight',
    fixed_price: 'Fixed price',
    quantity: 'Quantity',
    choose_option: 'Choose an option',
    update_cart: 'Update Cart',
    add_to_cart: 'Add to Cart',
    weight: 'Weight',
    remove: 'Remove',
    cart_empty: 'Your cart is empty',
    cart_empty_hint: 'Add items from the menu to get started',
    checkout: 'Checkout',
    order_summary: 'Order Summary',
    how_to_get_order: 'How to get your order?',
    pickup: 'Pickup',
    choose_time: 'Choose time',
    delivery: 'Delivery',
    to_your_place: 'To your place',
    when_to_pickup: 'When to pick up?',
    where_to_deliver: 'Where to deliver?',
    contact_number: 'Contact number',
    phone_placeholder: '+855 12 345 678',
    reach_you_note: 'So the restaurant can reach you if needed.',
    special_instructions: 'Special instructions',
    special_placeholder: 'For example: For Porridge, no soy sauce. No chilli please.',
    optional_note: 'Optional. You can mention a specific item or the whole order.',
    review_your_order: 'Review your order',
    review_note: 'Your order will be sent to the admin for approval first. After approval, you will receive a payment link in Telegram.',
    submit_for_approval: 'Submit for Approval',
    cancel: 'Cancel',
    address_placeholder: 'Street address, apartment, building...',
    pickup_at: 'Pickup at {time} — restaurant will confirm the final time',
    err_contact_required: 'Please enter a contact number',
    err_contact_invalid: 'Please enter a valid contact number (at least 7 digits)',
    err_address_required: 'Please enter delivery address',
    err_time_required: 'Please select pickup date and time',
    err_valid_weight: 'Please enter a valid weight',
    placing_order: 'Placing order...',
    submitted_for_approval: 'Submitted for Approval',
    requested_pickup_time: 'Requested pickup time',
    confirm_exact_time: 'The restaurant will confirm the exact time after approval',
    waiting_admin_approval: 'Waiting for admin approval',
    payment_link_note: 'You will receive a payment link in Telegram after the restaurant confirms availability.',
    back_to_menu: 'Back to Menu',
    failed_to_place: 'Failed to place order',
    menu_unavailable: 'Menu unavailable',
    try_again_later: 'Please try again later',
    remove_item: 'Remove {name}',
    total_label: 'Total',
  },
  km: {
    tagline: 'ការដឹកជញ្ជូន និងការយកដោយខ្លួនឯង',
    all_categories: 'ទាំងអស់',
    search_menu: 'ស្វែងរកម៉ឺនុយ',
    search_placeholder: 'បាយ មី ភេសជ្ជៈ...',
    your_cart: 'កន្ត្រករបស់អ្នក',
    total: 'សរុប',
    review_payment_and_address: 'ពិនិត្យការទូទាត់ និងអាសយដ្ឋាន',
    view_cart: 'មើលកន្ត្រក',
    am: 'ព្រឹក',
    pm: 'ល្ងាច',
    add: '+ បន្ថែម',
    add_kg: 'បន្ថែមគីឡូ',
    kg: 'គីឡូ',
    no_items_found: 'រកមិនឃើញមុខម្ហូប',
    no_items_hint: 'សាកល្បងប្រភេទ ឬពាក្យស្វែងរកផ្សេង',
    photo_coming: '📸 រូបថតនឹងមកដល់ឆាប់ៗ',
    priced_by_weight: 'តម្លៃតាមទម្ងន់',
    fixed_price: 'តម្លៃថេរ',
    quantity: 'ចំនួន',
    choose_option: 'ជ្រើសរើសជម្រើស',
    update_cart: 'ធ្វើបច្ចុប្បន្នភាពកន្ត្រក',
    add_to_cart: 'បន្ថែមទៅកន្ត្រក',
    weight: 'ទម្ងន់',
    remove: 'លុប',
    cart_empty: 'កន្ត្រករបស់អ្នកទទេ',
    cart_empty_hint: 'បន្ថែមមុខម្ហូបពីម៉ឺនុយដើម្បីចាប់ផ្តើម',
    checkout: 'ពិនិត្យការបញ្ជាទិញ',
    order_summary: 'សង្ខេបការបញ្ជាទិញ',
    how_to_get_order: 'តើអ្នកចង់បានការបញ្ជាទិញដោយរបៀបណា?',
    pickup: 'យកដោយខ្លួនឯង',
    choose_time: 'ជ្រើសរើសម៉ោង',
    delivery: 'ដឹកជញ្ជូន',
    to_your_place: 'ទៅដល់កន្លែងរបស់អ្នក',
    when_to_pickup: 'ពេលណាត្រូវយក?',
    where_to_deliver: 'ដឹកជញ្ជូនទៅណា?',
    contact_number: 'លេខទំនាក់ទំនង',
    phone_placeholder: '+855 12 345 678',
    reach_you_note: 'ដើម្បីឱ្យភោជនីយដ្ឋានអាចទាក់ទងអ្នកបើចាំបាច់។',
    special_instructions: 'ការណែនាំពិសេស',
    special_placeholder: 'ឧទាហរណ៍៖ សម្រាប់បបរ គ្មានទឹកស៊ីអ៊ីវ។ សូមកុំម្ទេស។',
    optional_note: 'ស្រេចចិត្ត។ អ្នកអាចបញ្ជាក់មុខម្ហូបណាមួយ ឬការបញ្ជាទិញទាំងមូល។',
    review_your_order: 'ពិនិត្យការបញ្ជាទិញរបស់អ្នក',
    review_note: 'ការបញ្ជាទិញរបស់អ្នកនឹងត្រូវបានផ្ញើទៅកាន់អ្នកគ្រប់គ្រងសម្រាប់ការយល់ព្រមជាមុន។ បន្ទាប់ពីការយល់ព្រម អ្នកនឹងទទួលបានតំណបង់ប្រាក់នៅក្នុង Telegram។',
    submit_for_approval: 'ដាក់ស្នើសម្រាប់ការយល់ព្រម',
    cancel: 'បោះបង់',
    address_placeholder: 'អាសយដ្ឋាន ផ្ទះល្វែង អាគារ...',
    pickup_at: 'យកដោយខ្លួនឯងនៅ {time} — ភោជនីយដ្ឋាននឹងបញ្ជាក់ម៉ោងចុងក្រោយ',
    err_contact_required: 'សូមបញ្ចូលលេខទំនាក់ទំនង',
    err_contact_invalid: 'សូមបញ្ចូលលេខទំនាក់ទំនងត្រឹមត្រូវ (យ៉ាងតិច ៧ ខ្ទង់)',
    err_address_required: 'សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន',
    err_time_required: 'សូមជ្រើសរើសកាលបរិច្ឆេទ និងម៉ោងយក',
    err_valid_weight: 'សូមបញ្ចូលទម្ងន់ត្រឹមត្រូវ',
    placing_order: 'កំពុងដាក់ការបញ្ជាទិញ...',
    submitted_for_approval: 'បានដាក់ស្នើសម្រាប់ការយល់ព្រម',
    requested_pickup_time: 'ម៉ោងយកដែលបានស្នើសុំ',
    confirm_exact_time: 'ភោជនីយដ្ឋាននឹងបញ្ជាក់ម៉ោងពិតប្រាកដបន្ទាប់ពីការយល់ព្រម',
    waiting_admin_approval: 'កំពុងរង់ចាំការយល់ព្រមពីអ្នកគ្រប់គ្រង',
    payment_link_note: 'អ្នកនឹងទទួលបានតំណបង់ប្រាក់នៅក្នុង Telegram បន្ទាប់ពីភោជនីយដ្ឋានបញ្ជាក់អំពីភាពអាចរកបាន។',
    back_to_menu: 'ត្រឡប់ទៅម៉ឺនុយ',
    failed_to_place: 'មិនអាចដាក់ការបញ្ជាទិញបានទេ',
    menu_unavailable: 'ម៉ឺនុយមិនអាចប្រើបាន',
    try_again_later: 'សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ',
    remove_item: 'លុប {name}',
    total_label: 'សរុប',
  },
  zh: {
    tagline: '配送与自取',
    all_categories: '全部',
    search_menu: '搜索菜单',
    search_placeholder: '米饭、面条、饮品...',
    your_cart: '您的购物车',
    total: '总计',
    review_payment_and_address: '查看付款和地址',
    view_cart: '查看购物车',
    am: '上午',
    pm: '下午',
    add: '+ 添加',
    add_kg: '添加公斤',
    kg: '公斤',
    no_items_found: '未找到商品',
    no_items_hint: '请尝试其他类别或搜索词',
    photo_coming: '📸 照片即将推出',
    priced_by_weight: '按重量计价',
    fixed_price: '固定价格',
    quantity: '数量',
    choose_option: '选择一个选项',
    update_cart: '更新购物车',
    add_to_cart: '添加到购物车',
    weight: '重量',
    remove: '删除',
    cart_empty: '您的购物车是空的',
    cart_empty_hint: '从菜单中添加商品即可开始',
    checkout: '结账',
    order_summary: '订单摘要',
    how_to_get_order: '您希望如何获取订单？',
    pickup: '自取',
    choose_time: '选择时间',
    delivery: '配送',
    to_your_place: '送到您的地点',
    when_to_pickup: '什么时候取？',
    where_to_deliver: '配送至何处？',
    contact_number: '联系电话',
    phone_placeholder: '+855 12 345 678',
    reach_you_note: '以便餐厅在需要时联系您。',
    special_instructions: '特殊说明',
    special_placeholder: '例如：粥不要酱油。请不要辣椒。',
    optional_note: '可选。您可以提及特定商品或整个订单。',
    review_your_order: '查看您的订单',
    review_note: '您的订单将先发送给管理员审批。批准后，您将在 Telegram 中收到付款链接。',
    submit_for_approval: '提交审批',
    cancel: '取消',
    address_placeholder: '街道地址、公寓、大楼...',
    pickup_at: '在 {time} 自取 — 餐厅将确认最终时间',
    err_contact_required: '请输入联系电话',
    err_contact_invalid: '请输入有效的联系电话（至少 7 位数字）',
    err_address_required: '请输入配送地址',
    err_time_required: '请选择自取日期和时间',
    err_valid_weight: '请输入有效重量',
    placing_order: '正在下单...',
    submitted_for_approval: '已提交审批',
    requested_pickup_time: '请求的自取时间',
    confirm_exact_time: '批准后餐厅将确认确切时间',
    waiting_admin_approval: '等待管理员批准',
    payment_link_note: '餐厅确认可用性后，您将在 Telegram 中收到付款链接。',
    back_to_menu: '返回菜单',
    failed_to_place: '下单失败',
    menu_unavailable: '菜单不可用',
    try_again_later: '请稍后重试',
    remove_item: '删除 {name}',
    total_label: '总计',
  },
};

/** Look up a UI string in the current language. Supports {placeholder} substitution. */
function tr(key, vars = {}) {
  const table = UI_TEXT[state.lang] || UI_TEXT.en;
  let s = table[key] !== undefined ? table[key] : UI_TEXT.en[key];
  if (s === undefined) return key;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

/** Apply translated strings to static HTML elements (data-i18n attributes). */
function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = tr(el.dataset.i18n);
  });
  const searchEl = document.querySelector('#search');
  if (searchEl) searchEl.placeholder = tr('search_placeholder');
  document.title = tr('tagline');
}

const state = { categories: [], selectedCategory: 'all', search: '', cart: new Map(), prevCount: 0, lang: 'en' };
const menuElement = document.querySelector('#menu');
const categoriesElement = document.querySelector('#categories');
const searchElement = document.querySelector('#search');
const cartPanel = document.querySelector('#cart-panel');
const backdrop = document.querySelector('#backdrop');
const floatingCart = document.querySelector('#cart-button');
const cartBadge = document.querySelector('#cart-count-floating');

function money(value) { return `$${Number(value).toFixed(2)}`; }
function cartKey(itemId, variantId) { return variantId ? `${itemId}:${variantId}` : `${itemId}:`; }

function renderTimePicker(defaultTime24) {
  const [h, m] = defaultTime24.split(':').map(Number);
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  return `
    <select id="pickup-hour" class="input-field" style="text-align:center;font-size:15px;font-weight:600;">
      ${hours.map(h => `<option value="${h}" ${h === hour ? 'selected' : ''}>${h}</option>`).join('')}
    </select>
    <span style="font-size:18px;font-weight:700;color:var(--text-muted);">:</span>
    <select id="pickup-minute" class="input-field" style="text-align:center;font-size:15px;font-weight:600;">
      ${minutes.map(ms => `<option value="${ms}" ${ms === String(m).padStart(2, '0') ? 'selected' : ''}>${ms}</option>`).join('')}
    </select>
    <select id="pickup-ampm" class="input-field" style="text-align:center;font-size:15px;font-weight:600;color:var(--primary);">
      <option value="AM" ${ampm === 'AM' ? 'selected' : ''}>${tr('am')}</option>
      <option value="PM" ${ampm === 'PM' ? 'selected' : ''}>${tr('pm')}</option>
    </select>
  `;
}

function getPickupTime24() {
  const hour = parseInt(document.querySelector('#pickup-hour').value, 10);
  const minute = document.querySelector('#pickup-minute').value;
  const ampm = document.querySelector('#pickup-ampm').value;
  let h24 = hour;
  if (ampm === 'PM' && hour !== 12) h24 = hour + 12;
  if (ampm === 'AM' && hour === 12) h24 = 0;
  return `${String(h24).padStart(2, '0')}:${minute}`;
}

/** Add minutes to a "HH:mm" string, wrapping past midnight. */
function addMinutes(time24, mins) {
  const [h, m] = time24.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = ((Math.floor(total / 60)) % 24);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function formatTime12(time24) {
  const [h, m] = time24.split(':').map(Number);
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const ampm = h >= 12 ? tr('pm') : tr('am');
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Compute the prep-adjusted time from the current picker values. */
function getConfirmedPickupTime24() {
  return addMinutes(getPickupTime24(), 35);
}

/** Refresh the pickup time preview beneath the time picker. */
function updateReadyBy() {
  const el = document.querySelector('#pickup-ready');
  if (!el) return;
  const time24 = getPickupTime24();
  el.innerHTML = `🕐 ${tr('pickup_at', { time: `<strong style="color:var(--primary);">${formatTime12(time24)}</strong>` })}`;
}

function allItems() { return state.categories.flatMap((c) => c.items); }

function selectedItems() {
  const items = state.selectedCategory === 'all' ? allItems() : state.categories.find((c) => c.id === state.selectedCategory)?.items || [];
  const query = state.search.trim().toLowerCase();
  return query ? items.filter((i) => `${i.name} ${i.name_km || ''} ${i.name_zh || ''} ${i.description || ''} ${i.description_km || ''} ${i.description_zh || ''}`.toLowerCase().includes(query)) : items;
}

function cartQuantity(itemId, variantId) { return state.cart.get(cartKey(itemId, variantId))?.quantity || 0; }

/** Total quantity of an item across all variants in cart (for badge display) */
function cartItemTotal(itemId) {
  let total = 0;
  for (const [key, entry] of state.cart) {
    if (key.startsWith(`${itemId}:`)) total += entry.quantity;
  }
  return total;
}

// ─── RENDER CATEGORIES ───
function renderCategories() {
  categoriesElement.innerHTML = '';
  const categories = [{ id: 'all', name: tr('all_categories') }, ...state.categories];
  for (const category of categories) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = t(category, 'name');
    button.className = state.selectedCategory === category.id ? 'active' : '';
    button.onclick = () => {
      state.selectedCategory = category.id;
      renderCategories();
      renderMenu();
      button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    };
    categoriesElement.append(button);
  }
}

// ─── BUILD CARD BOTTOM CONTROLS ───
// Returns a <div class="menu-bottom"> with the right price + add/qty controls.
// Used both when building the full menu and when surgically refreshing one card.
function buildCardBottom(item) {
  const bottom = document.createElement('div');
  bottom.className = 'menu-bottom';

  if (item.variants && item.variants.length > 1) {
    // Multi-variant: show total quantity when in cart, otherwise "+ Add"
    // Tapping either opens the variant picker
    const totalQty = cartItemTotal(item.id);
    const price = document.createElement('span');
    price.className = 'price';
    const minPrice = Math.min(...item.variants.map(v => v.price));
    const maxPrice = Math.max(...item.variants.map(v => v.price));
    price.textContent = minPrice === maxPrice ? money(minPrice) : `${money(minPrice)}–${money(maxPrice)}`;
    bottom.append(price);

    if (totalQty > 0) {
      const qtyBtn = document.createElement('button');
      qtyBtn.className = 'add-button';
      qtyBtn.textContent = String(totalQty);
      qtyBtn.onclick = (e) => { e.stopPropagation(); showVariantPicker(item); };
      bottom.append(qtyBtn);
    } else {
      const add = document.createElement('button');
      add.className = 'add-button';
      add.textContent = tr('add');
      add.onclick = (e) => { e.stopPropagation(); showVariantPicker(item); };
      bottom.append(add);
    }
  } else {
    const variant = item.variants?.[0] || null;
    const vId = variant?.id || null;
    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = money(variant ? variant.price : item.price);
    bottom.append(price);

    const count = cartQuantity(item.id, vId);
    if (variant && variant.isWeightBased) {
      const entry = state.cart.get(cartKey(item.id, vId));
      const wt = entry ? entry.quantity : 0;
        if (wt > 0) {
          const controls = document.createElement('div');
          controls.className = 'quantity';
          const minus = document.createElement('button');
          minus.textContent = '−';
          minus.onclick = (e) => { e.stopPropagation(); updateCart(item.id, vId, Math.max(0, wt - 0.5)); };
          const label = document.createElement('strong');
          label.textContent = `${wt.toFixed(1)} ${tr('kg')}`;
          const plus = document.createElement('button');
          plus.textContent = '+';
          plus.onclick = (e) => { e.stopPropagation(); updateCart(item.id, vId, wt + 0.5); };
          controls.append(minus, label, plus);
          bottom.append(controls);
      } else {
        const add = document.createElement('button');
        add.className = 'add-button';
        add.textContent = tr('add_kg');
        add.onclick = (e) => { e.stopPropagation(); showWeightInput(item); };
        bottom.append(add);
      }
    } else if (count > 0) {
      const controls = document.createElement('div');
      controls.className = 'quantity';
      const minus = document.createElement('button');
      minus.textContent = '−';
      minus.onclick = (e) => { e.stopPropagation(); updateCart(item.id, vId, count - 1); };
      const label = document.createElement('strong');
      label.textContent = count;
      const plus = document.createElement('button');
      plus.textContent = '+';
      plus.onclick = (e) => { e.stopPropagation(); updateCart(item.id, vId, count + 1); };
      controls.append(minus, label, plus);
      bottom.append(controls);
    } else {
      const add = document.createElement('button');
      add.className = 'add-button';
      add.textContent = variant ? `+ ${t(variant, 'name')}` : tr('add');
      add.onclick = (e) => { e.stopPropagation(); updateCart(item.id, vId, 1); flyToCart(item.id); };
      bottom.append(add);
    }
  }

  return bottom;
}

// ─── SURGICAL CARD REFRESH ───
// Only swaps the bottom controls of ONE card — no full re-render.
function refreshCardBottom(itemId) {
  const card = menuElement.querySelector(`article[data-item-id="${itemId}"]`);
  if (!card) return;
  const item = allItems().find(i => i.id === itemId);
  if (!item) return;
  const oldBottom = card.querySelector('.menu-bottom');
  const newBottom = buildCardBottom(item);
  oldBottom.replaceWith(newBottom);
}



// ─── RENDER MENU ───
function renderMenu() {
  menuElement.innerHTML = '';
  const items = selectedItems();
  if (!items.length) {
    menuElement.innerHTML = `
      <div class="empty-state">
        <div class="icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <h3>${tr('no_items_found')}</h3>
        <p>${tr('no_items_hint')}</p>
      </div>
    `;
    menuElement.style.display = 'block';
    return;
  }
  menuElement.style.display = 'grid';
  for (const [index, item] of items.entries()) {
    const card = document.createElement('article');
    card.className = 'menu-card';
    card.dataset.itemId = item.id;
    card.style.animation = `fadeInUp 0.25s ease ${index * 0.03}s both`;

    if (item.hasPhoto) {
      const image = document.createElement('img');
      image.alt = t(item, 'name'); image.src = `/api/photo?id=${item.id}`;
      image.loading = 'lazy';
      image.style.cursor = 'pointer';
      image.addEventListener('click', (e) => { e.stopPropagation(); showDetail(image.src); });
      card.append(image);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder';
      placeholder.textContent = tr('photo_coming');
      card.append(placeholder);
    }

    const content = document.createElement('div');
    content.className = 'menu-content';

    const title = document.createElement('h2');
    title.textContent = t(item, 'name');

    const description = document.createElement('p');
    description.textContent = t(item, 'description') || '';

    content.append(title, description, buildCardBottom(item));
    card.append(content);
    menuElement.append(card);
  }
}

// ─── VARIANT PICKER OVERLAY ───
// Optional editKey = cartKey() of existing entry; when set, picker pre-selects
// the current variant/quantity and uses REPLACE (not additive) on save.
function showVariantPicker(item, editKey) {
  // Close cart if open
  toggleCart(false);

  // If editing, look up the existing cart entry
  const existingEntry = editKey ? state.cart.get(editKey) : null;
  const existingVariantId = existingEntry?.variant?.id;
  const existingQty = existingEntry?.quantity || 1;

  // Build the variant options HTML with pre-selection
  const optionsHTML = item.variants.map((v, i) => {
    const isSelected = editKey ? (v.id === existingVariantId) : (i === 0);
    const initialQty = editKey && existingVariantId === v.id
      ? (v.isWeightBased ? existingQty : existingQty)
      : (v.isWeightBased ? 1.0 : (cartQuantity(item.id, v.id) || 1));
    return `
      <label class="option-card ${isSelected ? 'selected' : ''}" data-variant-id="${v.id}" data-weight="${v.isWeightBased}">
        <input type="radio" name="variant" value="${v.id}" ${isSelected ? 'checked' : ''} hidden>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:700;font-size:16px;">${t(v, 'name')}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:2px;">${v.isWeightBased ? tr('priced_by_weight') : tr('fixed_price')}</div>
          </div>
          <span style="font-weight:800;font-size:16px;color:var(--text-main);">${money(v.price)}</span>
        </div>
        <div class="variant-controls" data-variant-id="${v.id}" style="${isSelected ? 'margin-top:16px;padding-top:16px;border-top:1px solid var(--border);' : 'display:none;margin-top:16px;padding-top:16px;border-top:1px solid var(--border);'}">
          ${v.isWeightBased
            ? `<div style="display:flex;align-items:center;gap:12px;">
                 <div style="position:relative;flex:1;">
                   <input type="number" class="input-field weight-input" min="0.1" step="0.1" value="${initialQty}" style="text-align:center;font-size:18px;font-weight:700;padding-right:40px;">
                   <span style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-weight:600;color:var(--text-muted);">${tr('kg')}</span>
                 </div>
                 <span style="font-weight:800;font-size:18px;color:var(--primary);min-width:80px;text-align:right;" class="weight-total">${money(v.price * initialQty)}</span>
               </div>`
            : `<div style="display:flex;justify-content:space-between;align-items:center;">
                 <span style="font-weight:600;color:var(--text-muted);">${tr('quantity')}</span>
                 <div class="quantity">
                   <button class="variant-qty-btn" type="button" data-action="minus">−</button>
                   <strong class="variant-qty">${initialQty}</strong>
                   <button class="variant-qty-btn" type="button" data-action="plus">+</button>
                 </div>
               </div>`
          }
        </div>
      </label>
    `;
  }).join('');

  const sheet = document.createElement('div');
  sheet.className = 'bottom-sheet';
  sheet.innerHTML = `
    <div class="cart-header" style="border-bottom:none;padding-bottom:12px;">
      <h2 style="font-size:22px;">${t(item, 'name')}</h2>
      <button class="close-sheet" type="button" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div style="padding: 0 24px 24px; overflow-y: auto;">
      ${t(item, 'description') ? `<p style="color:var(--text-muted);margin-bottom:20px;line-height:1.4;">${t(item, 'description')}</p>` : ''}
      <h3 style="font-size:16px;margin:0 0 12px;">${tr('choose_option')}</h3>
      <div id="variant-options" style="display:flex;flex-direction:column;gap:12px;">
        ${optionsHTML}
      </div>
      <button id="add-variant-cart" class="primary-button" style="margin-top:24px;">${editKey ? tr('update_cart') : tr('add_to_cart')}</button>
    </div>
  `;

  document.body.appendChild(sheet);
  backdrop.hidden = false;
  
  // Trigger opening animation
  requestAnimationFrame(() => sheet.classList.add('open'));

  const closeSheet = () => {
    sheet.classList.remove('open');
    backdrop.hidden = true;
    setTimeout(() => sheet.remove(), 350);
  };

  sheet.querySelector('.close-sheet').addEventListener('click', closeSheet);
  backdrop.onclick = closeSheet;

  sheet.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      sheet.querySelectorAll('.option-card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('.variant-controls').style.display = 'none';
      });
      card.classList.add('selected');
      const controls = card.querySelector('.variant-controls');
      controls.style.display = 'block';
    });
  });

  sheet.querySelectorAll('.variant-qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent clicking card
      const controls = btn.closest('.variant-controls');
      const qtyEl = controls.querySelector('.variant-qty');
      let qty = parseInt(qtyEl.textContent, 10) || 1;
      qty = btn.dataset.action === 'plus' ? qty + 1 : Math.max(1, qty - 1); // min 1
      qtyEl.textContent = qty;
    });
  });

  sheet.querySelectorAll('.weight-input').forEach(inp => {
    inp.addEventListener('click', e => e.stopPropagation());
    inp.addEventListener('input', (e) => {
      e.stopPropagation();
      const controls = inp.closest('.variant-controls');
      const variantId = Number(controls.dataset.variantId);
      const variant = item.variants.find(v => v.id === variantId);
      const kg = parseFloat(inp.value) || 0;
      controls.querySelector('.weight-total').textContent = money(variant.price * kg);
    });
  });

  sheet.querySelector('#add-variant-cart').addEventListener('click', () => {
    const selected = sheet.querySelector('input[name="variant"]:checked');
    if (!selected) return;
    const variantId = Number(selected.value);
    const variant = item.variants.find(v => v.id === variantId);
    const controls = sheet.querySelector(`.variant-controls[data-variant-id="${variantId}"]`);
    
    if (variant.isWeightBased) {
      const kg = parseFloat(controls.querySelector('.weight-input').value) || 0;
      if (kg <= 0) { telegram?.showAlert?.(tr('err_valid_weight')); return; }
      if (editKey) {
        // Replace the entry entirely (edit mode)
        updateCart(item.id, variantId, kg);
      } else {
        const current = state.cart.get(cartKey(item.id, variantId))?.quantity || 0;
        updateCart(item.id, variantId, current + kg);
      }
    } else {
      const qty = parseInt(controls.querySelector('.variant-qty').textContent, 10) || 1;
      if (editKey) {
        // Replace the entry entirely (edit mode)
        updateCart(item.id, variantId, qty);
      } else {
        const current = state.cart.get(cartKey(item.id, variantId))?.quantity || 0;
        updateCart(item.id, variantId, current + qty);
      }
    }
    
    closeSheet();
  });
}

// ─── WEIGHT INPUT OVERLAY ───
function showWeightInput(item) {
  toggleCart(false);
  const variant = item.variants?.[0] || { id: null, name: 'Per kg', name_km: null, name_zh: null, price: item.price, isWeightBased: true };
  const vId = variant.id;
  const entry = state.cart.get(cartKey(item.id, vId));
  const currentKg = entry ? entry.quantity : 0;

  const sheet = document.createElement('div');
  sheet.className = 'bottom-sheet';
  sheet.innerHTML = `
    <div class="cart-header" style="border-bottom:none;padding-bottom:12px;">
      <h2 style="font-size:22px;">${t(item, 'name')}</h2>
      <button class="close-sheet" type="button" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div style="padding: 0 24px 24px;">
      ${t(item, 'description') ? `<p style="color:var(--text-muted);margin-bottom:24px;line-height:1.4;">${t(item, 'description')}</p>` : ''}
      
      <div style="background:var(--surface-hover);padding:24px;border-radius:var(--radius-lg);text-align:center;">
        <div style="font-size:14px;color:var(--text-muted);margin-bottom:4px;">${t(variant, 'name') || tr('weight')}</div>
        <div style="font-size:24px;font-weight:800;color:var(--text-main);margin-bottom:20px;">${money(variant.price)} <span style="font-size:16px;color:var(--text-muted);font-weight:600;">/ ${tr('kg')}</span></div>
        
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;">
          <button id="weight-minus" class="stepper-btn" type="button">−</button>
          <div style="position:relative;width:130px;">
            <input type="number" id="weight-input" class="input-field" min="0.1" step="0.1" value="${currentKg || 1.0}" style="width:100%;text-align:center;font-size:20px;font-weight:700;padding-right:36px;box-sizing:border-box;">
            <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-weight:600;font-size:14px;color:var(--text-muted);pointer-events:none;">${tr('kg')}</span>
          </div>
          <button id="weight-plus" class="stepper-btn" type="button">+</button>
        </div>
        
        <div style="margin-top:24px;font-size:15px;color:var(--text-muted);font-weight:500;">
          ${tr('total')}: <span id="weight-total" style="font-weight:800;font-size:22px;color:var(--primary);margin-left:8px;">${money(variant.price * (currentKg || 1.0))}</span>
        </div>
      </div>
      
      <div style="display:flex;gap:12px;margin-top:24px;">
        ${currentKg > 0 ? `<button id="remove-weight" class="primary-button" style="flex:1;background:var(--surface-hover);color:var(--text-main);box-shadow:none;">${tr('remove')}</button>` : ''}
        <button id="save-weight" class="primary-button" style="${currentKg > 0 ? 'flex:2;' : 'flex:1;'}">${currentKg > 0 ? tr('update_cart') : tr('add_to_cart')}</button>
      </div>
    </div>
  `;

  document.body.appendChild(sheet);
  backdrop.hidden = false;
  requestAnimationFrame(() => sheet.classList.add('open'));

  const closeSheet = () => {
    sheet.classList.remove('open');
    backdrop.hidden = true;
    setTimeout(() => sheet.remove(), 350);
  };

  sheet.querySelector('.close-sheet').addEventListener('click', closeSheet);
  backdrop.onclick = closeSheet;

  const input = sheet.querySelector('#weight-input');
  const totalEl = sheet.querySelector('#weight-total');
  const minusBtn = sheet.querySelector('#weight-minus');
  const plusBtn = sheet.querySelector('#weight-plus');

  function updateTotal() {
    const kg = parseFloat(input.value) || 0;
    totalEl.textContent = money(variant.price * kg);
  }

  function stepWeight(delta) {
    const current = parseFloat(input.value) || 0;
    const next = Math.max(0.1, current + delta);
    input.value = next.toFixed(1);
    updateTotal();
  }

  input.addEventListener('input', updateTotal);
  minusBtn.addEventListener('click', () => stepWeight(-0.5));
  plusBtn.addEventListener('click', () => stepWeight(0.5));

  sheet.querySelector('#save-weight').addEventListener('click', () => {
    const kg = parseFloat(sheet.querySelector('#weight-input').value) || 0;
    if (kg <= 0) { telegram?.showAlert?.(tr('err_valid_weight')); return; }
    updateCart(item.id, vId, kg);
    closeSheet();
  });

  sheet.querySelector('#remove-weight')?.addEventListener('click', () => {
    updateCart(item.id, vId, 0);
    closeSheet();
  });
}

// ─── UPDATE CART ───
function updateCart(itemId, variantId, nextQuantity) {
  const key = cartKey(itemId, variantId);
  const prev = state.cart.get(key)?.quantity || 0;
  if (nextQuantity <= 0) {
    state.cart.delete(key);
  } else {
    const item = allItems().find(i => i.id === itemId);
    if (!item) return;
    const variant = item.variants?.find(v => v.id === variantId) || null;
    state.cart.set(key, { item, variant, quantity: Math.min(nextQuantity, variant?.isWeightBased ? 50 : 99) });
  }
  // Only refresh the single card that changed — no full menu re-render
  refreshCardBottom(itemId);
  renderCart();
  if (nextQuantity > prev) {
    cartBadge.classList.remove('bounce');
    void cartBadge.offsetWidth;
    cartBadge.classList.add('bounce');
  }
}

// ─── RENDER CART ───
function renderCart() {
  const lines = [...state.cart.values()];
  // Show cart whenever there are items (weight-based or not)
  const hasItems = lines.length > 0;
  // Badge counts non-weight items by unit, and each weight item as "1" (the badge shows item variety)
  const badgeCount = lines.reduce((sum, l) => sum + (l.variant?.isWeightBased ? 1 : Math.ceil(l.quantity)), 0);
  const total = lines.reduce((sum, l) => {
    const price = l.variant ? l.variant.price : l.item.price;
    return sum + price * l.quantity;
  }, 0);

  if (hasItems) {
    floatingCart.classList.remove('hidden');
  } else {
    floatingCart.classList.add('hidden');
  }

  cartBadge.textContent = badgeCount;
  document.querySelector('#cart-total').textContent = money(total);
  const floatingTotal = document.querySelector('#cart-total-floating');
  if (floatingTotal) floatingTotal.textContent = money(total);

  const element = document.querySelector('#cart-items');
  element.innerHTML = '';

  if (!lines.length) {
    element.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <p>${tr('cart_empty')}</p>
        <p style="color: var(--text-light); font-size: 14px; margin-top: 4px;">${tr('cart_empty_hint')}</p>
      </div>
    `;
    return;
  }

  for (const line of lines) {
    const row = document.createElement('div');
    row.className = 'cart-line';

    const img = document.createElement('img');
    img.className = 'cart-line-img';
    img.src = `/api/photo?id=${line.item.id}`;
    img.alt = t(line.item, 'name');
    img.loading = 'lazy';

    const details = document.createElement('div');
    details.className = 'cart-line-details';

    // Item name
    const info = document.createElement('div');
    info.className = 'cart-line-info';
    info.innerHTML = `<div class="name">${t(line.item, 'name')}</div>`;
    details.append(info);

    const price = line.variant ? line.variant.price : line.item.price;

    // Variant section
    if (line.variant) {
      const hasMultiVariants = line.item.variants && line.item.variants.length > 1;
      if (hasMultiVariants) {
        // Tappable variant badge — opens variant picker in edit mode
        const vBtn = document.createElement('button');
        vBtn.className = 'cart-line-variant';
        vBtn.innerHTML = `${t(line.variant, 'name')} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>`;
        vBtn.onclick = () => showVariantPicker(line.item, cartKey(line.item.id, line.variant.id));
        details.append(vBtn);
      } else {
        // Single variant — just show the name
        const vLabel = document.createElement('div');
        vLabel.className = 'cart-line-variant-label';
        vLabel.textContent = t(line.variant, 'name');
        details.append(vLabel);
      }
    }

    // Quantity controls
    const controls = document.createElement('div');
    controls.className = 'cart-line-controls';

    if (line.variant?.isWeightBased) {
      controls.innerHTML = `
        <div class="quantity cart-line-qty">
          <button type="button" class="qty-minus">−</button>
          <strong>${line.quantity.toFixed(1)} ${tr('kg')}</strong>
          <button type="button" class="qty-plus">+</button>
        </div>
      `;
    } else {
      controls.innerHTML = `
        <div class="quantity cart-line-qty">
          <button type="button" class="qty-minus">−</button>
          <strong>${line.quantity}</strong>
          <button type="button" class="qty-plus">+</button>
        </div>
      `;
    }

    const minusBtn = controls.querySelector('.qty-minus');
    const plusBtn = controls.querySelector('.qty-plus');
    const itemId = line.item.id;
    const vId = line.variant?.id ?? null;

    minusBtn.onclick = (e) => {
      e.stopPropagation();
      if (line.variant?.isWeightBased) {
        updateCart(itemId, vId, Math.max(0, line.quantity - 0.5));
      } else {
        updateCart(itemId, vId, line.quantity - 1);
      }
    };
    plusBtn.onclick = (e) => {
      e.stopPropagation();
      if (line.variant?.isWeightBased) {
        updateCart(itemId, vId, line.quantity + 0.5);
      } else {
        updateCart(itemId, vId, line.quantity + 1);
      }
    };

    details.append(controls);

    // Right column: price + delete
    const rightCol = document.createElement('div');
    rightCol.className = 'cart-line-right';

    const priceEl = document.createElement('div');
    priceEl.className = 'cart-line-price';
    priceEl.textContent = money(price * line.quantity);

    const del = document.createElement('button');
    del.className = 'cart-line-del';
    del.setAttribute('aria-label', tr('remove_item', { name: t(line.item, 'name') }));
    del.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    del.onclick = (e) => { e.stopPropagation(); updateCart(itemId, vId, 0); };

    rightCol.append(priceEl, del);
    row.append(img, details, rightCol);
    element.append(row);
  }
}

// ─── TOGGLE CART ───
function toggleCart(open) {
  cartPanel.classList.toggle('open', open);
  cartPanel.setAttribute('aria-hidden', String(!open));
  backdrop.hidden = !open;
  if (open) {
    floatingCart.classList.add('hidden');
  } else {
    if (state.cart.size > 0) floatingCart.classList.remove('hidden');
  }
}

// ─── SHOW CHECKOUT ───
function showCheckout() {
  const lines = [...state.cart.values()];
  if (!lines.length) {
    telegram?.showAlert?.(tr('cart_empty'));
    return;
  }
  toggleCart(false);
  floatingCart.classList.add('hidden');
  menuElement.innerHTML = '';
  categoriesElement.innerHTML = '';
  menuElement.style.display = 'block';

  const now = new Date();
  const defaultTime = new Date(now.getTime() + 60 * 60 * 1000);
  const defaultDate = defaultTime.toISOString().split('T')[0];
  const defaultTimeValue = defaultTime.toISOString().slice(11, 16);

  const checkoutHTML = `
    <div class="checkout-view" style="padding: 16px; max-width: 600px; margin: 0 auto;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <button id="back-to-menu" type="button" style="background: transparent; border: none; font-size: 24px; padding: 0; cursor: pointer; color: var(--primary); width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; transition: background 0.2s;">←</button>
        <h2 style="margin: 0; font-size: 20px;">${tr('checkout')}</h2>
      </div>

      <div style="background: var(--surface); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border); margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px; font-size: 13px; color: var(--primary); text-transform: uppercase; letter-spacing: 0.08em;">${tr('order_summary')}</h3>
        ${lines.map(l => {
          const price = l.variant ? l.variant.price : l.item.price;
          const detail = l.variant?.isWeightBased
            ? `${l.quantity} ${tr('kg')} × ${money(price)}`
            : `× ${l.quantity}`;
          const varName = l.variant ? ` (${t(l.variant, 'name')})` : '';
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="/api/photo?id=${l.item.id}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; background: var(--surface-hover);">
                <div>
                  <div style="font-weight: 600; font-size: 14px;">${t(l.item, 'name')}${varName}</div>
                  <div style="font-size: 12px; color: var(--text-light);">${detail}</div>
                </div>
              </div>
              <span style="font-weight: 700;">${money(price * l.quantity)}</span>
            </div>
          `;
        }).join('')}
        <div style="border-top: 1px solid var(--divider); margin-top: 8px; padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; color: var(--text-muted);">${tr('total')}</span>
          <span style="font-size: 20px; font-weight: 800; color: var(--primary);">${money(lines.reduce((s, l) => s + (l.variant ? l.variant.price : l.item.price) * l.quantity, 0))}</span>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; color: var(--primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${tr('how_to_get_order')}</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <label class="option-card selected" data-value="pickup">
            <input type="radio" name="fulfillment" value="pickup" checked hidden>
            <div style="font-size: 20px; margin-bottom: 4px;">🛍️</div>
            <div style="font-weight: 600; font-size: 14px;">${tr('pickup')}</div>
            <div style="font-size: 11px; color: var(--text-light);">${tr('choose_time')}</div>
          </label>
          <label class="option-card" data-value="delivery">
            <input type="radio" name="fulfillment" value="delivery" hidden>
            <div style="font-size: 20px; margin-bottom: 4px;">🚚</div>
            <div style="font-weight: 600; font-size: 14px;">${tr('delivery')}</div>
            <div style="font-size: 11px; color: var(--text-light);">${tr('to_your_place')}</div>
          </label>
        </div>
      </div>

      <div id="fulfillment-details" style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; color: var(--primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${tr('when_to_pickup')}</h3>
        <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
          <input type="date" id="pickup-date" class="input-field" value="${defaultDate}">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${renderTimePicker(defaultTimeValue)}
          </div>
        </div>
        <div id="pickup-ready" style="margin-top: 8px; font-size: 13px; color: var(--text-muted);">
          🕐 ${tr('pickup_at', { time: `<strong style="color: var(--primary);">${formatTime12(defaultTimeValue)}</strong>` })}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; color: var(--primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${tr('contact_number')}</h3>
        <input type="tel" id="customer-phone" class="input-field" placeholder="${tr('phone_placeholder')}" inputmode="tel" style="font-family: inherit;">
        <div style="font-size: 12px; color: var(--text-light); margin-top: 6px;">${tr('reach_you_note')}</div>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; color: var(--primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${tr('special_instructions')}</h3>
        <textarea id="customer-remark" class="input-field" maxlength="500" placeholder="${tr('special_placeholder')}" style="min-height: 96px; resize: vertical; font-family: inherit;"></textarea>
        <div style="font-size: 12px; color: var(--text-light); margin-top: 6px;">${tr('optional_note')}</div>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; color: var(--primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${tr('review_your_order')}</h3>
        <div style="font-size: 14px; color: var(--text-muted); line-height: 1.5;">
          ${tr('review_note')}
        </div>
      </div>

      <button id="submit-order" class="primary-button" style="width: 100%; padding: 16px; font-size: 16px; margin-bottom: 10px;">${tr('submit_for_approval')}</button>
      <button id="cancel-checkout" style="width: 100%; padding: 14px; background: transparent; color: var(--text-muted); border: 1.5px solid var(--border); border-radius: var(--radius-md); font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;">${tr('cancel')}</button>
    </div>
  `;

  menuElement.innerHTML = checkoutHTML;

  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      const group = card.querySelector('input').name;
      document.querySelectorAll(`.option-card input[name="${group}"]`).forEach(inp => {
        inp.closest('.option-card').classList.remove('selected');
      });
      card.classList.add('selected');
    });
  });

  document.querySelector('#back-to-menu').addEventListener('click', backToMenu);

  // Wire up live "Ready by" preview on time picker changes
  function attachTimeListeners() {
    ['pickup-hour', 'pickup-minute', 'pickup-ampm'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', updateReadyBy);
    });
  }
  attachTimeListeners();

  document.querySelectorAll('input[name="fulfillment"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const details = document.querySelector('#fulfillment-details');
      if (e.target.value === 'delivery') {
        details.innerHTML = `
          <h3 style="font-size: 13px; color: var(--primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${tr('where_to_deliver')}</h3>
          <textarea id="delivery-address" class="input-field" placeholder="${tr('address_placeholder')}" style="min-height: 100px; resize: vertical; font-family: inherit;"></textarea>
        `;
      } else {
        details.innerHTML = `
          <h3 style="font-size: 13px; color: var(--primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${tr('when_to_pickup')}</h3>
          <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
            <input type="date" id="pickup-date" class="input-field" value="${defaultDate}">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${renderTimePicker(defaultTimeValue)}
            </div>
          </div>
          <div id="pickup-ready" style="margin-top: 8px; font-size: 13px; color: var(--text-muted);">
            🕐 ${tr('pickup_at', { time: `<strong style="color: var(--primary);">${formatTime12(defaultTimeValue)}</strong>` })}
          </div>
        `;
        attachTimeListeners();
      }
    });
  });

  document.querySelector('#submit-order').addEventListener('click', async () => {
    const submitBtn = document.querySelector('#submit-order');
    const cancelBtn = document.querySelector('#cancel-checkout');

    const fulfillment = document.querySelector('input[name="fulfillment"]:checked').value;
    const customerRemark = document.querySelector('#customer-remark')?.value.trim() || '';
    const customerPhone = document.querySelector('#customer-phone')?.value.trim() || '';
    if (!customerPhone) {
      telegram?.showAlert?.(tr('err_contact_required'));
      return;
    }
    if (customerPhone.replace(/[\s\-\+\(\)]/g, '').length < 7) {
      telegram?.showAlert?.(tr('err_contact_invalid'));
      return;
    }
    const payment = 'aba_qr';
    let address = null, pickupTime = null;

    let confirmedPickupTime = null;
    let requestedTimeFormatted = '';
    if (fulfillment === 'delivery') {
      address = document.querySelector('#delivery-address')?.value;
      if (!address || !address.trim()) {
        telegram?.showAlert?.(tr('err_address_required'));
        return;
      }
    } else {
      const pickupDate = document.querySelector('#pickup-date')?.value;
      const pickupTimeValue = getPickupTime24();
      if (!pickupDate) {
        telegram?.showAlert?.(tr('err_time_required'));
        return;
      }
      pickupTime = `${pickupDate}T${pickupTimeValue}`;
      // The admin will confirm the final pickup time after approval.
      confirmedPickupTime = null;
      requestedTimeFormatted = formatTime12(pickupTimeValue);
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span>${tr('placing_order')}`;
    cancelBtn.disabled = true;

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillment, address, pickupTime, confirmedPickupTime, customerRemark, phone: customerPhone,
          items: lines.map(l => ({
            menuItemId: l.item.id,
            variantId: l.variant?.id || undefined,
            quantity: l.quantity,
          })),
          initData: telegram?.initData || urlInitData,
          telegramUserId: telegram?.initDataUnsafe?.user?.id,
          clientChatId: urlChatId ? Number(urlChatId) : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        telegram?.showAlert?.(`Error: ${data.error}`);
        submitBtn.disabled = false;
        submitBtn.innerHTML = tr('submit_for_approval');
        cancelBtn.disabled = false;
        return;
      }

      state.cart.clear();
      renderCart();

      let successHTML = `
        <div style="padding: 50px 20px; max-width: 500px; margin: 0 auto; text-align: center; animation: fadeInUp 0.3s ease;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px;">✓</div>
          <h2 style="margin: 0 0 4px; font-size: 26px;">${tr('submitted_for_approval')}</h2>
          <div style="font-size: 22px; font-weight: 800; color: var(--primary); margin: 12px 0;">Order #${data.orderId}</div>
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; margin: 24px 0; text-align: left;">
            ${fulfillment === 'pickup' && requestedTimeFormatted ? `
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--divider);">
                <span style="font-size: 28px;">🕐</span>
                <div>
                  <div style="font-weight: 600;">${tr('requested_pickup_time')}</div>
                  <div style="font-size: 16px; font-weight: 800; color: var(--primary); margin-top: 2px;">${requestedTimeFormatted}</div>
                  <div style="font-size: 12px; color: var(--text-light);">${tr('confirm_exact_time')}</div>
                </div>
              </div>
            ` : ''}
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 28px;">🕒</span>
              <div>
                <div style="font-weight: 600;">${tr('waiting_admin_approval')}</div>
                <div style="font-size: 13px; color: var(--text-muted);">${tr('payment_link_note')}</div>
              </div>
            </div>
          </div>
          <button id="back-home" class="primary-button" style="width: 100%; padding: 16px; font-size: 16px;">${tr('back_to_menu')}</button>
        </div>
      `;
      menuElement.innerHTML = successHTML;
      document.querySelector('#back-home').addEventListener('click', backToMenu);

    } catch (error) {
      console.error('Checkout error:', error);
      telegram?.showAlert?.(tr('failed_to_place'));
      submitBtn.disabled = false;
      submitBtn.innerHTML = tr('submit_for_approval');
      cancelBtn.disabled = false;
    }
  });

  document.querySelector('#cancel-checkout').addEventListener('click', backToMenu);
}

function backToMenu() {
  menuElement.innerHTML = '';
  categoriesElement.innerHTML = '';
  menuElement.style.display = 'grid';
  renderMenu();
  renderCategories();
  renderCart();
  toggleCart(false);
  if (state.cart.size > 0) floatingCart.classList.remove('hidden');
}

// ═══════════════════════════════════════════
// NEW FEATURES (cherry-picked from redesign)
// ═══════════════════════════════════════════

// ─── FLY-TO-CART ANIMATION ───
function flyToCart(itemId) {
  const fly = document.getElementById('fly-clone');
  const cartBtn = document.getElementById('cart-button');
  if (!fly || !cartBtn || cartBtn.classList.contains('hidden')) return;

  const card = document.querySelector(`article[data-item-id="${itemId}"]`);
  const addBtn = card?.querySelector('.add-button');
  const img = card?.querySelector('img');
  if (!addBtn || !img) return;

  // Set clone image to match card image
  fly.style.backgroundImage = `url(${img.src})`;
  fly.style.backgroundSize = 'cover';
  fly.style.backgroundPosition = 'center';

  const btnRect = addBtn.getBoundingClientRect();
  const cartRect = cartBtn.getBoundingClientRect();

  const startX = btnRect.left + btnRect.width / 2;
  const startY = btnRect.top + btnRect.height / 2;
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  const dx = endX - startX;
  const dy = endY - startY;

  // Position at start
  fly.style.left = `${startX - 28}px`;
  fly.style.top = `${startY - 28}px`;
  fly.style.setProperty('--dx', `${dx}px`);
  fly.style.setProperty('--dy', `${dy}px`);
  fly.style.opacity = '1';

  // Trigger animation
  fly.classList.remove('flying');
  void fly.offsetWidth;
  fly.classList.add('flying');

  setTimeout(() => {
    fly.classList.remove('flying');
    fly.style.opacity = '0';
  }, 700);
}

// ─── DETAIL SHEET (Image Preview) ───
function showDetail(src) {
  const sheet = document.getElementById('detail-sheet');
  const img = document.getElementById('detail-image');
  if (!sheet || !img) return;
  img.src = src;
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden', 'false');
}

function closeDetail() {
  const sheet = document.getElementById('detail-sheet');
  if (!sheet) return;
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
}

// ─── EXPANDABLE SEARCH ───
function initExpandableSearch() {
  // Wrap search-box in a wrapper
  const searchBox = document.querySelector('.search-box');
  if (!searchBox || document.querySelector('.search-wrapper')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'search-wrapper expanded';
  searchBox.parentNode.insertBefore(wrapper, searchBox);
  wrapper.appendChild(searchBox);

  const toggle = document.createElement('button');
  toggle.className = 'search-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Toggle search');
  toggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  wrapper.appendChild(toggle);

  let isExpanded = true;

  function collapse() {
    if (state.search.trim()) return; // Don't collapse if has value
    isExpanded = false;
    wrapper.classList.remove('expanded');
    wrapper.classList.add('collapsed');
    toggle.style.display = 'block';
    searchElement.blur();
  }

  function expand() {
    isExpanded = true;
    wrapper.classList.remove('collapsed');
    wrapper.classList.add('expanded');
    searchElement.focus();
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  });

  searchElement.addEventListener('focus', () => {
    if (!isExpanded) expand();
  });

  searchElement.addEventListener('blur', () => {
    // Delay to check if search has value
    setTimeout(() => {
      if (!state.search.trim()) collapse();
    }, 200);
  });

  // Initial state: start expanded
  expand();
}

// ─── EVENT BINDINGS ───
(async function init() {
  // Detect language from backend → localStorage → Telegram
  state.lang = await detectLang();
  applyStaticI18n();

  floatingCart.onclick = () => toggleCart(true);
  document.querySelector('#close-cart').onclick = () => toggleCart(false);
  backdrop.onclick = () => toggleCart(false);
  searchElement.oninput = (event) => { state.search = event.target.value; renderMenu(); };
  document.querySelector('#checkout').onclick = () => showCheckout();

  // Language switcher (dropdown)
  document.querySelector('#lang-select').addEventListener('change', (e) => {
    setLang(e.target.value);
  });
  document.querySelector('#lang-select').value = state.lang;

  // Detail sheet handlers
  const detailSheet = document.getElementById('detail-sheet');
  const detailImage = document.getElementById('detail-image');
  detailSheet?.addEventListener('click', (e) => {
    if (e.target === detailSheet || e.target.closest('.detail-close')) {
      closeDetail();
    }
  });

  // Expandable search
  initExpandableSearch();

  // ─── LOAD MENU DATA ───
  // Show skeleton shimmer while loading
  menuElement.innerHTML = Array.from({ length: 6 }, () => `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
    </div>
  `).join('');
  menuElement.style.display = 'grid';
  fetch('/api/menu').then((r) => r.json()).then((data) => {
    state.categories = data.categories;
    renderCategories();
    renderMenu();
    renderCart();
  }).catch(() => {
    menuElement.innerHTML = `
      <div class="empty-state">
        <div class="icon">😕</div>
        <h3>${tr('menu_unavailable')}</h3>
        <p>${tr('try_again_later')}</p>
      </div>
    `;
  });
})();
