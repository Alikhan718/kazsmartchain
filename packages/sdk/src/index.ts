import { z } from 'zod';

export const AuditEventSchema = z.object({
  id: z.string(),
  eventType: z.string(),
  createdAt: z.string(),
  signer: z.string().nullish().transform((val) => val ?? undefined),
  details: z.record(z.any()).nullish().transform((val) => val ?? undefined),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

export class KazClient {
  constructor(private readonly baseUrl: string, private readonly bearer?: string) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'content-type': 'application/json' };
    if (this.bearer) h.authorization = `Bearer ${this.bearer}`;
    return h;
  }

  async me() {
    const res = await fetch(`${this.baseUrl}/api/auth/me`, { headers: this.headers() });
    return res.json();
  }

  async listAudit(tenantId?: string, type?: string, userId?: string) {
    const url = new URL(`${this.baseUrl}/api/audit`);
    if (tenantId) url.searchParams.set('tenantId', tenantId);
    if (type) url.searchParams.set('type', type);
    if (userId) url.searchParams.set('userId', userId);
    const res = await fetch(url, { headers: this.headers() });
    const data = await res.json();
    return z.object({ events: z.array(AuditEventSchema) }).parse(data);
  }

  async ipfsUpload(orgId: string, filename: string, mime: string, base64: string) {
    const res = await fetch(`${this.baseUrl}/api/ipfs/${orgId}/upload`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ filename, mime, base64 }),
    });
    return res.json();
  }

  async solanaMint(orgId: string, uri: string, besuTxHash?: string) {
    const res = await fetch(`${this.baseUrl}/api/solana/${orgId}/mint`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ uri, besuTxHash, signerPolicy: 'custodial' }),
    });
    return res.json();
  }
}

