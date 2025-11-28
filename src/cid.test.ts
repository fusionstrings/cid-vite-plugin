import { describe, it, expect } from 'vitest';
import { generateCID } from './cid.js';

describe('generateCID', () => {
    it('should generate a CID for a string', async () => {
        const content = 'hello world';
        const cid = await generateCID(content);
        expect(cid).toBeDefined();
        expect(typeof cid).toBe('string');
        // Known CID for 'hello world' with default settings (raw, sha2-256, base32)
        // bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e
        expect(cid).toBe('bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e');
    });

    it('should generate a CID for a buffer', async () => {
        const content = Buffer.from('hello world');
        const cid = await generateCID(content);
        expect(cid).toBe('bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e');
    });
});
