import { z } from 'zod';
export declare const AuditEventSchema: z.ZodObject<{
    id: z.ZodString;
    eventType: z.ZodString;
    createdAt: z.ZodString;
    signer: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | undefined, string | null | undefined>;
    details: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>>, Record<string, any> | undefined, Record<string, any> | null | undefined>;
}, "strip", z.ZodTypeAny, {
    id: string;
    eventType: string;
    createdAt: string;
    signer?: string | undefined;
    details?: Record<string, any> | undefined;
}, {
    id: string;
    eventType: string;
    createdAt: string;
    signer?: string | null | undefined;
    details?: Record<string, any> | null | undefined;
}>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export declare class KazClient {
    private readonly baseUrl;
    private readonly bearer?;
    constructor(baseUrl: string, bearer?: string | undefined);
    private headers;
    me(): Promise<any>;
    listAudit(tenantId?: string, type?: string, userId?: string): Promise<{
        events: {
            id: string;
            eventType: string;
            createdAt: string;
            signer?: string | undefined;
            details?: Record<string, any> | undefined;
        }[];
    }>;
    ipfsUpload(orgId: string, filename: string, mime: string, base64: string): Promise<any>;
    solanaMint(orgId: string, uri: string, besuTxHash?: string): Promise<any>;
}
