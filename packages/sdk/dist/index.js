"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KazClient = exports.AuditEventSchema = void 0;
const zod_1 = require("zod");
exports.AuditEventSchema = zod_1.z.object({
    id: zod_1.z.string(),
    eventType: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    signer: zod_1.z.string().nullish().transform((val) => val ?? undefined),
    details: zod_1.z.record(zod_1.z.any()).nullish().transform((val) => val ?? undefined),
});
class KazClient {
    baseUrl;
    bearer;
    constructor(baseUrl, bearer) {
        this.baseUrl = baseUrl;
        this.bearer = bearer;
    }
    headers() {
        const h = { 'content-type': 'application/json' };
        if (this.bearer)
            h.authorization = `Bearer ${this.bearer}`;
        return h;
    }
    async me() {
        const res = await fetch(`${this.baseUrl}/api/auth/me`, { headers: this.headers() });
        return res.json();
    }
    async listAudit(tenantId, type, userId) {
        const url = new URL(`${this.baseUrl}/api/audit`);
        if (tenantId)
            url.searchParams.set('tenantId', tenantId);
        if (type)
            url.searchParams.set('type', type);
        if (userId)
            url.searchParams.set('userId', userId);
        const res = await fetch(url, { headers: this.headers() });
        const data = await res.json();
        return zod_1.z.object({ events: zod_1.z.array(exports.AuditEventSchema) }).parse(data);
    }
    async ipfsUpload(orgId, filename, mime, base64) {
        const res = await fetch(`${this.baseUrl}/api/ipfs/${orgId}/upload`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({ filename, mime, base64 }),
        });
        return res.json();
    }
    async solanaMint(orgId, uri, besuTxHash) {
        const res = await fetch(`${this.baseUrl}/api/solana/${orgId}/mint`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({ uri, besuTxHash, signerPolicy: 'custodial' }),
        });
        return res.json();
    }
}
exports.KazClient = KazClient;
