const http = require('http');
const PORT = process.env.PORT || 8899;

function json(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}

http
  .createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/') {
      // Mock JSON-RPC
      let body = '';
      req.on('data', (d) => (body += d));
      req.on('end', () => {
        try {
          const rpc = JSON.parse(body || '{}');
          if (rpc.method === 'sendTransaction') {
            return json(res, 200, { jsonrpc: '2.0', id: rpc.id, result: 'tx-' + Math.random().toString(36).slice(2) });
          }
          return json(res, 200, { jsonrpc: '2.0', id: rpc.id, result: null });
        } catch {
          return json(res, 200, { jsonrpc: '2.0', id: null, result: null });
        }
      });
      return;
    }
    res.writeHead(404);
    res.end();
  })
  .listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log('Solana mock on', PORT);
  });

