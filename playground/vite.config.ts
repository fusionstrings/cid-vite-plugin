import { defineConfig } from "vite";
import { cid } from "../src/index.ts";

export default defineConfig({
	root: __dirname,
	plugins: [
		cid(),
	],
	build: {
		outDir: "dist",
		emptyOutDir: true,
		manifest: true,
		ssrManifest: true,
		modulePreload: true,
	},
});
