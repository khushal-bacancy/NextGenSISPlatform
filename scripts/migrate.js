const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.trim().startsWith("#") && line.includes("="))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx), line.slice(idx + 1)];
    })
);

const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL");
  process.exit(1);
}

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const migrationTable = "schema_migrations";

async function ensureMigrationTable(client) {
  await client.query(`
    create table if not exists public.${migrationTable} (
      id text primary key,
      applied_at timestamptz not null default now()
    );
  `);
}

async function getAppliedMigrations(client) {
  const { rows } = await client.query(`select id from public.${migrationTable}`);
  return new Set(rows.map((row) => row.id));
}

async function applyMigration(client, fileName, sql) {
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query(`insert into public.${migrationTable} (id) values ($1) on conflict (id) do nothing`, [
      fileName
    ]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

async function run() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await ensureMigrationTable(client);
  const applied = await getAppliedMigrations(client);
  const forceBaseline = process.env.MIGRATE_FORCE_BASELINE === "1";
  const forceApplyList = (process.env.MIGRATE_FORCE_APPLY || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const baselineUntil = process.env.MIGRATE_BASELINE_UNTIL;
  if (process.env.MIGRATE_BASELINE === "1" && (applied.size === 0 || forceBaseline)) {
    const baselineFiles = baselineUntil
      ? files.filter((file) => file <= baselineUntil)
      : files;

    if (baselineFiles.length === 0) {
      console.log("No migrations found to baseline.");
    } else {
      const values = baselineFiles.map((file, idx) => `($${idx + 1})`).join(", ");
      await client.query(`insert into public.${migrationTable} (id) values ${values}`, baselineFiles);
      console.log(`Baselined ${baselineFiles.length} migration(s).`);
    }
    await client.end();
    return;
  }

  let appliedCount = 0;
  for (const file of files) {
    if (applied.has(file) && !forceApplyList.includes(file)) {
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}...`);
    await applyMigration(client, file, sql);
    appliedCount += 1;
  }

  await client.end();
  console.log(appliedCount ? `Applied ${appliedCount} migration(s).` : "No new migrations to apply.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
