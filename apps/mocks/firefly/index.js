const http = require('http');

const PORT = process.env.PORT || 5100;
let events = [];

function json(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}

http
  .createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/namespaces') {
      return json(res, 200, [{ name: 'default' }]);
    }
    if (req.method === 'POST' && req.url.startsWith('/api/v1/namespaces/default/tokens/pools')) {
      return json(res, 200, { id: 'pool-' + Math.random().toString(36).slice(2, 8) });
    }
    if (req.method === 'POST' && req.url.startsWith('/api/v1/namespaces/default/tokens/mint')) {
      return json(res, 200, { tx: 'mint-' + Math.random().toString(36).slice(2, 8) });
    }
    if (req.method === 'POST' && req.url.startsWith('/api/v1/namespaces/default/tokens/transfer')) {
      return json(res, 200, { tx: 'transfer-' + Math.random().toString(36).slice(2, 8) });
    }
    if (req.method === 'POST' && req.url.startsWith('/api/v1/namespaces/default/tokens/burn')) {
      return json(res, 200, { tx: 'burn-' + Math.random().toString(36).slice(2, 8) });
    }
    if (req.method === 'POST' && req.url.startsWith('/api/v1/namespaces/default/transactions/private')) {
      let body = '';
      req.on('data', (d) => (body += d));
      req.on('end', () => {
        const data = JSON.parse(body || '{}');
        const result = { besu_tx_hash: '0x' + Math.random().toString(16).slice(2) };
        events.push({ id: String(Date.now()), type: 'privateTx', data });
        return json(res, 200, result);
      });
      return;
    }
    if (req.method === 'POST' && req.url.startsWith('/api/v1/namespaces/default/contracts/interfaces')) {
      return json(res, 200, { ok: true });
    }
    if (req.method === 'POST' && req.url.startsWith('/api/v1/namespaces/default/events/streams')) {
      return json(res, 200, { id: 'stream-' + Math.random().toString(36).slice(2, 8) });
    }
    if (req.method === 'GET' && req.url === '/events') {
      const out = events;
      events = [];
      return json(res, 200, out);
    }
    res.writeHead(404);
    res.end();
  })
  .listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log('FireFly mock on', PORT);
  });

