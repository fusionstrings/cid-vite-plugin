import { assertEquals } from "@std/assert";
import { generateCID } from "./cid.ts";

Deno.test("generateCID - should generate a CID for a string", async () => {
	const content = "hello world";
	const cid = await generateCID(content);
	assertEquals(typeof cid, "string");
	// Known CID for 'hello world' with default settings (raw, sha2-256, base32)
	// bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e
	assertEquals(
		cid,
		"bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e",
	);
});

Deno.test("generateCID - should generate a CID for a Uint8Array", async () => {
	const content = new TextEncoder().encode("hello world");
	const cid = await generateCID(content);
	assertEquals(
		cid,
		"bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e",
	);
});
