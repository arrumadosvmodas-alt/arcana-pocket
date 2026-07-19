#!/usr/bin/env node
// Adapts Prisma schema datasource based on DATABASE_URL environment variable
// For local dev (SQLite) vs production (PostgreSQL)

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

let dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl) {
  const envPaths = [
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env')
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/^DATABASE_URL\s*=\s*["']?(.*?)["']?$/m);
      if (match && match[1]) {
        dbUrl = match[1];
        break;
      }
    }
  }
}

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
  schema = schema.replace(
    'provider = "postgresql"',
    'provider = "sqlite"'
  );
  console.log('✓ Using SQLite schema (default)');
}

fs.writeFileSync(schemaPath, schema);

