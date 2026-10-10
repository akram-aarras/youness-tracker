import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// 1. Load Supabase credentials from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const anonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!url || (!serviceKey && !anonKey)) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey || anonKey);

// 2. Read clients_raw.txt
const rawContent = fs.readFileSync('clients_raw.txt', 'utf8');
const lines = rawContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
console.log(`Found ${lines.length} lines in clients_raw.txt`);

// 3. Parse each line
const parsedClients = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Strip initial row number (e.g. "251 bilal", "69bilal")
  let rest = line.replace(/^\d+\s*/, '').trim();

  // Extract fee if specified (e.g. "200dh", "150 dh", "50 dh")
  let fee = 200; // default 200
  const feeMatch = rest.match(/(\d+)\s*(dh|mad)\b/i);
  if (feeMatch) {
    fee = parseInt(feeMatch[1], 10);
    rest = rest.replace(feeMatch[0], '').trim();
  }

  // Extract Moroccan phone number
  let phone = '';
  const phoneMatch = rest.match(/(?:\+?212|0)[5-7]\d{8}/);
  if (phoneMatch) {
    let rawPhone = phoneMatch[0];
    rest = rest.replace(rawPhone, '').trim();

    // Normalize +212 / 00212 to standard 10-digit Moroccan domestic format (06..., 07...)
    if (rawPhone.startsWith('+212')) {
      rawPhone = '0' + rawPhone.slice(4);
    } else if (rawPhone.startsWith('00212')) {
      rawPhone = '0' + rawPhone.slice(5);
    } else if (rawPhone.startsWith('212')) {
      rawPhone = '0' + rawPhone.slice(3);
    }
    phone = rawPhone;
  }

  // Extract client name
  let name = rest.replace(/\s+/g, ' ').replace(/^[-–—,:\s]+|[-–—,:\s]+$/g, '').trim();

  parsedClients.push({
    rawLine: line,
    name,
    phone,
    fee
  });
}

console.log(`Successfully parsed ${parsedClients.length} clients from file.`);

// 4. Query current clients to find next available ID
async function runImport() {
  const { data: existingClients, error: fetchError } = await supabase
    .from('clients')
    .select('id');

  if (fetchError) {
    console.error('Error fetching existing clients:', fetchError);
    process.exit(1);
  }

  console.log(`Current existing clients in database: ${existingClients.length}`);

  // Find max numeric index from existing IDs
  let maxIndex = 0;
  existingClients.forEach(c => {
    const match = c.id.match(/^cli-(\d+)$/);
    if (match) {
      const idx = parseInt(match[1], 10);
      if (idx > maxIndex) maxIndex = idx;
    }
  });

  console.log(`Highest existing ID numeric index: cli-${String(maxIndex).padStart(3, '0')}`);

  // Prepare database rows
  const nextDueDate = '2026-11-10'; // 1 month from current billing cycle
  const rowsToInsert = parsedClients.map((client, i) => {
    const nextIdNum = maxIndex + 1 + i;
    const clientId = `cli-${String(nextIdNum).padStart(3, '0')}`;

    return {
      id: clientId,
      name: client.name,
      phone: client.phone, // "" if no phone, otherwise 06.../07...
      status: 'active',
      monthly_fee: client.fee,
      subscription_plan: `Pack Standard (${client.fee} DH)`,
      next_due_date: nextDueDate,
      hardware: {},
      notes: `Importé depuis PDF: ${client.rawLine}`
    };
  });

  console.log(`Prepared ${rowsToInsert.length} rows for insertion.`);
  console.log('Sample row (first):', rowsToInsert[0]);
  console.log('Sample row (last):', rowsToInsert[rowsToInsert.length - 1]);

  // Insert in batches of 50
  const BATCH_SIZE = 50;
  let totalInserted = 0;

  for (let b = 0; b < rowsToInsert.length; b += BATCH_SIZE) {
    const batch = rowsToInsert.slice(b, b + BATCH_SIZE);
    const { data, error } = await supabase
      .from('clients')
      .insert(batch);

    if (error) {
      console.error(`Error inserting batch ${b / BATCH_SIZE + 1}:`, error);
      process.exit(1);
    }

    totalInserted += batch.length;
    console.log(`Inserted batch ${Math.floor(b / BATCH_SIZE) + 1} (${totalInserted}/${rowsToInsert.length} clients)...`);
  }

  // 5. Final count validation
  const { count: finalCount, error: countError } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error verifying final count:', countError);
  } else {
    console.log(`\n========================================`);
    console.log(`IMPORT COMPLETED SUCCESSFULLY!`);
    console.log(`New clients inserted: ${totalInserted}`);
    console.log(`Total clients in database now: ${finalCount}`);
    console.log(`========================================\n`);
  }
}

runImport().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
