import { CID } from "multiformats/cid";
import * as raw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";
import { base32 } from "multiformats/bases/base32";

/**
 * Generates a Content Identifier (CID) for the given content.
 *
 * Creates a CIDv1 using SHA-256 hashing and base32 encoding, compatible with
 * IPFS and other content-addressed storage systems. The resulting CID starts
 * with the "bafkrei" prefix.
 *
 * @remarks
 * The function uses the following specifications:
 * - **CID version**: v1
 * - **Codec**: raw (0x55)
 * - **Hash function**: SHA-256
 * - **Encoding**: base32 (lowercase)
 *
 * CIDs are deterministic: identical content always produces identical CIDs.
 * This enables content verification and deduplication.
 *
 * @param content - The content to hash. Strings are UTF-8 encoded before hashing.
 *
 * @returns A promise resolving to the CID string (59 characters, starts with "bafkrei")
 *
 * @example Hashing a string
 * ```typescript
 * const cid = await generateCID('Hello, World!');
 * console.log(cid);
 * // "bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e"
 * ```
 *
 * @example Hashing binary data
 * ```typescript
 * const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
 * const cid = await generateCID(bytes);
 * ```
 *
 * @example Verifying content integrity
 * ```typescript
 * const original = await generateCID(content);
 * const retrieved = await generateCID(downloadedContent);
 * if (original === retrieved) {
 *   console.log('Content verified');
 * }
 * ```
 *
 * @see {@link https://docs.ipfs.tech/concepts/content-addressing/ | IPFS Content Addressing}
 * @see {@link https://github.com/multiformats/cid | CID Specification}
 *
 * @public
 */
export async function generateCID(
	content: string | Uint8Array,
): Promise<string> {
	const bytes = typeof content === "string"
		? new TextEncoder().encode(content)
		: content;

	const hash = await sha256.digest(bytes);
	const cid = CID.create(1, raw.code, hash);

	return cid.toString(base32);
}
