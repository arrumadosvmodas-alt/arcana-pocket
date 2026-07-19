#!/usr/bin/env node
// Adapts Prisma schema datasource based on DATABASE_URL environment variable
// For local dev (SQLite) vs production (PostgreSQL)

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

if (isPostgres) {
  // Use PostgreSQL for production
  schema = schema.replace(
    'provider = "sqlite"',
    'provider = "postgresql"'
  );
  console.log('✓ Adapted schema.prisma to PostgreSQL');
} else {
  // Use SQLite for local development
  console.log('✓ Using SQLite schema (default)');
}

fs.writeFileSync(schemaPath, schema);
