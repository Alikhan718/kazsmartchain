/* eslint-disable no-console */
import { KazClient } from '@kazsmartchain/sdk';

async function main() {
  const base = process.env.API_BASE_URL || 'http://localhost:4000';
  const client = new KazClient(base, 'dev:demo-bank:OrgAdmin');
  const orgId = 'demo-bank';

  console.log('Auth check...');
  console.log(await client.me());

  console.log('1) Issue: private tx (mock FireFly)...');
  const txRes = await fetch(`${base}/api/besu/firefly/${orgId}/tx/private`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ to: '0x0000', privacyGroupId: 'pg1', data: '0x' }),
  }).then((r) => r.json());
  console.log('besu_tx_hash:', txRes.besu_tx_hash);

  console.log('1b) Upload JSON to IPFS...');
  const json = Buffer.from(JSON.stringify({ name: 'Demo Diploma', org: orgId }), 'utf8').toString('base64');
  const ipfsRes = await client.ipfsUpload(orgId, 'meta.json', 'application/json', json);
  const cid = ipfsRes.cid;
  const uri = `ipfs://${cid}`;
  console.log('cid:', cid);

  console.log('1c) Solana mint NFT (anchor besu_tx_hash)...');
  const mintRes = await client.solanaMint(orgId, uri, txRes.besu_tx_hash);
  console.log('mint:', mintRes.mint);

  console.log('Verify metadata by mint...');
  const meta = await fetch(`${base}/api/solana/metadata/${mintRes.mint}`).then((r) => r.json());
  console.log('metadata:', meta);

  console.log('2) Revoke...');
  const revoke = await fetch(`${base}/api/solana/${orgId}/revoke`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mint: mintRes.mint, besuTxHash: txRes.besu_tx_hash }),
  }).then((r) => r.json());
  console.log('revoke:', revoke.status);

  console.log('OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

