import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';
import { base32 } from 'multiformats/bases/base32';

export async function generateCID(content: string | Uint8Array | Buffer): Promise<string> {
    const bytes = typeof content === 'string'
        ? new TextEncoder().encode(content)
        : content;

    const hash = await sha256.digest(bytes);
    const cid = CID.create(1, raw.code, hash);

    return cid.toString(base32);
}
