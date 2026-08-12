/**
 * Bulk import script — reads menu.json and inserts ALL categories,
 * items, and variants directly into the database in one shot.
 *
 * Usage:
 *   1. Copy menu.json to this project root (or edit MENU_PATH below)
 *   2. node scripts/bulk-import.js
 *
 * The script will:
 *   - Create categories (with EN/KM/ZH names)
 *   - Create items (with EN/KM/ZH names and descriptions)
 *   - Create variants (with EN/KM/ZH names)
 *   - Skip the auto-created "Regular" variant since menu.json has real variants
 */

import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MENU_PATH = resolve('/Users/macos/Downloads/Chhne Meas_Food Photo/menu.json');

// ── Connect to DB ──────────────────────────────────────────────────
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

// ── Helpers ────────────────────────────────────────────────────────
function clean(val) {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s === '' || s === 'null' || s === 'undefined' ? null : s;
}

function num(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

// ── Load menu ──────────────────────────────────────────────────────
let menu;
try {
  const raw = readFileSync(MENU_PATH, 'utf-8');
  menu = JSON.parse(raw);
  console.log(`✅ Loaded menu.json — ${menu.sections.length} sections`);
} catch (e) {
  console.error(`❌ Failed to load menu.json from ${MENU_PATH}`);
  console.error(e.message);
  process.exit(1);
}

// ── Category name map ──────────────────────────────────────────────
// Some sections in menu.json have English names that need Khmer/Chinese
const CATEGORY_TRANSLATIONS = {
  'Soda':        { km: 'សូដា',             zh: '汽水' },
  'Juice':       { km: 'ទឹកផ្លែឈើ',       zh: '果汁' },
  'Frappe':      { km: 'ហ្វ្រាបុប',         zh: '冰沙' },
  'Hot':         { km: 'ភេសជ្ជៈក្តៅ',       zh: '热饮' },
  'Iced':        { km: 'ភេសជ្ជៈត្រជាក់',    zh: '冰饮' },
  'Soup':        { km: 'សម្លរស៊ុប',         zh: '汤' },
  'Fried Rice':  { km: 'បាយឆា',            zh: '炒饭' },
  'Fishes':      { km: 'ត្រី',              zh: '鱼类' },
  'Vegetables':  { km: 'បន្លែ',             zh: '蔬菜' },
  'Meat':        { km: 'សាច់',             zh: '肉类' },
  'Snail':       { km: 'ខ្យង',             zh: '螺类' },
  'Cold Plates': { km: 'អាហារសម្រន់',       zh: '冷盘/前菜' },
  'Squid':       { km: 'មឹក',              zh: '鱿鱼' },
  'Crab':        { km: 'ក្តាម',            zh: '螃蟹' },
  'Shrimp':      { km: 'បង្គា',            zh: '虾' },
};

// ── Drinks that need Khmer (user to fill in) ───────────────────────
// These are the items where name_km is null in the JSON
const DRINKS_KHMER = {
  'Passion Fruit Soda': 'សូដាផ្លែស្វាយចន្ទី',
  'Kiwi Soda':          'សូដាគីវី',
  'Stawberry Soda':     'សូដាស្ត្របឺរី',
  'Blueberry Soda':     'សូដាប៊្លូបឺរី',
  'Raspberry Soda':     'សូដារ៉ាស្បឺរី',
  'Carrot Juice':       'ទឹកការ៉ុត',
  'Pursat Orange Juice':'ទឹកក្រូចពោធិ៍សាត់',
  'Orange Juice':       'ទឹកក្រូច',
  'Pineapple Juice':    'ទឹកម្នាស់',
  'Watermelon Juice':   'ទឹកឪឡឹក',
  'Fresh Coconut':      'ទឹកដូង',
  'Apple Juice':        'ទឹកប៉ោម',
  'Coffee Frappe':      'កាហ្វេហ្វ្រាបុប',
  'Chocolate Frappe':   'សូកូឡាហ្វ្រាបុប',
  'Strawberry Frappe':  'ស្ត្របឺរីហ្វ្រាបុប',
  'Green Tea Frappe':   'តែបៃតងហ្វ្រាបុប',
  'Coconut Frappe':     'ដូងហ្វ្រាបុប',
  'Vanilla Frappe':     'វ៉ានីឡាហ្វ្រាបុប',
  'Avocado Frappe':     'ផ្លែបឺរហ្វ្រាបុប',
  'Blueberry Frappe':   'ប៊្លូបឺរីហ្វ្រាបុប',
  'Hot Cappucino':      'កាហ្វេកាពុឈីណូក្តៅ',
  'Hot Mocha':          'ម៉ុកកាក្តៅ',
  'Hot Coffee Latte':   'ឡាតេក្តៅ',
  'Hot Chocolate':      'សូកូឡាក្តៅ',
  'Hot Americano':      'អាមេរិកាណូក្តៅ',
  'Hot Expresso':       'អេស្ប្រេសសូក្តៅ',
  'Hot Tea':            'តែក្តៅ',
  'Hot Green Tea':      'តែបៃតងក្តៅ',
  'Iced Green Tea':     'តែបៃតងទឹកកក',
  'Iced Milk Green Tea':'តែបៃតងទឹកដោះគោទឹកកក',
  'Iced Lemon Tea':     'តែក្រូចឆ្មាទឹកកក',
  'Iced Honey Lemon Tea':'តែទឹកឃ្មុំក្រូចឆ្មាទឹកកក',
  'Iced Passion With Milk':'ទឹកស្វាយចន្ទីទឹកដោះគោទឹកកក',
  'Iced Thai Tea':      'តែថៃទឹកកក',
  'Iced Latte':         'ឡាតេទឹកកក',
  'Iced Coffee With Milk':'កាហ្វេទឹកដោះគោទឹកកក',
  'Iced Americano':     'អាមេរិកាណូទឹកកក',
  'Iced Cappucino':     'កាពុឈីណូទឹកកក',
  'Iced Mocha':         'ម៉ុកកាទឹកកក',
  'Iced Chocolate':     'សូកូឡាទឹកកក',
};

// ── Fix known issues ───────────────────────────────────────────────
const ITEM_FIXES = {
  'Strawberry Frappe': { name_zh: '草莓星冰乐' },  // was wrongly "巧克力星冰乐"
  'Stawberry Soda': { name: 'Strawberry Soda' }, // fix typo
  'Hot Cappucino': { name: 'Hot Cappuccino' },
  'Iced Cappucino': { name: 'Iced Cappuccino' },
  'Hot Expresso': { name: 'Hot Espresso' },
};

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── Clear existing menu data (safe — we backed up, right?) ──
    console.log('🗑️  Clearing existing menu data...');
    await client.query('DELETE FROM menu_item_variants');
    await client.query('DELETE FROM menu_items');
    await client.query('DELETE FROM categories');
    console.log('   Done.');

    let sortIndex = 0;
    let totalItems = 0;
    let totalVariants = 0;

    for (const section of menu.sections) {
      const catName = section.category_name_en;
      sortIndex++;

      // Get or create category translations
      const catT = CATEGORY_TRANSLATIONS[catName] || {};
      const catNameKm = catT.km || null;
      const catNameZh = catT.zh || null;

      // Insert category
      const catResult = await client.query(
        `INSERT INTO categories (name, name_km, name_zh, sort_order, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id`,
        [catName, catNameKm, catNameZh, sortIndex],
      );
      const categoryId = catResult.rows[0].id;
      console.log(`\n📂 Category [${sortIndex}]: ${catName}`);

      // Insert items
      let itemSort = 0;
      for (const item of section.items) {
        itemSort++;

        // Apply known fixes
        let itemData = { ...item };
        const fixes = ITEM_FIXES[item.name];
        if (fixes) {
          itemData = { ...itemData, ...fixes };
          if (fixes.name && fixes.name !== item.name) {
            console.log(`   🔧 Fixed name: "${item.name}" → "${fixes.name}"`);
          }
          if (fixes.name_zh) {
            console.log(`   🔧 Fixed Chinese: "${item.name}" → "${fixes.name_zh}"`);
          }
        }

        // Use Khmer from the JSON, or from our drinks map, or null
        let nameKm = clean(itemData.name_km);
        if (!nameKm && DRINKS_KHMER[itemData.name]) {
          nameKm = DRINKS_KHMER[itemData.name];
        }
        let nameZh = clean(itemData.name_zh);

        const name = clean(itemData.name) || 'Unknown';
        const desc = clean(itemData.description) || null;
        const descKm = clean(itemData.description_km) || null;
        const descZh = clean(itemData.description_zh) || null;
        const price = num(itemData.price);

        // Insert menu item
        const itemResult = await client.query(
          `INSERT INTO menu_items
             (category_id, name, name_km, name_zh, description, description_km, description_zh, price, sort_order, is_available)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
           RETURNING id`,
          [categoryId, name, nameKm, nameZh, desc, descKm, descZh, price, itemSort],
        );
        const itemId = itemResult.rows[0].id;
        totalItems++;

        const khmerStatus = nameKm ? '✅' : '⚠️';
        console.log(`   ${khmerStatus} ${name}${nameKm ? `  🇰🇭${nameKm}` : ''}`);

        // Insert variants
        if (itemData.variants && itemData.variants.length > 0) {
          let varSort = 0;
          for (const v of itemData.variants) {
            varSort++;
            const vName = clean(v.name) || 'Regular';
            let vNameKm = clean(v.name_km) || null;
            let vNameZh = clean(v.name_zh) || null;

            // If this is a drinks item and variant names are missing Khmer
            if (!vNameKm && DRINKS_KHMER[vName]) {
              vNameKm = DRINKS_KHMER[vName];
            }

            await client.query(
              `INSERT INTO menu_item_variants
                 (menu_item_id, name, name_km, name_zh, price, is_weight_based, sort_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [itemId, vName, vNameKm, vNameZh, num(v.price), v.is_weight_based || false, varSort],
            );
            totalVariants++;
          }
        } else if (itemData.is_weight_based) {
          // Weight-based item with no explicit variants
          await client.query(
            `INSERT INTO menu_item_variants
               (menu_item_id, name, name_km, name_zh, price, is_weight_based, sort_order)
             VALUES ($1, 'Per kg', $2, $3, 0, true, 0)`,
            [itemId,
             itemData.name_km ? 'ក្នុងមួយគីឡូ' : null,
             '每公斤'],
          );
          totalVariants++;
        } else {
          // Item with no variants — create a default one
          await client.query(
            `INSERT INTO menu_item_variants
               (menu_item_id, name, name_km, name_zh, price, is_weight_based, sort_order)
             VALUES ($1, 'Regular', 'ធម្មតា', '常规', $2, false, 0)`,
            [itemId, price],
          );
          totalVariants++;
        }
      }
    }

    await client.query('COMMIT');

    console.log('\n══════════════════════════════════════════');
    console.log('✅ BULK IMPORT COMPLETE!');
    console.log(`   📂 ${menu.sections.length} categories`);
    console.log(`   🍽️  ${totalItems} items`);
    console.log(`   🔢 ${totalVariants} variants`);
    console.log('══════════════════════════════════════════\n');

    // ── Summary of missing Khmer ──
    console.log('📋 Items still missing Khmer (check these in admin panel):');
    const missingResult = await client.query(
      `SELECT name FROM menu_items WHERE name_km IS NULL ORDER BY sort_order`
    );
    if (missingResult.rows.length === 0) {
      console.log('   None — all items have Khmer! 🎉');
    } else {
      for (const r of missingResult.rows) {
        console.log(`   ⚠️  ${r.name}`);
      }
      console.log(`   Total: ${missingResult.rows.length} items`);
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed, rolled back.');
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
