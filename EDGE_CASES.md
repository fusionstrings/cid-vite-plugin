# Edge Cases Handled

## ✅ Implemented and Tested

1. **Source Maps**
   - `.map` files are renamed to their CIDs
   - `sourceMappingURL` comments in JS/CSS files are updated to reference the new CID-based map filenames
   - Tested in `edge-cases.test.ts`

2. **Manifest Files**
   - `manifest.json` and `ssr-manifest.json` are updated with CID filenames
   - Uses `writeBundle` hook to update after Vite's manifest plugin runs
   - Tested in playground with `manifest: true`

3. **CID Collisions**
   - Files with identical content correctly get the same CID
   - Vite's bundling may combine them anyway
   - Tested in `edge-cases.test.ts`

4. **Empty Files**
   - Empty files are handled correctly
   - Tested in `edge-cases.test.ts`

5. **Binary Assets**
   - Images, fonts, etc. processed as `Uint8Array`
   - Works with the existing implementation

6. **CSS url() References**
   - Updated when assets are output as files (not inlined as data URLs)
   - Vite inlines small assets by default, which is correct behavior
   - Can be controlled with `build.assetsInlineLimit`

7. **Circular Dependencies**
   - Handled with cycle detection in topological sort
   - Prevents infinite loops

8. **HTML Entry Point Handling**
   - All `.html` files are explicitly NOT renamed to a CID
   - This ensures compatibility with standard web servers, `vite preview`, and MPA setups
   - References *within* HTML files are still updated to point to CID-named assets

## 📝 Known Limitations

1. **Dynamic Imports with Variables**
   - Dynamic imports like `import(\`./\${variable}.js\`)` cannot be statically analyzed
   - These will not have their references updated
   - This is a fundamental limitation of static analysis

2. **CSS @import Statements**
   - Currently handled by basename replacement
   - Should work for most cases

3. **Web Workers / Service Workers**
   - Should work as they're processed like regular chunks
   - Not explicitly tested

## 🔧 Configuration Options

Users can control behavior with Vite config:
- `build.assetsInlineLimit`: Control when assets are inlined vs. output as files
- `build.sourcemap`: Enable/disable source map generation
- `build.manifest`: Enable/disable manifest generation
