#!/usr/bin/env node
// Simple seed placeholder. The real seed uses API endpoints for portability.
const http = require('http');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      API_BASE.replace('http://', '').split(':'),
      (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch {
            resolve({ status: res.statusCode });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Seeding demo data...');
  console.log('Please run API first. This script is a placeholder.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

