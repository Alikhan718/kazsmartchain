const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5100;
let events = [];
let tokenPools = [];
let contracts = [];
let streams = [];

// Helper functions
function json(res, code, obj) {
  res.writeHead(code, { 
    'content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(obj));
}

function log(method, url, status) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${url} -> ${status}`);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// Main server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  try {
    // Health check
    if (method === 'GET' && path === '/health') {
      log(method, path, 200);
      return json(res, 200, { status: 'ok', service: 'firefly-mock', version: '0.1.0' });
    }

    // Namespaces
    if (method === 'GET' && path === '/namespaces') {
      log(method, path, 200);
      return json(res, 200, [{ name: 'default', description: 'Default namespace' }]);
    }

    // Token pools
    if (method === 'POST' && path.startsWith('/api/v1/namespaces/default/tokens/pools')) {
      const body = await parseBody(req);
      const pool = {
        id: 'pool-' + Math.random().toString(36).slice(2, 10),
        name: body.name || 'Demo Pool',
        type: body.type || 'fungible',
        standard: body.standard || 'ERC20',
        createdAt: new Date().toISOString()
      };
      tokenPools.push(pool);
      log(method, path, 200);
      return json(res, 200, pool);
    }

    if (method === 'GET' && path.startsWith('/api/v1/namespaces/default/tokens/pools')) {
      log(method, path, 200);
      return json(res, 200, tokenPools);
    }

    // Token operations
    if (method === 'POST' && path.startsWith('/api/v1/namespaces/default/tokens/mint')) {
      const body = await parseBody(req);
      const tx = {
        id: 'mint-' + Math.random().toString(36).slice(2, 10),
        pool: body.pool || tokenPools[0]?.id,
        amount: body.amount || '100',
        to: body.to || '0x' + Math.random().toString(16).slice(2, 42),
        createdAt: new Date().toISOString()
      };
      events.push({ id: String(Date.now()), type: 'token_mint', data: tx });
      log(method, path, 200);
      return json(res, 200, tx);
    }

    if (method === 'POST' && path.startsWith('/api/v1/namespaces/default/tokens/transfer')) {
      const body = await parseBody(req);
      const tx = {
        id: 'transfer-' + Math.random().toString(36).slice(2, 10),
        pool: body.pool || tokenPools[0]?.id,
        amount: body.amount || '10',
        from: body.from || '0x' + Math.random().toString(16).slice(2, 42),
        to: body.to || '0x' + Math.random().toString(16).slice(2, 42),
        createdAt: new Date().toISOString()
      };
      events.push({ id: String(Date.now()), type: 'token_transfer', data: tx });
      log(method, path, 200);
      return json(res, 200, tx);
    }

    if (method === 'POST' && path.startsWith('/api/v1/namespaces/default/tokens/burn')) {
      const body = await parseBody(req);
      const tx = {
        id: 'burn-' + Math.random().toString(36).slice(2, 10),
        pool: body.pool || tokenPools[0]?.id,
        amount: body.amount || '5',
        from: body.from || '0x' + Math.random().toString(16).slice(2, 42),
        createdAt: new Date().toISOString()
      };
      events.push({ id: String(Date.now()), type: 'token_burn', data: tx });
      log(method, path, 200);
      return json(res, 200, tx);
    }

    // Private transactions
    if (method === 'POST' && path.startsWith('/api/v1/namespaces/default/transactions/private')) {
      const body = await parseBody(req);
      const result = {
        id: 'tx-' + Math.random().toString(36).slice(2, 10),
        besu_tx_hash: '0x' + Math.random().toString(16).slice(2, 66),
        createdAt: new Date().toISOString()
      };
      events.push({ 
        id: String(Date.now()), 
        type: 'privateTx', 
        data: { ...body, result }
      });
      log(method, path, 200);
      return json(res, 200, result);
    }

    // Contract interfaces
    if (method === 'POST' && path.startsWith('/api/v1/namespaces/default/contracts/interfaces')) {
      const body = await parseBody(req);
      const contract = {
        id: 'contract-' + Math.random().toString(36).slice(2, 10),
        name: body.name || 'Demo Contract',
        version: body.version || '1.0.0',
        ...body,
        createdAt: new Date().toISOString()
      };
      contracts.push(contract);
      log(method, path, 200);
      return json(res, 200, contract);
    }

    if (method === 'GET' && path.startsWith('/api/v1/namespaces/default/contracts/interfaces')) {
      log(method, path, 200);
      return json(res, 200, contracts);
    }

    // Event streams
    if (method === 'POST' && path.startsWith('/api/v1/namespaces/default/events/streams')) {
      const body = await parseBody(req);
      const stream = {
        id: 'stream-' + Math.random().toString(36).slice(2, 10),
        name: body.name || 'Demo Stream',
        ...body,
        createdAt: new Date().toISOString()
      };
      streams.push(stream);
      log(method, path, 200);
      return json(res, 200, stream);
    }

    if (method === 'GET' && path.startsWith('/api/v1/namespaces/default/events/streams')) {
      log(method, path, 200);
      return json(res, 200, streams);
    }

    // Events endpoint (for relay polling)
    if (method === 'GET' && path === '/events') {
      const out = events;
      events = []; // Clear after reading
      log(method, path, 200);
      return json(res, 200, out);
    }

    // 404 for unknown routes
    log(method, path, 404);
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path }));
  } catch (error) {
    log(method, path, 500);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 FireFly Mock Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Namespaces: http://localhost:${PORT}/namespaces`);
});

