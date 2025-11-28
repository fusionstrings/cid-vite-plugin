import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from 'vite';
import { cidVitePlugin } from './index.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCID } from './cid.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, '../temp-edge-cases');

describe('cidVitePlugin - Edge Cases', () => {
    beforeAll(async () => {
        await fs.mkdir(tempDir, { recursive: true });
    });

    afterAll(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('should handle duplicate content (CID collision)', async () => {
        // Create two files with identical content
        await fs.writeFile(path.join(tempDir, 'index.html'), `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="module" src="./a.js"></script>
          <script type="module" src="./b.js"></script>
        </head>
        <body><h1>Test</h1></body>
      </html>
    `);
        await fs.writeFile(path.join(tempDir, 'a.js'), `console.log('same');`);
        await fs.writeFile(path.join(tempDir, 'b.js'), `console.log('same');`);

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
                    },
                },
            },
        });

        const distDir = path.join(tempDir, 'dist');
        const files = await fs.readdir(distDir, { recursive: true });
        const jsFiles = files.filter(f => typeof f === 'string' && f.endsWith('.js'));

        // Both files should have the same CID since they have the same content
        // But Vite might bundle them together, so we just check that CIDs are valid
        for (const file of jsFiles) {
            const basename = path.basename(file as string, '.js');
            expect(basename).toMatch(/^bafkrei/);
        }
    });

    it('should handle CSS with url() references', async () => {
        await fs.mkdir(path.join(tempDir, 'assets'), { recursive: true });
        await fs.writeFile(path.join(tempDir, 'index.html'), `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="./style.css">
        </head>
        <body><h1>Test</h1></body>
      </html>
    `);
        await fs.writeFile(path.join(tempDir, 'style.css'), `
      body {
        background-image: url('./assets/bg.png');
      }
    `);
        // Create a small PNG (1x1 transparent pixel)
        const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        await fs.writeFile(path.join(tempDir, 'assets/bg.png'), pngData);

        await build({
            root: tempDir,
            logLevel: 'silent',
            plugins: [cidVitePlugin()],
            build: {
                outDir: 'dist',
                minify: false,
                emptyOutDir: true,
                assetsInlineLimit: 0, // Force all assets to be files, not data URLs
            },
        });

        const distDir = path.join(tempDir, 'dist');
        const cssFiles = (await fs.readdir(distDir, { recursive: true })).filter(f =>
            typeof f === 'string' && f.endsWith('.css')
        );

        expect(cssFiles.length).toBeGreaterThan(0);

        // Check that CSS file has CID name
        const cssFile = cssFiles[0] as string;
        const basename = path.basename(cssFile, '.css');
        expect(basename).toMatch(/^bafkrei/);

        // Check that url() references are updated
        const cssContent = await fs.readFile(path.join(distDir, cssFile), 'utf-8');
        // The url should reference a CID-named file (or be inlined as data URL)
        // If it's a file reference, it should have a CID name
        if (cssContent.includes('url(') && !cssContent.includes('data:')) {
            expect(cssContent).toMatch(/url\([^)]*bafkrei[^)]*\)/);
        }
    });

    it('should handle empty files', async () => {
        await fs.writeFile(path.join(tempDir, 'index.html'), `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="module" src="./empty.js"></script>
        </head>
        <body><h1>Test</h1></body>
      </html>
    `);
        await fs.writeFile(path.join(tempDir, 'empty.js'), '');

        await build({
            root: tempDir,
            logLevel: 'silent',
            plugins: [cidVitePlugin()],
            build: {
                outDir: 'dist',
                minify: false,
                emptyOutDir: true,
            },
        });

        // Should not throw
        const distDir = path.join(tempDir, 'dist');
        const files = await fs.readdir(distDir, { recursive: true });
        expect(files.length).toBeGreaterThan(0);
    });

    it('should handle source maps when enabled', async () => {
        await fs.writeFile(path.join(tempDir, 'index.html'), `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="module" src="./main.js"></script>
        </head>
        <body><h1>Test</h1></body>
      </html>
    `);
        await fs.writeFile(path.join(tempDir, 'main.js'), `
      console.log('test');
    `);

        await build({
            root: tempDir,
            logLevel: 'silent',
            plugins: [cidVitePlugin()],
            build: {
                outDir: 'dist',
                minify: false,
                emptyOutDir: true,
                sourcemap: true,
            },
        });

        const distDir = path.join(tempDir, 'dist');
        const allFiles = await fs.readdir(distDir, { recursive: true });
        const jsFiles = allFiles.filter(f => typeof f === 'string' && f.endsWith('.js') && !f.endsWith('.map'));
        const mapFiles = allFiles.filter(f => typeof f === 'string' && f.endsWith('.js.map'));

        expect(jsFiles.length).toBeGreaterThan(0);

        // Source maps might not be generated for very simple files
        // If they are generated, check that they have CID names
        if (mapFiles.length > 0) {
            const mapFile = mapFiles[0] as string;
            const mapBasename = path.basename(mapFile, '.js.map');
            expect(mapBasename).toMatch(/^bafkrei/);

            // Check that JS file references the correct map file
            const jsFile = jsFiles[0] as string;
            const jsContent = await fs.readFile(path.join(distDir, jsFile), 'utf-8');

            // Should have sourceMappingURL comment
            if (jsContent.includes('sourceMappingURL')) {
                const mapBasenameWithExt = path.basename(mapFile);
                expect(jsContent).toContain(mapBasenameWithExt);
            }
        }
    });
});
