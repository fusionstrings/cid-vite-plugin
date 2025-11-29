import { defineConfig } from "vite";
import { cidVitePlugin } from "../src/index.ts";

export default defineConfig({
	root: __dirname,
	plugins: [
		cidVitePlugin(),
	],
	build: {
		outDir: "dist",
		emptyOutDir: true,
		manifest: true,
		ssrManifest: true,
		modulePreload: true,
	},
});
