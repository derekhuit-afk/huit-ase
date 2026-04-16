// ASE: pages/api/migrate-crmex-outbound.js
// One-shot migration: creates communications, sequences, sequence_enrollments in CRMEX
// Run once via GET /api/migrate-crmex-outbound?key=ASE_ADMIN_KEY

const SB_URL = 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_KEY = process.env.ASE_ADMIN_KEY;

async function tryCreate(tableName, insertData) {
  const res = await fetch(`${SB_URL}/rest/v1/${tableName}`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(insertData),
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function tableExists(tableName) {
  const res = await fetch(`${SB_URL}/rest/v1/${tableName}?limit=0`, {
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  return res.status !== 404 && res.status !== 400;
}

// Use Supabase pg-meta API to run DDL
async function runDDL(sql) {
  // Try the internal pg-meta route that Supabase Dashboard uses
  const res = await fetch(`${SB_URL}/pg/query`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  return { status: res.status, body: text.slice(0, 200) };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = req.headers['x-ase-key'] || req.query.key;
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const results = {};

  // Check which tables already exist
  const commExists = await tableExists('communications');
  const seqExists = await tableExists('sequences');
  const enrollExists = await tableExists('sequence_enrollments');

  results.table_status = {
    communications: commExists ? '✅ exists' : '❌ missing',
    sequences: seqExists ? '✅ exists' : '❌ missing',
    sequence_enrollments: enrollExists ? '✅ exists' : '❌ missing',
  };

  // Try DDL creation via pg endpoint
  const ddl = {
    communications: `
      CREATE TABLE IF NOT EXISTS public.communications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
        contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
        prospect_id UUID,
        channel TEXT NOT NULL CHECK (channel IN ('email','sms','linkedin','rcs','call')),
        direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound','inbound')),
        subject TEXT,
        body_preview TEXT,
        status TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','opened','replied','bounced','failed')),
        product TEXT,
        source TEXT DEFAULT 'ase',
        provider TEXT,
        provider_message_id TEXT,
        sent_at TIMESTAMPTZ DEFAULT NOW(),
        opened_at TIMESTAMPTZ,
        replied_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_comms_lead ON communications(lead_id);
      CREATE INDEX IF NOT EXISTS idx_comms_sent ON communications(sent_at DESC);
      CREATE INDEX IF NOT EXISTS idx_comms_channel ON communications(channel, status);
    `,
    sequences: `
      CREATE TABLE IF NOT EXISTS public.sequences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        product TEXT,
        persona TEXT,
        channel TEXT DEFAULT 'email',
        status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed','draft')),
        total_steps INTEGER DEFAULT 5,
        enrolled_count INTEGER DEFAULT 0,
        replied_count INTEGER DEFAULT 0,
        sent_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
    sequence_enrollments: `
      CREATE TABLE IF NOT EXISTS public.sequence_enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sequence_id UUID REFERENCES sequences(id) ON DELETE CASCADE,
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        prospect_id UUID,
        current_step INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed','replied','unsubscribed')),
        enrolled_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        replied_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_enrollments_seq ON sequence_enrollments(sequence_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_lead ON sequence_enrollments(lead_id);
    `,
  };

  for (const [table, sql] of Object.entries(ddl)) {
    const r = await runDDL(sql);
    results[`ddl_${table}`] = { status: r.status, response: r.body };
  }

  // Verify after DDL attempt
  results.verification = {
    communications: await tableExists('communications') ? '✅ exists' : '❌ still missing — needs Supabase SQL Editor',
    sequences: await tableExists('sequences') ? '✅ exists' : '❌ still missing — needs Supabase SQL Editor',
    sequence_enrollments: await tableExists('sequence_enrollments') ? '✅ exists' : '❌ still missing — needs Supabase SQL Editor',
  };

  // Generate SQL script for manual fallback
  results.manual_sql = `-- Run this in Supabase SQL Editor if auto-migration failed:\n${Object.values(ddl).join('\n')}`;

  return res.status(200).json({
    success: true,
    results,
    timestamp: new Date().toISOString(),
  });
}
