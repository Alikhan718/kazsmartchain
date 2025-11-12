import axios from 'axios';
import { Registry, collectDefaultMetrics, Counter } from 'prom-client';
import http from 'http';

const registry = new Registry();
collectDefaultMetrics({ register: registry });
const processedCounter = new Counter({ name: 'relay_processed_events_total', help: 'Processed events', registers: [registry] });

const PORT = process.env.RELAY_PORT ? parseInt(process.env.RELAY_PORT, 10) : 4100;
const FIREFLY = process.env.FIREFLY_BASE_URL || 'http://localhost:5100';

async function poll() {
  try {
    // Mock: pull events from firefly-mock
    const res = await axios.get(`${FIREFLY}/events`);
    const events = res.data || [];
    for (const e of events) {
      // Enrich and route; here we simply count
      processedCounter.inc();
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('poll error', e);
  }
}

setInterval(poll, 3000);

http
  .createServer(async (req, res) => {
    // CORS headers для всех запросов
    const origin = req.headers.origin;
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:4000'];
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }
    if (req.url === '/metrics') {
      res.writeHead(200, { 'content-type': registry.contentType });
      res.end(await registry.metrics());
      return;
    }
    res.writeHead(404);
    res.end();
  })
  .listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Relay listening on ${PORT}`);
  });

