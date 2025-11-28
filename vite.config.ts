import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'CidVitePlugin',
            fileName: 'index',
            formats: ['es'],
        },
        rollupOptions: {
            external: ['vite', 'rollup', 'multiformats', '@ipld/dag-pb', 'node:path', 'node:fs/promises', 'node:url'],
            output: {
                globals: {
                    vite: 'Vite',
                    rollup: 'Rollup',
                },
            },
        },
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
    },
});
