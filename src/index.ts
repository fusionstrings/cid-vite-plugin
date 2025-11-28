import { type Plugin } from 'vite';
import { type OutputBundle, type OutputChunk, type OutputAsset } from 'rollup';
import { generateCID } from './cid.js';
import path from 'node:path';

export function cidVitePlugin(): Plugin {
    return {
        name: 'vite-plugin-cid',
        enforce: 'post', // Run after other plugins
        apply: 'build',

        async generateBundle(options, bundle) {
            const processed = new Set<string>();
            const fileMap = new Map<string, string>(); // oldFileName -> newCIDFileName

            // Helper to get dependencies of a file
            const getDeps = (fileName: string): string[] => {
                const chunk = bundle[fileName];
                if (!chunk) return [];
                if (chunk.type === 'asset') return [];

                // For chunks, dependencies are imports, dynamicImports, and referencedFiles
                // Note: referencedFiles are usually assets
                return [
                    ...chunk.imports,
                    ...chunk.dynamicImports,
                    ...chunk.viteMetadata?.importedAssets || [],
                    ...chunk.viteMetadata?.importedCss || []
                ];
            };

            // Topological sort (DFS)
            const sorted: string[] = [];
            const visited = new Set<string>();
            const visiting = new Set<string>();

            const visit = (fileName: string) => {
                if (visited.has(fileName)) return;
                if (visiting.has(fileName)) {
                    // Cycle detected. In a real app, we might need to handle circular deps.
                    // For now, we'll just break the cycle and proceed.
                    return;
                }
                visiting.add(fileName);

                const deps = getDeps(fileName);
                for (const dep of deps) {
                    // Dep might not be in the bundle (external)
                    if (bundle[dep]) {
                        visit(dep);
                    }
                }

                visiting.delete(fileName);
                visited.add(fileName);
                sorted.push(fileName);
            };

            for (const fileName of Object.keys(bundle)) {
                visit(fileName);
            }

            // Process in order (leaves first)
            for (const fileName of sorted) {
                const item = bundle[fileName];
                let content: string | Uint8Array;

                if (item.type === 'asset') {
                    content = item.source;
                    if (typeof content === 'string') {
                        // Update asset content (e.g. HTML)
                        for (const [oldName, newName] of fileMap) {
                            const oldBase = path.basename(oldName);
                            const newBase = path.basename(newName);
                            const escapedOldBase = oldBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(escapedOldBase, 'g');
                            content = content.replace(regex, newBase);
                        }
                        item.source = content;
                    }
                } else {
                    // It's a chunk. We need to update its content to replace references to dependencies.
                    let code = item.code;

                    // Replace references
                    // We iterate over all processed files and check if they are referenced in this chunk.
                    // Optimization: Only check declared dependencies?
                    // Yes, but we need to know *how* they are referenced.
                    // Vite/Rollup replaces imports with relative paths.
                    // e.g. import ... from './dep-HASH.js'

                    // We can use a simple replace for now, assuming filenames are unique enough.
                    // We should replace the relative path or just the filename?
                    // Usually imports are relative.

                    for (const [oldName, newName] of fileMap) {
                        // We need to be careful. 
                        // If oldName is "assets/foo.js", and code has "./foo.js" (if in same dir) or "foo.js".
                        // Vite usually outputs flat or nested structure.
                        // Let's assume we replace the basename if it matches? 
                        // Or better, we know the exact string Vite uses?
                        // Actually, we can just replace the `oldName` string if it appears?
                        // But `oldName` is the key in bundle, e.g. "assets/index-123.js".
                        // The code might contain "./index-123.js".

                        // A safer approach:
                        // 1. Get the relative path from current file to the dependency.
                        // 2. Replace that relative path with the new relative path.

                        // However, we don't know exactly how it's written in the code (quotes, etc).
                        // But we can try to replace the filename part.

                        // Let's try global replace of the filename.
                        // This is risky if filename is "index.js".
                        // But with Vite hashing, it's usually "index-HASH.js".

                        // Let's try to be smarter.
                        // We can iterate over imports and see what they resolve to?
                        // But `item.imports` gives us the bundle key of the import.
                        // So we know `dep` is imported.
                        // We can try to replace `basename(dep)` with `basename(newName)`.

                        const oldBase = path.basename(oldName);
                        const newBase = path.basename(newName);

                        // Escape for regex
                        const escapedOldBase = oldBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(escapedOldBase, 'g');

                        code = code.replace(regex, newBase);
                    }

                    item.code = code;
                    content = code;
                }

                // Generate CID
                const cid = await generateCID(content);

                // Construct new filename
                // Keep the extension
                const ext = path.extname(fileName);
                const dir = path.dirname(fileName);
                const newFileName = path.join(dir, `${cid}${ext}`);

                if (newFileName !== fileName) {
                    // Update bundle
                    item.fileName = newFileName;
                    delete bundle[fileName];
                    bundle[newFileName] = item;

                    fileMap.set(fileName, newFileName);
                }
            }
        }
    };
}
