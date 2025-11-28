import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from 'vite';
import { cidVitePlugin } from './index.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCID } from './cid.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, '../temp-test');

describe('cidVitePlugin', () => {
    beforeAll(async () => {
        await fs.mkdir(tempDir, { recursive: true });
        // Create a simple app
        await fs.writeFile(path.join(tempDir, 'index.html'), `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="module" src="./main.js"></script>
          <link rel="stylesheet" href="./style.css">
        </head>
        <body>
          <h1>Hello</h1>
        </body>
      </html>
    `);
        await fs.writeFile(path.join(tempDir, 'main.js'), `
      import './style.css';
      console.log('main');
    `);
        await fs.writeFile(path.join(tempDir, 'style.css'), `
      body { color: red; }
    `);
    });

    afterAll(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('should rename files to their CIDs', async () => {
        await build({
            root: tempDir,
            logLevel: 'silent',
            plugins: [cidVitePlugin()],
            build: {
                outDir: 'dist',
                minify: false, // Easier to debug/verify
                emptyOutDir: true,
            },
        });

        const distDir = path.join(tempDir, 'dist');
        const files = await fs.readdir(distDir, { recursive: true });

        // Filter out directories
        const filePaths = [];
        for (const f of files) {
            const stat = await fs.stat(path.join(distDir, f));
            if (stat.isFile()) filePaths.push(f);
        }

        // Expect index.html, and assets
        // The assets should have CID names.
        // Note: index.html is usually an entry point and might not be renamed by default in some setups, 
        // but for a pure static site it might be. 
        // However, Vite usually keeps index.html as index.html. 
        // The assets (js, css) should be renamed.

        const cssFile = filePaths.find(f => f.endsWith('.css'));
        const jsFile = filePaths.find(f => f.endsWith('.js'));

        expect(cssFile).toBeDefined();
        expect(jsFile).toBeDefined();

        // Verify CSS CID
        if (cssFile) {
            const content = await fs.readFile(path.join(distDir, cssFile));
            const expectedCid = await generateCID(content);
            expect(cssFile).toContain(expectedCid);
        }

        // Verify JS CID
        if (jsFile) {
            const content = await fs.readFile(path.join(distDir, jsFile));
            const expectedCid = await generateCID(content);
            expect(jsFile).toContain(expectedCid);
        }

        // Verify HTML CID and references
        // index.html should NOT be renamed so it can be served
        const indexHtmlPath = path.join(distDir, 'index.html');
        const indexHtmlExists = await fs.stat(indexHtmlPath).then(() => true).catch(() => false);
        expect(indexHtmlExists).toBe(true);

        if (indexHtmlExists) {
            const content = await fs.readFile(indexHtmlPath, 'utf-8');
            // It should reference the JS and CSS files by their new names
            if (jsFile) expect(content).toContain(jsFile);
            if (cssFile) expect(content).toContain(cssFile);
        }
    });
});
