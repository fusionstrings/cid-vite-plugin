import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from 'vite';
import { cidVitePlugin } from './index.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, '../temp-mpa');

describe('cidVitePlugin - MPA Support', () => {
    beforeAll(async () => {
        await fs.mkdir(tempDir, { recursive: true });

        // Create index.html
        await fs.writeFile(path.join(tempDir, 'index.html'), `
      <!DOCTYPE html>
      <html>
        <head><title>Home</title></head>
        <body>
          <h1>Home</h1>
          <a href="/about.html">About</a>
        </body>
      </html>
    `);

        // Create about.html
        await fs.writeFile(path.join(tempDir, 'about.html'), `
      <!DOCTYPE html>
      <html>
        <head><title>About</title></head>
        <body>
          <h1>About</h1>
          <script type="module" src="./main.js"></script>
        </body>
      </html>
    `);

        // Create main.js
        await fs.writeFile(path.join(tempDir, 'main.js'), `console.log('main');`);
    });

    afterAll(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('should preserve filenames for all HTML entry points', async () => {
        await build({
            root: tempDir,
            logLevel: 'silent',
            plugins: [cidVitePlugin()],
            build: {
                outDir: 'dist',
                minify: false,
                emptyOutDir: true,
                rollupOptions: {
                    input: {
                        main: path.join(tempDir, 'index.html'),
                        about: path.join(tempDir, 'about.html'),
                    },
                },
            },
        });

        const distDir = path.join(tempDir, 'dist');

        // Check that index.html exists
        const indexExists = await fs.stat(path.join(distDir, 'index.html')).then(() => true).catch(() => false);
        expect(indexExists).toBe(true);

        // Check that about.html exists (should NOT be renamed)
        const aboutExists = await fs.stat(path.join(distDir, 'about.html')).then(() => true).catch(() => false);
        expect(aboutExists).toBe(true);

        // Check that JS file IS renamed
        const files = await fs.readdir(distDir, { recursive: true });
        const jsFiles = files.filter(f => typeof f === 'string' && f.endsWith('.js'));
        expect(jsFiles.length).toBeGreaterThan(0);
        const jsBasename = path.basename(jsFiles[0] as string);
        expect(jsBasename).toMatch(/^bafkrei/);
    });
});
