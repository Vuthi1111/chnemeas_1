// ─── Locale strings for bot messages ───
// Organized by context / feature for easy maintenance

export const locales = {
  en: {
    // ── Reply keyboard ──
    open_menu: '\u{1F6D2} Open Menu',
    my_orders: '\u{1F4CB} My Orders',
    help: '\u2139\uFE0F Help',
    settings: '\u2699\uFE0F Settings',

    // ── Start / Welcome ──
    welcome: (name) => `\u{1F44B} Welcome${name ? `, ${name}` : ''}!`,
    registration_failed: 'Registration failed temporarily. Please try again.',
    navigation_hint: 'Use the buttons below anytime to navigate.',
    language_prompt: '\u{1F310} Please select your language:',
    language_set: (lang) => `Language set to ${lang}. You can change it anytime from Settings.`,
    language_changed: (lang) => `Language changed to ${lang}.`,

    // ── Menu ──
    open_menu_prompt: 'Open the menu:',
    menu_button: 'Open Menu',

    // ── My Orders ──
    no_orders: 'You do not have any orders yet. Tap Open Menu to place your first order.',
    pay_now: 'Pay Now',
    request_cancellation: 'Request Cancellation',

    // ── Help ──
    help_text:
      'Use Open Menu to place an order. Use My Orders to check your orders.\n\n' +
      'When the bot asks for a cancellation reason, reply with your reason. Send /skip if you do not want to provide one.',

    // ── Admin panel ──
    not_authorized_admin: 'You are not authorized to access the admin panel.',
    admin_panel_prompt: 'Open the admin panel to manage orders and menu:',
    admin_panel_button: '\u{1F527} Open Admin Panel',

    // ── Admin management ──
    only_owner_add: 'Only the restaurant owner can add admins.',
    usage_add_admin: 'Usage: /add_admin <chat_id or @username>',
    user_not_started: 'That user has not started the bot yet.',
    admin_added: (target) => `\u2705 Added ${target} as admin.`,
    invalid_chat_id: 'Invalid chat ID.',
    admin_added_id: (id) => `\u2705 Added chat ID ${id} as admin.`,

    only_owner_remove: 'Only the restaurant owner can remove admins.',
    usage_remove_admin: 'Usage: /remove_admin <chat_id or @username>',
    admin_removed: (target) => `\u2705 Removed ${target} from admins.`,

    not_authorized: 'Not authorized.',
    admins_list: (ownerId, lines) =>
      `\u{1F451} Owner: ${ownerId}\n\nAdmins:\n${lines.length ? lines.join('\n') : 'No additional admins.'}`,

    // ── Order status labels (for customer "My Orders" display) ──
    status_pending_approval: 'Pending approval',
    status_approved: 'Order confirmed',
    status_paid: 'Payment received',
    status_preparing: 'Being prepared',
    status_ready: 'Ready for pickup',
    status_fulfilled: 'Completed',
    status_cancelled: 'Cancelled',
    status_rejected: 'Rejected',
    status_unavailable: 'Status unavailable',
    payment_status_unpaid: 'unpaid',
    payment_status_paid: 'paid',
    payment_status_failed: 'failed',

    // ── Order / fulfillment labels ──
    fulfillment_delivery: 'Delivery',
    fulfillment_pickup: 'Pickup',
    address_not_provided: 'Not provided',
    special_instructions: 'Special instructions',
    special_none: 'None',
    total_label: 'Total',
    items_label: 'Items',
    reason_label: 'Reason',
    reason_not_provided: 'No reason provided.',
    asap: 'As soon as possible',

    // ── Admin order notification (inline keyboard actions in admin chat) ──
    approve_order: 'Approve order',
    reject_order: 'Reject order',
    start_preparing: 'Start preparing',
    mark_ready: 'Mark ready',
    mark_fulfilled: 'Mark fulfilled',
    mark_paid: 'Mark Paid',
    keep_order: 'Keep Order',
    admin_status_approved: 'APPROVED',
    admin_status_rejected: 'REJECTED',
    admin_status_preparing: 'PREPARING',
    admin_status_ready: 'READY',
    admin_status_fulfilled: 'FULFILLED',
    admin_status_cancelled: 'CANCELLED',
    admin_status_pending_approval: 'PENDING APPROVAL',

    // ── Admin: Don't Approve sub-menu (cancel OR select pickup time) ──
    dont_approve: 'Don\'t Approve',
    cancel_order_btn: 'Cancel Order',
    select_pickup_time: 'Select Pickup Time',
    pickup_time_confirm_prompt: (id, requested) =>
      `Select the confirmed pickup time for Order #${id}.\n\nCustomer requested: ${requested || 'ASAP'}`,
    pickup_20min: '⏱ +20 min',
    pickup_25min: '⏱ +25 min',
    pickup_30min: '⏱ +30 min',
    pickup_35min: '⏱ +35 min',
    pickup_custom: '📅 Custom time',
    pickup_use_requested: (time) => `↩️ Use customer\'s time (${time || 'ASAP'})`,
    pickup_confirm_done: (id, time) => `✅ Order #${id} approved. Confirmed pickup: ${time}.`,
    pickup_custom_prompt: (id) =>
      `Type the pickup time for Order #${id} in 24-hour format (e.g. 14:30).\nSend /skip to cancel.`,
    pickup_custom_skipped: 'Custom time cancelled. Order stays pending.',
    pickup_custom_invalid: 'Invalid time. Please type a valid time in 24-hour format (e.g. 14:30).',

    // ── Status change notifications (sent to CUSTOMER) ──
    // approval
    order_approved_title: (id) => `\u2705 Order #${id} Approved!`,
    proceed_to_pay: '\u{1F4B3} Proceed to Pay',
    cancel_order: 'Cancel Order',
    receipt_sent: 'Receipt sent to customer.',

    // paid
    paid_notification:
      '\u2705 Payment received! Your order is now being processed.',

    // preparing
    preparing_notification: 'The kitchen has started preparing your order.',

    // ready
    ready_notification: 'Your order is ready for pickup.',

    // fulfilled
    fulfilled_notification: 'Your order has been completed. Thank you!',

    // rejected
    rejected_notification: (reason) =>
      `Your order was rejected.${reason ? `\n\nReason from restaurant:\n${reason}` : ''}\n\nPlease contact the restaurant if you have any questions.`,

    // cancelled by admin
    admin_cancelled_notification: (id, reason) =>
      `\u274C Order #${id} has been cancelled.${reason ? `\n\nReason from restaurant:\n${reason}` : ''}\n\nPlease contact the restaurant if you have any questions.`,

    // ── Cancel flow (customer side) ──
    customer_cancel_unpaid_prompt: (id) =>
      `We're sorry to see you go! Please tell us why you'd like to cancel Order #${id}.\n\n` +
      'Your feedback helps us improve. (Or send /skip to cancel without a reason.)',
    customer_cancel_paid_prompt: (id) =>
      `Order #${id} has already been paid or processed. Please tell us why you want to cancel it.\n\n` +
      'We will send your request to the restaurant for review. (Or send /skip without a reason.)',
    customer_cancel_keep: 'Your order is still active.',
    customer_cancel_confirmed: (id, reason) =>
      `\u274C Order #${id} has been cancelled.${reason ? `\n\nReason: ${reason}` : ''}`,
    customer_cancel_request_sent: (id) =>
      `Your cancellation request for Order #${id} has been sent to the restaurant.\n\n` +
      'The order will remain active until the restaurant reviews it.',
    customer_cancel_order_not_found: 'This order is no longer available.',
    customer_not_authorized: 'You are not authorized for this order.',
    customer_keep_order_button: 'Keep Order',

    // ── Cancel flow (admin side) ──
    admin_cancel_reason_prompt: (id) =>
      `Please tell us why you're cancelling Order #${id}.\n` +
      '(This reason will be shown to the customer. Send /skip to cancel without a reason.)',
    admin_cancel_approved: (id) => `\u2705 Order #${id} has been cancelled.`,
    admin_cancel_declined: (id) =>
      `Order #${id} remains active. The customer cancellation request was declined.`,
    admin_cancel_kept: (id) => `Order #${id} remains active.`,
    admin_cancel_notify_keep: (id) =>
      `The restaurant reviewed your cancellation request for Order #${id} and will continue preparing it.`,
    admin_cancel_awaiting_reason: '\u23F3 Awaiting cancellation reason\u2026',
    admin_order_already_processed: 'This order was already processed.',
    admin_cancel_inline_kept: 'Order kept.',
    admin_cancel_request_title: (id, customer, total, reason) =>
      `\u26A0\uFE0F Customer requested cancellation for paid/processed Order #${id}.\n\n` +
      `Customer: ${customer}\nTotal: $${Number(total).toFixed(2)}\n\nReason:\n${reason}\n\n` +
      'Review the request below:',
    admin_approve_cancel: 'Approve Cancellation',
    admin_keep_cancel: 'Keep Order',
    admin_notify_customer_cancelled: (id, customer, fulfillment, items, total, reason) =>
      `\u{1F6AB} Order #${id} was cancelled by the customer.\n\nCustomer: ${customer}\n${fulfillment}\n\nItems:\n${items}\n\nTotal: $${Number(total).toFixed(2)}${reason}`,

    // ── Rejection flow (admin side) ──
    admin_reject_reason_prompt: (id) =>
      `Please tell us why you're rejecting Order #${id}.\n` +
      '(This reason will be shown to the customer. Send /skip to reject without a reason.)',
    admin_reject_approved: (id) => `\u2705 Order #${id} has been rejected.`,
    admin_reject_kept: (id) => `Order #${id} remains active.`,
    admin_reject_inline_kept: 'Order kept.',
    admin_reject_awaiting_reason: '\u23F3 Awaiting rejection reason\u2026',

    // ── New order notification (to admin) ──
    new_order_title: (id, customer, fulfillment, payment, items, instructions, total, status) =>
      `New order #${id}\n\nCustomer: ${customer}\n${fulfillment}\nPayment: ABA PayWay QR (${payment})\n\nItems:\n${items}\n\nSpecial instructions:\n${instructions}\n\nTotal: $${Number(total).toFixed(2)}\n\nStatus: ${status}`,

    // ── Payment received notification (to admin) ──
    payment_received_admin: (id, customer, fulfillment, items, instructions, total) =>
      `\u2705 Payment received for Order #${id}\n\nCustomer: ${customer}\n${fulfillment}\n\nItems:\n${items}\n\nSpecial instructions:\n${instructions}\n\nTotal: $${Number(total).toFixed(2)}\n\nStatus: PAID`,

    // ── Customer receipt (order approved message) ──
    customer_receipt: (id, fulfillment, items, instructions, total) =>
      `\u2705 Order #${id} Approved!\n\n${fulfillment}\n\nItems:\n${items}\n\nSpecial instructions:\n${instructions}\n\nTotal: $${Number(total).toFixed(2)}\n\nTap below to proceed with payment.`,

    // ── Payment flow ──
    pay_order_not_found: 'Order not found or already processed.',
    pay_qr_caption: (id, total) =>
      `\u{1F4B3} Payment for Order #${id}\nTotal: $${Number(total).toFixed(2)}\n\nScan this QR to pay. The admin will verify your payment manually.`,
    pay_qr_sent: '\u2705 Payment QR sent.',
    pay_qr_failed: 'Failed to generate QR. Please try again.',
    pay_caption_updated: (text) => `${text}\n\n\u2705 Payment QR sent.`,

    // ── Error / system messages ──
    error_generic: 'An error occurred. Please try again later.',
    order_update_failed: 'Failed to update order status.',
    order_not_found_generic: 'This order could not be found.',

    // ── Photo ──
    photo_file_id: (id) => `Telegram photo file_id:\n${id}`,

    // ── Language command ──
    language_choose: '\u{1F310} Please select your language:',
    language_current: (lang) => `\u{1F310} Current language: ${lang}`,

    // ── Settings ──
    settings_title: '\u2699\uFE0F Settings',
    settings_language: '\u{1F310} Change Language',
    settings_no_settings: 'No settings available yet.',
  },

  // ════════════════════════════════════════════════════════════════
  //  Khmer (ភាសាខ្មែរ)
  // ════════════════════════════════════════════════════════════════
  km: {
    open_menu: '\u{1F6D2} បើកម៉ឺនុយ',
    my_orders: '\u{1F4CB} ការបញ្ជាទិញរបស់ខ្ញុំ',
    help: '\u2139\uFE0F ជំនួយ',
    settings: '\u2699\uFE0F ការកំណត់',

    welcome: (name) =>
      `\u{1F44B} សូមស្វាគមន៍${name ? `, ${name}` : ''}!`,
    registration_failed: 'ការចុះឈ្មោះបរាជ័យ។ សូមព្យាយាមម្តងទៀត។',
    navigation_hint: 'ប្រើប៊ូតុងខាងក្រោមគ្រប់ពេលដើម្បីរុករក។',
    language_prompt: '\u{1F310} សូមជ្រើសរើសភាសារបស់អ្នក៖',
    language_set: (lang) =>
      `កំណត់ភាសាជា ${lang} រួចរាល់។ អ្នកអាចផ្លាស់ប្តូរវានៅក្នុងការកំណត់។`,
    language_changed: (lang) => `បានផ្លាស់ប្តូរភាសាទៅជា ${lang}។`,

    open_menu_prompt: 'បើកម៉ឺនុយ៖',
    menu_button: 'បើកម៉ឺនុយ',

    no_orders:
      'អ្នកមិនទាន់មានការបញ្ជាទិញនៅឡើយទេ។ សូមចុច បើកម៉ឺនុយ ដើម្បីបញ្ជាទិញដំបូង។',
    pay_now: 'បង់ប្រាក់ឥឡូវ',
    request_cancellation: 'ស្នើសុំបោះបង់',

    help_text:
      'ប្រើ បើកម៉ឺនុយ ដើម្បីបញ្ជាទិញ។ ប្រើ ការបញ្ជាទិញរបស់ខ្ញុំ ដើម្បីពិនិត្យការបញ្ជាទិញរបស់អ្នក។\n\n' +
      'នៅពេល bot សួររកមូលហេតុនៃការបោះបង់ សូមឆ្លើយតបជាមួយមូលហេតុរបស់អ្នក។ ផ្ញើ /skip ប្រសិនបើអ្នកមិនចង់ផ្តល់ហេតុផល។',

    not_authorized_admin: 'អ្នកមិនត្រូវបានអនុញ្ញាតឱ្យចូលប្រើផ្ទាំងគ្រប់គ្រងទេ។',
    admin_panel_prompt: 'បើកផ្ទាំងគ្រប់គ្រងដើម្បីគ្រប់គ្រងការបញ្ជាទិញ និងម៉ឺនុយ៖',
    admin_panel_button: '\u{1F527} បើកផ្ទាំងគ្រប់គ្រង',

    only_owner_add: 'មានតែម្ចាស់ភោជនីយដ្ឋានទេដែលអាចបន្ថែមអ្នកគ្រប់គ្រង។',
    usage_add_admin: 'របៀបប្រើ៖ /add_admin <chat_id ឬ @username>',
    user_not_started: 'អ្នកប្រើនេះមិនទាន់ចាប់ផ្តើមប្រើ bot នៅឡើយទេ។',
    admin_added: (target) => `\u2705 បានបន្ថែម ${target} ជាអ្នកគ្រប់គ្រង។`,
    invalid_chat_id: 'លេខសម្គាល់ Chat ID មិនត្រឹមត្រូវ។',
    admin_added_id: (id) => `\u2705 បានបន្ថែម Chat ID ${id} ជាអ្នកគ្រប់គ្រង។`,

    only_owner_remove: 'មានតែម្ចាស់ភោជនីយដ្ឋានទេដែលអាចដកអ្នកគ្រប់គ្រង។',
    usage_remove_admin: 'របៀបប្រើ៖ /remove_admin <chat_id ឬ @username>',
    admin_removed: (target) => `\u2705 បានដក ${target} ចេញពីអ្នកគ្រប់គ្រង។`,

    not_authorized: 'គ្មានការអនុញ្ញាត។',
    admins_list: (ownerId, lines) =>
      `\u{1F451} ម្ចាស់៖ ${ownerId}\n\nអ្នកគ្រប់គ្រង៖\n${lines.length ? lines.join('\n') : 'គ្មានអ្នកគ្រប់គ្រងបន្ថែមទេ។'}`,

    status_pending_approval: 'កំពុងរង់ចាំការយល់ព្រម',
    status_approved: 'បានបញ្ជាក់',
    status_paid: 'បានទទួលការទូទាត់',
    status_preparing: 'កំពុងរៀបចំ',
    status_ready: 'រួចរាល់សម្រាប់យក',
    status_fulfilled: 'បានបញ្ចប់',
    status_cancelled: 'បានបោះបង់',
    status_rejected: 'ត្រូវបានបដិសេធ',
    status_unavailable: 'មិនអាចដឹងស្ថានភាពបានទេ',
    payment_status_unpaid: 'មិនទាន់បង់ប្រាក់',
    payment_status_paid: 'បានបង់ប្រាក់',
    payment_status_failed: 'បរាជ័យ',

    fulfillment_delivery: 'ដឹកជញ្ជូន',
    fulfillment_pickup: 'យកដោយខ្លួនឯង',
    address_not_provided: 'មិនបានផ្តល់',
    special_instructions: 'ការណែនាំពិសេស',
    special_none: 'គ្មាន',
    total_label: 'សរុប',
    items_label: 'មុខម្ហូប',
    reason_label: 'មូលហេតុ',
    reason_not_provided: 'មិនបានផ្តល់មូលហេតុ។',
    asap: 'ឱ្យបានឆាប់តាមដែលអាចធ្វើទៅបាន',

    approve_order: 'យល់ព្រម',
    reject_order: 'បដិសេធ',
    start_preparing: 'ចាប់ផ្តើមរៀបចំ',
    mark_ready: 'សម្គាល់ថារួចរាល់',
    mark_fulfilled: 'សម្គាល់ថាបានបញ្ចប់',
    mark_paid: 'សម្គាល់ថាបានបង់ប្រាក់',
    keep_order: 'រក្សាទុកការបញ្ជាទិញ',
    admin_status_approved: 'បានអនុម័ត',
    admin_status_rejected: 'ត្រូវបានបដិសេធ',
    admin_status_preparing: 'កំពុងរៀបចំ',
    admin_status_ready: 'រួចរាល់',
    admin_status_fulfilled: 'បានបញ្ចប់',
    admin_status_cancelled: 'ត្រូវបានបោះបង់',
    admin_status_pending_approval: 'កំពុងរង់ចាំការយល់ព្រម',

    dont_approve: 'កុំអនុម័ត',
    cancel_order_btn: 'បោះបង់ការបញ្ជាទិញ',
    select_pickup_time: 'ជ្រើសរើសម៉ោងយក',
    pickup_time_confirm_prompt: (id, requested) =>
      `ជ្រើសរើសម៉ោងយកដែលបានបញ្ជាក់សម្រាប់ការបញ្ជាទិញ #${id}។\n\nអតិថិជនបានស្នើសុំ៖ ${requested || 'ឱ្យបានឆាប់តាមដែលអាចធ្វើទៅបាន'}`,
    pickup_20min: '⏱ +20 នាទី',
    pickup_25min: '⏱ +25 នាទី',
    pickup_30min: '⏱ +30 នាទី',
    pickup_35min: '⏱ +35 នាទី',
    pickup_custom: '📅 ម៉ោងផ្ទាល់ខ្លួន',
    pickup_use_requested: (time) => `↩️ ប្រើម៉ោងដែលអតិថិជនស្នើសុំ (${time || 'ឱ្យបានឆាប់តាមដែលអាចធ្វើទៅបាន'})`,
    pickup_confirm_done: (id, time) => `✅ ការបញ្ជាទិញ #${id} ត្រូវបានអនុម័ត។ ម៉ោងយកដែលបានបញ្ជាក់៖ ${time}។`,
    pickup_custom_prompt: (id) =>
      `វាយបញ្ចូលម៉ោងយកសម្រាប់ការបញ្ជាទិញ #${id} ជាទម្រង់ 24 ម៉ោង (ឧទាហរណ៍ 14:30)។\nផ្ញើ /skip ដើម្បីបោះបង់។`,
    pickup_custom_skipped: 'បានបោះបង់ម៉ោងផ្ទាល់ខ្លួន។ ការបញ្ជាទិញនៅតែរង់ចាំ។',
    pickup_custom_invalid: 'ពេលវេលាមិនត្រឹមត្រូវ។ សូមវាយពេលវេលាត្រឹមត្រូវជាទម្រង់ 24 ម៉ោង (ឧទាហរណ៍ 14:30)។',

    order_approved_title: (id) => `\u2705 ការបញ្ជាទិញ #${id} ត្រូវបានអនុម័ត!`,
    proceed_to_pay: '\u{1F4B3} បន្តការទូទាត់',
    cancel_order: 'បោះបង់ការបញ្ជាទិញ',
    receipt_sent: 'បានផ្ញើបង្កាន់ដៃទៅកាន់អតិថិជន។',

    paid_notification: '\u2705 បានទទួលការទូទាត់! ការបញ្ជាទិញរបស់អ្នកកំពុងដំណើរការ។',

    preparing_notification: 'ផ្ទះបាយកំពុងរៀបចំការបញ្ជាទិញរបស់អ្នក។',

    ready_notification: 'ការបញ្ជាទិញរបស់អ្នកបានត្រៀមរួចរាល់សម្រាប់យក។',

    fulfilled_notification: 'ការបញ្ជាទិញរបស់អ្នកបានបញ្ចប់។ សូមអរគុណ!',

    rejected_notification: (reason) =>
      `ការបញ្ជាទិញរបស់អ្នកត្រូវបានបដិសេធ។${reason ? `\n\nមូលហេតុពីភោជនីយដ្ឋាន៖\n${reason}` : ''}\n\nសូមទាក់ទងភោជនីយដ្ឋានប្រសិនបើអ្នកមានសំណួរ។`,

    admin_cancelled_notification: (id, reason) =>
      `\u274C ការបញ្ជាទិញ #${id} ត្រូវបានបោះបង់។${reason ? `\n\nមូលហេតុពីភោជនីយដ្ឋាន៖\n${reason}` : ''}\n\nសូមទាក់ទងភោជនីយដ្ឋានប្រសិនបើអ្នកមានសំណួរ។`,

    customer_cancel_unpaid_prompt: (id) =>
      `សូមអភ័យទោសដែលអ្នកចង់ចាកចេញ! សូមប្រាប់យើងពីមូលហេតុដែលអ្នកចង់បោះបង់ការបញ្ជាទិញ #${id}។\n\n` +
      'មតិរបស់អ្នកជួយយើងឱ្យប្រសើរឡើង។ (ឬផ្ញើ /skip ដើម្បីបោះបង់ដោយគ្មានមូលហេតុ)',
    customer_cancel_paid_prompt: (id) =>
      `ការបញ្ជាទិញ #${id} ត្រូវបានបង់ប្រាក់ ឬដំណើរការរួចហើយ។ សូមប្រាប់យើងពីមូលហេតុដែលអ្នកចង់បោះបង់វា។\n\n` +
      'យើងនឹងផ្ញើសំណើរបស់អ្នកទៅភោជនីយដ្ឋានដើម្បីពិនិត្យ។ (ឬផ្ញើ /skip ដោយគ្មានមូលហេតុ)',
    customer_cancel_keep: 'ការបញ្ជាទិញរបស់អ្នកនៅតែសកម្ម។',
    customer_cancel_confirmed: (id, reason) =>
      `\u274C ការបញ្ជាទិញ #${id} ត្រូវបានបោះបង់។${reason ? `\n\nមូលហេតុ៖ ${reason}` : ''}`,
    customer_cancel_request_sent: (id) =>
      `សំណើបោះបង់ការបញ្ជាទិញ #${id} របស់អ្នកត្រូវបានផ្ញើទៅភោជនីយដ្ឋាន។\n\n` +
      'ការបញ្ជាទិញនៅតែសកម្មរហូតដល់ភោជនីយដ្ឋានពិនិត្យ។',
    customer_cancel_order_not_found: 'ការបញ្ជាទិញនេះលែងមានទៀតហើយ។',
    customer_not_authorized: 'អ្នកមិនត្រូវបានអនុញ្ញាតសម្រាប់ការបញ្ជាទិញនេះទេ។',
    customer_keep_order_button: 'រក្សាការបញ្ជាទិញ',

    admin_cancel_reason_prompt: (id) =>
      `សូមប្រាប់យើងពីមូលហេតុដែលអ្នកកំពុងបោះបង់ការបញ្ជាទិញ #${id}។\n` +
      '(មូលហេតុនេះនឹងត្រូវបង្ហាញដល់អតិថិជន។ ផ្ញើ /skip ដើម្បីបោះបង់ដោយគ្មានមូលហេតុ។)',
    admin_cancel_approved: (id) => `\u2705 ការបញ្ជាទិញ #${id} ត្រូវបានបោះបង់។`,
    admin_cancel_declined: (id) =>
      `ការបញ្ជាទិញ #${id} នៅតែសកម្ម។ សំណើបោះបង់របស់អតិថិជនត្រូវបានបដិសេធ។`,
    admin_cancel_kept: (id) => `ការបញ្ជាទិញ #${id} នៅតែសកម្ម។`,
    admin_cancel_notify_keep: (id) =>
      `ភោជនីយដ្ឋានបានពិនិត្យសំណើបោះបង់របស់អ្នកសម្រាប់ការបញ្ជាទិញ #${id} ហើយនឹងបន្តរៀបចំវា។`,
    admin_cancel_awaiting_reason: '\u23F3 កំពុងរង់ចាំមូលហេតុនៃការបោះបង់\u2026',
    admin_order_already_processed: 'ការបញ្ជាទិញនេះត្រូវបានដំណើរការរួចហើយ។',
    admin_cancel_inline_kept: 'រក្សាទុកការបញ្ជាទិញ។',
    admin_cancel_request_title: (id, customer, total, reason) =>
      `\u26A0\uFE0F អតិថិជនបានស្នើសុំបោះបង់ការបញ្ជាទិញ #${id} ដែលបានបង់ប្រាក់/ដំណើរការរួចហើយ។\n\n` +
      `អតិថិជន៖ ${customer}\nសរុប៖ $${Number(total).toFixed(2)}\n\nមូលហេតុ៖\n${reason}\n\n` +
      'សូមពិនិត្យសំណើខាងក្រោម៖',
    admin_approve_cancel: 'អនុម័តការបោះបង់',
    admin_keep_cancel: 'រក្សាការបញ្ជាទិញ',
    admin_notify_customer_cancelled: (id, customer, fulfillment, items, total, reason) =>
      `\u{1F6AB} ការបញ្ជាទិញ #${id} ត្រូវបានបោះបង់ដោយអតិថិជន។\n\nអតិថិជន៖ ${customer}\n${fulfillment}\n\nមុខម្ហូប៖\n${items}\n\nសរុប៖ $${Number(total).toFixed(2)}${reason}`,

    // ── Rejection flow (admin side) ──
    admin_reject_reason_prompt: (id) =>
      `សូមប្រាប់យើងពីមូលហេតុដែលអ្នកកំពុងបដិសេធការបញ្ជាទិញ #${id}។\n` +
      '(មូលហេតុនេះនឹងត្រូវបង្ហាញដល់អតិថិជន។ ផ្ញើ /skip ដើម្បីបដិសេធដោយគ្មានមូលហេតុ។)',
    admin_reject_approved: (id) => `\u2705 ការបញ្ជាទិញ #${id} ត្រូវបានបដិសេធ។`,
    admin_reject_kept: (id) => `ការបញ្ជាទិញ #${id} នៅតែសកម្ម។`,
    admin_reject_inline_kept: 'បានរក្សាទុកការបញ្ជាទិញ។',
    admin_reject_awaiting_reason: '\u23F3 កំពុងរង់ចាំមូលហេតុនៃការបដិសេធ\u2026',

    new_order_title: (id, customer, fulfillment, payment, items, instructions, total, status) =>
      `ការបញ្ជាទិញថ្មី #${id}\n\nអតិថិជន៖ ${customer}\n${fulfillment}\nការទូទាត់៖ ABA PayWay QR (${payment})\n\nមុខម្ហូប៖\n${items}\n\nការណែនាំពិសេស៖\n${instructions}\n\nសរុប៖ $${Number(total).toFixed(2)}\n\nស្ថានភាព៖ ${status}`,

    // ── Payment received notification (to admin) ──
    payment_received_admin: (id, customer, fulfillment, items, instructions, total) =>
      `\u2705 បានទទួលការទូទាត់សម្រាប់ការបញ្ជាទិញ #${id}\n\nអតិថិជន៖ ${customer}\n${fulfillment}\n\nមុខម្ហូប៖\n${items}\n\nការណែនាំពិសេស៖\n${instructions}\n\nសរុប៖ $${Number(total).toFixed(2)}\n\nស្ថានភាព៖ បានបង់ប្រាក់`,

    customer_receipt: (id, fulfillment, items, instructions, total) =>
      `\u2705 ការបញ្ជាទិញ #${id} ត្រូវបានអនុម័ត!\n\n${fulfillment}\n\nមុខម្ហូប៖\n${items}\n\nការណែនាំពិសេស៖\n${instructions}\n\nសរុប៖ $${Number(total).toFixed(2)}\n\nចុចខាងក្រោមដើម្បីបន្តការទូទាត់។`,

    pay_order_not_found: 'រកមិនឃើញការបញ្ជាទិញ ឬត្រូវបានដំណើរការរួចហើយ។',
    pay_qr_caption: (id, total) =>
      `\u{1F4B3} ការទូទាត់សម្រាប់ការបញ្ជាទិញ #${id}\nសរុប៖ $${Number(total).toFixed(2)}\n\nសូមស្កេន QR នេះដើម្បីបង់ប្រាក់។ អ្នកគ្រប់គ្រងនឹងផ្ទៀងផ្ទាត់ការទូទាត់របស់អ្នកដោយផ្ទាល់។`,
    pay_qr_sent: '\u2705 បានផ្ញើ QR សម្រាប់ការទូទាត់។',
    pay_qr_failed: 'បរាជ័យក្នុងការបង្កើត QR។ សូមព្យាយាមម្តងទៀត។',
    pay_caption_updated: (text) => `${text}\n\n\u2705 បានផ្ញើ QR សម្រាប់ការទូទាត់។`,

    error_generic: 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។',
    order_update_failed: 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពស្ថានភាពការបញ្ជាទិញ។',
    order_not_found_generic: 'រកមិនឃើញការបញ្ជាទិញនេះទេ។',

    photo_file_id: (id) => `Telegram photo file_id:\n${id}`,

    language_choose: '\u{1F310} សូមជ្រើសរើសភាសារបស់អ្នក៖',
    language_current: (lang) => `\u{1F310} ភាសាបច្ចុប្បន្ន៖ ${lang}`,

    settings_title: '\u2699\uFE0F ការកំណត់',
    settings_language: '\u{1F310} ផ្លាស់ប្តូរភាសា',
    settings_no_settings: 'មិនទាន់មានការកំណត់នៅឡើយទេ។',
  },

  // ════════════════════════════════════════════════════════════════
  //  Chinese Simplified (中文)
  // ════════════════════════════════════════════════════════════════
  zh: {
    open_menu: '\u{1F6D2} 打开菜单',
    my_orders: '\u{1F4CB} 我的订单',
    help: '\u2139\uFE0F 帮助',
    settings: '\u2699\uFE0F 设置',

    welcome: (name) =>
      `\u{1F44B} 欢迎${name ? `, ${name}` : ''}!`,
    registration_failed: '注册失败，请稍后重试。',
    navigation_hint: '随时使用下方按钮进行导航。',
    language_prompt: '\u{1F310} 请选择您的语言：',
    language_set: (lang) =>
      `语言已设置为 ${lang}。您随时可以在设置中更改。`,
    language_changed: (lang) => `语言已更改为 ${lang}。`,

    open_menu_prompt: '打开菜单：',
    menu_button: '打开菜单',

    no_orders: '您还没有任何订单。点击"打开菜单"下您的第一份订单。',
    pay_now: '立即付款',
    request_cancellation: '请求取消',

    help_text:
      '使用"打开菜单"下单。使用"我的订单"查看您的订单。\n\n' +
      '当机器人询问取消原因时，请回复您的原因。如果您不想提供原因，请发送 /skip。',

    not_authorized_admin: '您无权访问管理面板。',
    admin_panel_prompt: '打开管理面板以管理订单和菜单：',
    admin_panel_button: '\u{1F527} 打开管理面板',

    only_owner_add: '只有餐厅所有者才能添加管理员。',
    usage_add_admin: '用法：/add_admin <chat_id 或 @username>',
    user_not_started: '该用户尚未启动机器人。',
    admin_added: (target) => `\u2705 已将 ${target} 添加为管理员。`,
    invalid_chat_id: '无效的 Chat ID。',
    admin_added_id: (id) => `\u2705 已将 Chat ID ${id} 添加为管理员。`,

    only_owner_remove: '只有餐厅所有者才能移除管理员。',
    usage_remove_admin: '用法：/remove_admin <chat_id 或 @username>',
    admin_removed: (target) => `\u2705 已将 ${target} 从管理员中移除。`,

    not_authorized: '未授权。',
    admins_list: (ownerId, lines) =>
      `\u{1F451} 所有者：${ownerId}\n\n管理员：\n${lines.length ? lines.join('\n') : '没有其他管理员。'}`,

    status_pending_approval: '等待批准',
    status_approved: '已确认',
    status_paid: '已收款',
    status_preparing: '准备中',
    status_ready: '准备就绪',
    status_fulfilled: '已完成',
    status_cancelled: '已取消',
    status_rejected: '已拒绝',
    status_unavailable: '状态不可用',
    payment_status_unpaid: '未付款',
    payment_status_paid: '已付款',
    payment_status_failed: '失败',

    fulfillment_delivery: '配送',
    fulfillment_pickup: '自取',
    address_not_provided: '未提供',
    special_instructions: '特殊说明',
    special_none: '无',
    total_label: '总计',
    items_label: '商品',
    reason_label: '原因',
    reason_not_provided: '未提供原因。',
    asap: '尽快',

    approve_order: '批准订单',
    reject_order: '拒绝订单',
    start_preparing: '开始准备',
    mark_ready: '标记为就绪',
    mark_fulfilled: '标记为已完成',
    mark_paid: '标记为已付款',
    keep_order: '保留订单',
    admin_status_approved: '已批准',
    admin_status_rejected: '已拒绝',
    admin_status_preparing: '准备中',
    admin_status_ready: '已就绪',
    admin_status_fulfilled: '已完成',
    admin_status_cancelled: '已取消',
    admin_status_pending_approval: '等待批准',

    dont_approve: '不批准',
    cancel_order_btn: '取消订单',
    select_pickup_time: '选择取餐时间',
    pickup_time_confirm_prompt: (id, requested) =>
      `为订单 #${id} 选择已确认的取餐时间。\n\n客户请求的时间：${requested || '尽快'}`,
    pickup_20min: '⏱ +20 分钟',
    pickup_25min: '⏱ +25 分钟',
    pickup_30min: '⏱ +30 分钟',
    pickup_35min: '⏱ +35 分钟',
    pickup_custom: '📅 自定义时间',
    pickup_use_requested: (time) => `↩️ 使用客户请求的时间（${time || '尽快'}）`,
    pickup_confirm_done: (id, time) => `✅ 订单 #${id} 已批准。已确认取餐时间：${time}。`,
    pickup_custom_prompt: (id) =>
      `请输入订单 #${id} 的取餐时间，使用24小时制（例如 14:30）。\n发送 /skip 取消。`,
    pickup_custom_skipped: '已取消自定义时间。订单保持待处理。',
    pickup_custom_invalid: '时间无效。请输入有效的24小时制时间（例如 14:30）。',

    order_approved_title: (id) => `\u2705 订单 #${id} 已批准！`,
    proceed_to_pay: '\u{1F4B3} 前往付款',
    cancel_order: '取消订单',
    receipt_sent: '收据已发送给客户。',

    paid_notification: '\u2705 已收到付款！您的订单正在处理中。',

    preparing_notification: '厨房已开始准备您的订单。',

    ready_notification: '您的订单已准备就绪，可以取餐。',

    fulfilled_notification: '您的订单已完成。谢谢！',

    rejected_notification: (reason) =>
      `您的订单已被拒绝。${reason ? `\n\n餐厅原因：\n${reason}` : ''}\n\n如有疑问，请联系餐厅。`,

    admin_cancelled_notification: (id, reason) =>
      `\u274C 订单 #${id} 已被取消。${reason ? `\n\n餐厅原因：\n${reason}` : ''}\n\n如有疑问，请联系餐厅。`,

    customer_cancel_unpaid_prompt: (id) =>
      `很抱歉您要离开！请告诉我们您想取消订单 #${id} 的原因。\n\n` +
      '您的反馈有助于我们改进。（或发送 /skip 取消而不提供原因）',
    customer_cancel_paid_prompt: (id) =>
      `订单 #${id} 已付款或已处理。请告诉我们您想取消的原因。\n\n` +
      '我们会将您的请求发送给餐厅审核。（或发送 /skip 不提供原因）',
    customer_cancel_keep: '您的订单仍然有效。',
    customer_cancel_confirmed: (id, reason) =>
      `\u274C 订单 #${id} 已取消。${reason ? `\n\n原因：${reason}` : ''}`,
    customer_cancel_request_sent: (id) =>
      `您对订单 #${id} 的取消请求已发送给餐厅。\n\n` +
      '在餐厅审核之前，订单将保持有效。',
    customer_cancel_order_not_found: '此订单已不存在。',
    customer_not_authorized: '您无权操作此订单。',
    customer_keep_order_button: '保留订单',

    admin_cancel_reason_prompt: (id) =>
      `请告诉我们您取消订单 #${id} 的原因。\n` +
      '（此原因将显示给客户。发送 /skip 可直接取消而不提供原因。）',
    admin_cancel_approved: (id) => `\u2705 订单 #${id} 已取消。`,
    admin_cancel_declined: (id) =>
      `订单 #${id} 保持有效。客户的取消请求已被拒绝。`,
    admin_cancel_kept: (id) => `订单 #${id} 保持有效。`,
    admin_cancel_notify_keep: (id) =>
      `餐厅已审核您对订单 #${id} 的取消请求，并将继续准备。`,
    admin_cancel_awaiting_reason: '\u23F3 等待取消原因\u2026',
    admin_order_already_processed: '此订单已被处理。',
    admin_cancel_inline_kept: '已保留订单。',
    admin_cancel_request_title: (id, customer, total, reason) =>
      `\u26A0\uFE0F 客户请求取消已付款/已处理的订单 #${id}。\n\n` +
      `客户：${customer}\n总计：$${Number(total).toFixed(2)}\n\n原因：\n${reason}\n\n` +
      '请审核以下请求：',
    admin_approve_cancel: '批准取消',
    admin_keep_cancel: '保留订单',
    admin_notify_customer_cancelled: (id, customer, fulfillment, items, total, reason) =>
      `\u{1F6AB} 订单 #${id} 已被客户取消。\n\n客户：${customer}\n${fulfillment}\n\n商品：\n${items}\n\n总计：$${Number(total).toFixed(2)}${reason}`,

    // ── Rejection flow (admin side) ──
    admin_reject_reason_prompt: (id) =>
      `请告诉我们您拒绝订单 #${id} 的原因。\n` +
      '（此原因将显示给客户。发送 /skip 可直接拒绝而不提供原因。）',
    admin_reject_approved: (id) => `\u2705 订单 #${id} 已被拒绝。`,
    admin_reject_kept: (id) => `订单 #${id} 保持有效。`,
    admin_reject_inline_kept: '已保留订单。',
    admin_reject_awaiting_reason: '\u23F3 等待拒绝原因\u2026',

    new_order_title: (id, customer, fulfillment, payment, items, instructions, total, status) =>
      `新订单 #${id}\n\n客户：${customer}\n${fulfillment}\n付款：ABA PayWay QR (${payment})\n\n商品：\n${items}\n\n特殊说明：\n${instructions}\n\n总计：$${Number(total).toFixed(2)}\n\n状态：${status}`,

    // ── Payment received notification (to admin) ──
    payment_received_admin: (id, customer, fulfillment, items, instructions, total) =>
      `\u2705 已收到订单 #${id} 的付款\n\n客户：${customer}\n${fulfillment}\n\n商品：\n${items}\n\n特殊说明：\n${instructions}\n\n总计：$${Number(total).toFixed(2)}\n\n状态：已付款`,

    customer_receipt: (id, fulfillment, items, instructions, total) =>
      `\u2705 订单 #${id} 已批准！\n\n${fulfillment}\n\n商品：\n${items}\n\n特殊说明：\n${instructions}\n\n总计：$${Number(total).toFixed(2)}\n\n点击下方继续付款。`,

    pay_order_not_found: '未找到订单或订单已被处理。',
    pay_qr_caption: (id, total) =>
      `\u{1F4B3} 订单 #${id} 的付款\n总计：$${Number(total).toFixed(2)}\n\n请扫描此二维码进行付款。管理员将手动核实您的付款。`,
    pay_qr_sent: '\u2705 付款二维码已发送。',
    pay_qr_failed: '生成二维码失败，请重试。',
    pay_caption_updated: (text) => `${text}\n\n\u2705 付款二维码已发送。`,

    error_generic: '发生错误，请稍后重试。',
    order_update_failed: '更新订单状态失败。',
    order_not_found_generic: '未找到此订单。',

    photo_file_id: (id) => `Telegram 照片 file_id：\n${id}`,

    language_choose: '\u{1F310} 请选择您的语言：',
    language_current: (lang) => `\u{1F310} 当前语言：${lang}`,

    settings_title: '\u2699\uFE0F 设置',
    settings_language: '\u{1F310} 更改语言',
    settings_no_settings: '暂无可用设置。',
  },
};

// ─── Mapping from locale code to human-readable name ───
export const languageNames = {
  en: 'English',
  km: '\u1780\u17D2\u1798\u17C4\u17C7\u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A',
  zh: '中文',
};

export const supportedLanguages = ['en', 'km', 'zh'];

/**
 * Each language's name written in all three supported languages,
 * so every user sees a label they can understand.
 * Format: { en_name, zh_name, km_name }
 */
export const languageLabels = {
  en: { en: 'English', zh: '英语', km: 'អង់គ្លេស' },
  km: { en: 'Khmer',   zh: '高棉语', km: 'ភាសាខ្មែរ' },
  zh: { en: 'Chinese',  zh: '中文',   km: 'ចិន' },
};
