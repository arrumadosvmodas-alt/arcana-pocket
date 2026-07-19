#!/usr/bin/env node
// Adapts Prisma schema datasource based on DATABASE_URL environment variable
// For local dev (SQLite) vs production (PostgreSQL)

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const prismaDir = path.join(__dirname, '../.prisma');

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

// Read current schema
let schema = fs.readFileSync(schemaPath, 'utf-8');

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

// Clear Prisma cache to force regeneration
if (fs.existsSync(prismaDir)) {
  try {
    const files = fs.readdirSync(prismaDir);
    files.forEach(file => {
      const filePath = path.join(prismaDir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        // Remove directory recursively
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    });
    console.log('✓ Cleared Prisma cache');
  } catch (e) {
    console.warn('⚠ Could not clear Prisma cache:', e.message);
  }
}

console.log('✓ Schema adaptation complete');

