#!/usr/bin/env node
/**
 * Apply prisma/schema.prisma to the Turso database configured in .env.
 *
 *   npm run db:push:turso             push to an empty database
 *   npm run db:push:turso:reset       drop existing tables first, then push
 *   npm run db:push:turso -- --dry-run  print the SQL without touching Turso
 */
import 'dotenv/config'
import { execSync } from 'node:child_process'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
const reset = process.argv.includes('--reset')
const dryRun = process.argv.includes('--dry-run')

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN. Add both to .env first.')
  process.exit(1)
}

console.log('Generating SQL from prisma/schema.prisma ...')
const sql = execSync(
  'npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script',
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
).trim()

if (!sql) {
  console.error('Prisma produced no SQL. Check that prisma/schema.prisma is valid.')
  process.exit(1)
}

if (dryRun) {
  console.log(`\n${sql}`)
  process.exit(0)
}

const client = createClient({ url, authToken })

async function listTables() {
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' ORDER BY name",
  )
  return result.rows.map((row) => String(row.name))
}

try {
  const existing = await listTables()

  if (existing.length > 0) {
    if (!reset) {
      console.error(`\nThis database already has ${existing.length} table(s):`)
      console.error(`  ${existing.join(', ')}`)
      console.error('\nNothing was changed.')
      console.error('If this database is disposable, run: npm run db:push:turso:reset')
      client.close()
      process.exit(1)
    }

    console.log(`Dropping ${existing.length} existing table(s) ...`)
    await client.execute('PRAGMA foreign_keys = OFF')
    for (const table of existing) {
      await client.execute(`DROP TABLE IF EXISTS "${table.replace(/"/g, '""')}"`)
    }
    await client.execute('PRAGMA foreign_keys = ON')
  }

  console.log('Applying schema ...')
  await client.executeMultiple(sql)

  const applied = await listTables()
  console.log(`\nDone. ${applied.length} table(s) on Turso:`)
  console.log(`  ${applied.join(', ')}`)
} catch (error) {
  console.error('\nFailed to push the schema:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  client.close()
}
