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

            // Separate manifest files from regular files
            const manifestFiles: string[] = [];
            const regularFiles: string[] = [];

            for (const fileName of sorted) {
                if (fileName.endsWith('.json') && (fileName.includes('manifest') || fileName.includes('.vite'))) {
                    manifestFiles.push(fileName);
                } else {
                    regularFiles.push(fileName);
                }
            }

            // PASS 1: Process regular files (non-manifest)
            for (const fileName of regularFiles) {
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

                    for (const [oldName, newName] of fileMap) {
                        const oldBase = path.basename(oldName);
                        const newBase = path.basename(newName);
                        const escapedOldBase = oldBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(escapedOldBase, 'g');
                        code = code.replace(regex, newBase);
                    }

                    // Handle source map references
                    if (item.map) {
                        // Update sourceMappingURL comment
                        const mapFileName = `${fileName}.map`;
                        if (bundle[mapFileName]) {
                            const oldMapBase = path.basename(mapFileName);
                            // The new map filename will be determined after we process it
                            // For now, just note that we need to update this later
                        }
                    }

                    item.code = code;
                    content = code;
                }

                // Generate CID
                const cid = await generateCID(content);

                // Construct new filename
                // Skip renaming HTML files so they can be served by web servers/vite preview
                // This supports MPA (Multi-Page App) setups where entry points must be preserved
                if (fileName.endsWith('.html')) {
                    continue;
                }

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

            // PASS 1.5: Update sourceMappingURL comments now that we know all the new filenames
            for (const [oldName, newName] of fileMap) {
                if (oldName.endsWith('.map')) {
                    // This is a source map file, find the corresponding JS/CSS file
                    const sourceFile = oldName.replace(/\.map$/, '');
                    const newSourceFile = fileMap.get(sourceFile);

                    if (newSourceFile && bundle[newSourceFile]) {
                        const item = bundle[newSourceFile];
                        if (item.type === 'chunk') {
                            // Update sourceMappingURL comment
                            const oldMapBase = path.basename(oldName);
                            const newMapBase = path.basename(newName);
                            const escapedOldMapBase = oldMapBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(escapedOldMapBase, 'g');
                            item.code = item.code.replace(regex, newMapBase);
                        }
                    }
                }
            }

            // PASS 2: Process manifest files with updated fileMap
            for (const fileName of manifestFiles) {
                const item = bundle[fileName];
                if (item.type !== 'asset') continue;

                let content = item.source;
                if (typeof content !== 'string') continue;

                // Update JSON manifest files
                try {
                    const manifest = JSON.parse(content);
                    // Update file references in the manifest
                    for (const [oldName, newName] of fileMap) {
                        // Escape for regex
                        const escapedOldName = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(escapedOldName, 'g');

                        // Convert manifest to string, replace full paths, and parse back
                        const manifestStr = JSON.stringify(manifest);
                        const updatedStr = manifestStr.replace(regex, newName);
                        Object.assign(manifest, JSON.parse(updatedStr));
                    }
                    content = JSON.stringify(manifest, null, 2);
                } catch (e) {
                    // If JSON parsing fails, fall back to string replacement
                    for (const [oldName, newName] of fileMap) {
                        const escapedOldName = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(escapedOldName, 'g');
                        content = content.replace(regex, newName);
                    }
                }

                item.source = content;

                // Generate CID for manifest file
                const cid = await generateCID(content);
                const ext = path.extname(fileName);
                const dir = path.dirname(fileName);
                const newFileName = path.join(dir, `${cid}${ext}`);

                if (newFileName !== fileName) {
                    item.fileName = newFileName;
                    delete bundle[fileName];
                    bundle[newFileName] = item;
                    fileMap.set(fileName, newFileName);
                }
            }
        },

        // Update manifest files after they're written
        async writeBundle(options, bundle) {
            const fs = await import('node:fs/promises');
            const outDir = options.dir || 'dist';

            // Find and update manifest files
            for (const fileName of Object.keys(bundle)) {
                if (!fileName.endsWith('.json')) continue;
                if (!(fileName.includes('manifest') || fileName.includes('.vite'))) continue;

                const filePath = path.join(outDir, fileName);

                try {
                    // Read the manifest file
                    const content = await fs.readFile(filePath, 'utf-8');
                    const manifest = JSON.parse(content);
                    let updated = false;

                    // Find all CID-named files and update references
                    for (const bundleFileName of Object.keys(bundle)) {
                        const basename = path.basename(bundleFileName, path.extname(bundleFileName));
                        if (basename.startsWith('bafkrei')) {
                            // This is a CID-named file
                            const dir = path.dirname(bundleFileName);
                            const ext = path.extname(bundleFileName);

                            // Look for old-style Vite hashed filenames in manifest
                            const manifestStr = JSON.stringify(manifest);
                            const pattern = new RegExp(`"(${dir}/[^"]+${ext.replace('.', '\\.')})"`, 'g');
                            const matches = manifestStr.match(pattern);

                            if (matches) {
                                for (const match of matches) {
                                    const oldPath = match.slice(1, -1);
                                    // If this path doesn't exist in bundle, it was renamed
                                    if (!bundle[oldPath] && oldPath !== bundleFileName) {
                                        const escapedOldPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                        const regex = new RegExp(escapedOldPath, 'g');
                                        const updatedStr = JSON.stringify(manifest).replace(regex, bundleFileName);
                                        Object.assign(manifest, JSON.parse(updatedStr));
                                        updated = true;
                                    }
                                }
                            }
                        }
                    }

                    if (updated) {
                        await fs.writeFile(filePath, JSON.stringify(manifest, null, 2));
                    }
                } catch (e) {
                    // Ignore errors
                }
            }
        }
    };
}
