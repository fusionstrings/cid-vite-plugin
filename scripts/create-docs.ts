#!/usr/bin/env -S deno run --allow-read --allow-write

import { join } from "@std/path";

const docsDir = "./docs";

// Comprehensive documentation site
const documentationContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CID Vite Plugin - Content-Addressed Builds for Web3</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            --primary: #5B8FF9;
            --primary-dark: #3D6AC4;
            --accent: #F6BD16;
            --accent-pink: #FF6B9D;
            --accent-teal: #00D9C0;
            --text: #0F1419;
            --text-muted: #536471;
            --bg: #FFFFFF;
            --bg-alt: #F7F9FC;
            --border: #E8ECEF;
            --code-bg: #1E1E1E;
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
            --shadow-lg: 0 20px 40px rgba(0,0,0,0.12);
            --radius-lg: 20px;
        }

        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Inter', -apple-system, system-ui, sans-serif; font-size: 17px; line-height: 1.7; color: var(--text); background: var(--bg); }

        .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); padding: 4rem 2rem; overflow: hidden; }
        .hero::before { content: ''; position: absolute; width: 200%; height: 200%; background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.1) 0%, transparent 50%); animation: float 20s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(-5%, -5%) rotate(5deg); } }
        
        .hero-content { position: relative; z-index: 1; max-width: 1000px; text-align: center; color: white; }
        .hero-badge { display: inline-block; padding: 0.5rem 1.25rem; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); border-radius: 50px; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2rem; animation: fadeInUp 0.6s ease; }
        .hero h1 { font-size: clamp(3rem, 10vw, 7rem); font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.03em; animation: fadeInUp 0.8s ease 0.1s both; }
        .hero p { font-size: clamp(1.25rem, 3vw, 1.75rem); font-weight: 300; line-height: 1.6; margin-bottom: 3rem; opacity: 0.95; animation: fadeInUp 1s ease 0.2s both; }
        .hero-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; animation: fadeInUp 1.2s ease 0.3s both; }
        
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 1rem 2rem; font-size: 1.125rem; font-weight: 600; text-decoration: none; border-radius: 50px; transition: all 0.3s ease; }
        .btn-primary { background: white; color: var(--primary-dark); box-shadow: var(--shadow-lg); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 24px 48px rgba(0,0,0,0.2); }
        .btn-secondary { background: rgba(255,255,255,0.15); color: white; border: 2px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px); }
        .btn-secondary:hover { background: rgba(255,255,255,0.25); }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        nav { position: sticky; top: 0; z-index: 1000; background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 1rem 0; }
        .nav-container { max-width: 1400px; margin: 0 auto; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { font-size: 1.25rem; font-weight: 800; color: var(--primary); text-decoration: none; }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { color: var(--text); text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: var(--primary); }

        .container { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
        section { padding: 8rem 0; }
        section:nth-child(even) { background: var(--bg-alt); }
        
        .section-header { max-width: 800px; margin: 0 auto 4rem; text-align: center; }
        .section-badge { display: inline-block; padding: 0.5rem 1rem; background: var(--primary); color: white; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 50px; margin-bottom: 1rem; }
        h2 { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; line-height: 1.2; margin-bottom: 1.5rem; letter-spacing: -0.02em; }
        .section-header p { font-size: 1.25rem; color: var(--text-muted); line-height: 1.7; }

        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; margin-top: 4rem; }
        .feature-card { padding: 3rem; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-lg); transition: all 0.3s ease; }
        .feature-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); border-color: var(--primary); }
        .feature-icon { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 2rem; background: linear-gradient(135deg, var(--primary), var(--accent-teal)); border-radius: 12px; margin-bottom: 1.5rem; }
        .feature-card h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
        .feature-card p { color: var(--text-muted); line-height: 1.7; }

        .code-example { background: var(--code-bg); border-radius: var(--radius-lg); padding: 2rem; margin: 2rem 0; overflow-x: auto; box-shadow: var(--shadow-md); }
        .code-example pre { margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; line-height: 1.6; color: #D4D4D4; }
        code { font-family: 'JetBrains Mono', monospace; background: var(--bg-alt); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.9em; color: var(--primary); }

        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin: 4rem 0; }
        .stat { text-align: center; }
        .stat-number { font-size: 4rem; font-weight: 900; background: linear-gradient(135deg, var(--primary), var(--accent-pink)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; margin-bottom: 0.5rem; }
        .stat-label { font-size: 1.125rem; color: var(--text-muted); font-weight: 500; }

        .comparison-table { width: 100%; margin: 3rem 0; border-collapse: separate; border-spacing: 0; background: var(--bg); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }
        .comparison-table th, .comparison-table td { padding: 1.5rem; text-align: left; border-bottom: 1px solid var(--border); }
        .comparison-table th { background: var(--bg-alt); font-weight: 700; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
        .comparison-table tbody tr:hover { background: var(--bg-alt); }
        .comparison-table tbody tr:last-child td { border-bottom: none; }
        .check { color: var(--accent-teal); font-weight: 700; }
        .cross { color: var(--text-muted); }

        .steps { display: grid; gap: 3rem; margin: 4rem 0; }
        .step { display: grid; grid-template-columns: 80px 1fr; gap: 2rem; align-items: start; }
        .step-number { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; background: linear-gradient(135deg, var(--primary), var(--accent-teal)); color: white; border-radius: 50%; flex-shrink: 0; }
        .step-content h3 { font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; }
        .step-content p { color: var(--text-muted); line-height: 1.8; margin-bottom: 1rem; }

        .cta-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 8rem 2rem; }
        .cta-section h2 { color: white; margin-bottom: 1.5rem; }
        .cta-section p { font-size: 1.25rem; opacity: 0.95; margin-bottom: 3rem; }

        footer { background: var(--code-bg); color: #A0A0A0; padding: 4rem 2rem 2rem; }
        .footer-content { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin-bottom: 3rem; }
        .footer-section h4 { color: white; font-weight: 700; margin-bottom: 1rem; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
        .footer-links a { color: #A0A0A0; text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: white; }
        .footer-bottom { max-width: 1400px; margin: 0 auto; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; }

        @media (max-width: 768px) {
            .hero { min-height: 80vh; padding: 3rem 1.5rem; }
            section { padding: 4rem 0; }
            .nav-links { display: none; }
            .step { grid-template-columns: 60px 1fr; gap: 1.5rem; }
            .step-number { width: 60px; height: 60px; font-size: 1.5rem; }
            .features-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="hero">
        <div class="hero-content">
            <div class="hero-badge">⚡ Built for Web3 & IPFS</div>
            <h1>CID Vite Plugin</h1>
            <p>Transform your Vite builds into content-addressed, immutable artifacts ready for the decentralized web. Every file gets a cryptographic CID filename.</p>
            <div class="hero-buttons">
                <a href="#installation" class="btn btn-primary">Get Started →</a>
                <a href="./html/index.html" class="btn btn-secondary">API Reference</a>
            </div>
        </div>
    </div>

    <nav>
        <div class="nav-container">
            <a href="#" class="nav-logo">CID Vite Plugin</a>
            <ul class="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#installation">Installation</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#comparison">Comparison</a></li>
                <li><a href="./html/index.html">API Docs</a></li>
            </ul>
        </div>
    </nav>

    <section>
        <div class="container">
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">100%</div>
                    <div class="stat-label">IPFS Compatible</div>
                </div>
                <div class="stat">
                    <div class="stat-number">0KB</div>
                    <div class="stat-label">Runtime Overhead</div>
                </div>
                <div class="stat">
                    <div class="stat-number">∞</div>
                    <div class="stat-label">Cache Duration</div>
                </div>
                <div class="stat">
                    <div class="stat-number">SHA-256</div>
                    <div class="stat-label">Cryptographic Hash</div>
                </div>
            </div>
        </div>
    </section>

    <section id="features">
        <div class="container">
            <div class="section-header">
                <div class="section-badge">Why CID Plugin?</div>
                <h2>Built for the Decentralized Future</h2>
                <p>Content addressing is the foundation of Web3. Our plugin seamlessly integrates CID-based naming into your Vite workflow.</p>
            </div>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>True Immutability</h3>
                    <p>Files are named by their SHA-256 hash, ensuring content can never change without changing the filename. Perfect for blockchain and distributed storage.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>Zero Configuration</h3>
                    <p>Works out of the box with Vite. Just add the plugin and build. All assets get CID names automatically with references updated.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🌐</div>
                    <h3>IPFS Native</h3>
                    <p>Generated CIDs are 100% compatible with IPFS. Deploy directly to the InterPlanetary File System or Filecoin for permanent storage.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🔄</div>
                    <h3>Smart Updates</h3>
                    <p>Automatically updates all references in JS, CSS, HTML, and manifest files. Handles imports, dynamic imports, and CSS url() functions.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">📦</div>
                    <h3>Code Splitting</h3>
                    <p>Works seamlessly with Vite's code splitting. Each chunk gets its own CID, and lazy loading continues to work perfectly.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🗂️</div>
                    <h3>MPA Support</h3>
                    <p>Preserves HTML entry points for Multi-Page Applications while renaming all linked assets with CID-based filenames.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="installation">
        <div class="container">
            <div class="section-header">
                <div class="section-badge">Get Started</div>
                <h2>Installation & Setup</h2>
                <p>Get up and running in under 2 minutes with JSR package manager support.</p>
            </div>

            <div class="code-example">
                <pre><code><span style="color:#569CD6">// Install from JSR</span>
<span style="color:#4EC9B0">deno</span> add jsr:@fusionstrings/cid-vite-plugin

<span style="color:#569CD6">// Configure in vite.config.ts</span>
<span style="color:#C586C0">import</span> { defineConfig } <span style="color:#C586C0">from</span> <span style="color:#CE9178">'vite'</span>;
<span style="color:#C586C0">import</span> { cidVitePlugin } <span style="color:#C586C0">from</span> <span style="color:#CE9178">'@fusionstrings/cid-vite-plugin'</span>;

<span style="color:#C586C0">export default</span> <span style="color:#DCDCAA">defineConfig</span>({
  plugins: [<span style="color:#DCDCAA">cidVitePlugin</span>()],
});

<span style="color:#569CD6">// Build your project</span>
<span style="color:#4EC9B0">vite</span> build</code></pre>
            </div>

            <p style="text-align: center; margin-top: 2rem; font-size: 1.125rem; color: var(--text-muted);">
                That's it! All your build outputs will now use CID-based filenames.
            </p>
        </div>
    </section>

    <section id="how-it-works">
        <div class="container">
            <div class="section-header">
                <div class="section-badge">Under The Hood</div>
                <h2>How It Works</h2>
                <p>The plugin integrates with Vite's build pipeline to rename all assets with content-addressed identifiers.</p>
            </div>

            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Build Graph Analysis</h3>
                        <p>The plugin analyzes Rollup's output bundle to understand dependencies between files. It extracts imports, dynamic imports, and asset references to build a complete dependency graph.</p>
                        <div class="code-example">
                            <pre><code><span style="color:#569CD6">// Example dependency graph</span>
app.js → chunk-vendor.js
app.js → styles.css → image.png
index.html → app.js</code></pre>
                        </div>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Topological Sorting</h3>
                        <p>Files are processed in dependency order using depth-first search. Dependencies are renamed before their consumers, ensuring all references remain valid throughout the process.</p>
                        <div class="code-example">
                            <pre><code><span style="color:#569CD6">// Processing order</span>
<span style="color:#4EC9B0">1.</span> image.png     → bafkreiabc...png
<span style="color:#4EC9B0">2.</span> styles.css    → bafkreidef...css
<span style="color:#4EC9B0">3.</span> chunk-vendor  → bafkreighi...js
<span style="color:#4EC9B0">4.</span> app.js        → bafkreijkl...js</code></pre>
                        </div>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>CID Generation</h3>
                        <p>Each file's content is hashed using SHA-256 and encoded as a CIDv1 with base32 encoding. This produces the familiar "bafkrei..." format that's IPFS-compatible.</p>
                        <div class="code-example">
                            <pre><code><span style="color:#569CD6">// CID structure</span>
bafkreievmj4srvi27bv4qogei7yqihtcumxrmacteezcl4besq6strr44u
│││││││└─────────────────────────────────────────────────┘
││││││└─ Base32-encoded SHA-256 hash
│││││└── Raw codec (0x55)
││││└─── CIDv1</code></pre>
                        </div>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h3>Reference Updates</h3>
                        <p>All references to renamed files are updated across the bundle. This includes ES imports, dynamic imports, CSS url() functions, HTML script/link tags, and JSON manifests.</p>
                        <div class="code-example">
                            <pre><code><span style="color:#569CD6">// Before</span>
<span style="color:#C586C0">import</span> <span style="color:#CE9178">'./styles.css'</span>;
background: <span style="color:#DCDCAA">url</span>(<span style="color:#CE9178">'./image.png'</span>);

<span style="color:#569CD6">// After</span>
<span style="color:#C586C0">import</span> <span style="color:#CE9178">'./bafkreidef...css'</span>;
background: <span style="color:#DCDCAA">url</span>(<span style="color:#CE9178">'./bafkreiabc...png'</span>);</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="comparison">
        <div class="container">
            <div class="section-header">
                <div class="section-badge">Why Choose CID?</div>
                <h2>CID vs Traditional Hashing</h2>
                <p>See how content-addressed builds compare to standard Vite output.</p>
            </div>

            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th>Standard Vite</th>
                        <th>CID Plugin</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Filename Format</strong></td>
                        <td><code>app-Ab3Xd9.js</code></td>
                        <td><code>bafkrei....js</code></td>
                    </tr>
                    <tr>
                        <td><strong>Hash Algorithm</strong></td>
                        <td>Internal (fast, non-standard)</td>
                        <td>SHA-256 (cryptographic)</td>
                    </tr>
                    <tr>
                        <td><strong>IPFS Compatible</strong></td>
                        <td><span class="cross">✗</span></td>
                        <td><span class="check">✓</span></td>
                    </tr>
                    <tr>
                        <td><strong>Content Verifiable</strong></td>
                        <td><span class="cross">✗</span></td>
                        <td><span class="check">✓</span></td>
                    </tr>
                    <tr>
                        <td><strong>Global Deduplication</strong></td>
                        <td><span class="cross">✗</span></td>
                        <td><span class="check">✓</span></td>
                    </tr>
                    <tr>
                        <td><strong>Immutability Guaranteed</strong></td>
                        <td>By convention</td>
                        <td>By cryptography</td>
                    </tr>
                    <tr>
                        <td><strong>Works with Web3 Storage</strong></td>
                        <td><span class="cross">✗</span></td>
                        <td><span class="check">✓</span></td>
                    </tr>
                    <tr>
                        <td><strong>Blockchain Integration</strong></td>
                        <td><span class="cross">✗</span></td>
                        <td><span class="check">✓</span></td>
                    </tr>
                </tbody>
            </table>

            <div class="code-example" style="margin-top: 3rem;">
                <pre><code><span style="color:#569CD6">// Deploy to IPFS after building</span>
<span style="color:#4EC9B0">ipfs</span> add -r dist/

<span style="color:#569CD6">// Access your site via:</span>
<span style="color:#CE9178">https://ipfs.io/ipfs/&lt;root-cid&gt;/</span>
<span style="color:#CE9178">https://&lt;root-cid&gt;.ipfs.dweb.link/</span>

<span style="color:#569CD6">// Pin to Filecoin for permanent storage</span>
<span style="color:#4EC9B0">lotus</span> client deal</code></pre>
            </div>
        </div>
    </section>

    <section>
        <div class="container">
            <div class="section-header">
                <div class="section-badge">Real World Applications</div>
                <h2>Perfect For</h2>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <h3>🌐 Decentralized Apps (dApps)</h3>
                    <p>Host your frontend on IPFS for true decentralization. No servers, no single point of failure. Works perfectly with Web3 wallets and blockchain integration.</p>
                </div>

                <div class="feature-card">
                    <h3>🎨 NFT Marketplaces</h3>
                    <p>Store NFT metadata and assets with verifiable content addressing. Buyers can cryptographically verify they're getting exactly what they paid for.</p>
                </div>

                <div class="feature-card">
                    <h3>📚 Digital Archives</h3>
                    <p>Preserve websites and applications permanently on Filecoin or Arweave. Content-addressed storage ensures data integrity across decades.</p>
                </div>

                <div class="feature-card">
                    <h3>🔐 High-Security Apps</h3>
                    <p>Guarantee asset integrity with cryptographic hashing. Perfect for financial applications, government portals, and sensitive data platforms.</p>
                </div>

                <div class="feature-card">
                    <h3>🚀 Edge Computing</h3>
                    <p>Distribute assets globally through IPFS nodes. Users fetch from the nearest/fastest peer, reducing latency and bandwidth costs.</p>
                </div>

                <div class="feature-card">
                    <h3>📦 Software Distribution</h3>
                    <p>Distribute software updates with built-in integrity verification. Recipients can verify downloads match the original without trusting the server.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="container">
            <h2>Ready to Build for Web3?</h2>
            <p>Join developers building the next generation of decentralized applications.</p>
            <div class="hero-buttons">
                <a href="#installation" class="btn btn-primary">Get Started Now</a>
                <a href="https://github.com/fusionstrings/cid-vite-plugin" class="btn btn-secondary">View on GitHub</a>
            </div>
        </div>
    </section>

    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h4>Documentation</h4>
                <ul class="footer-links">
                    <li><a href="#installation">Installation</a></li>
                    <li><a href="#how-it-works">How It Works</a></li>
                    <li><a href="./html/index.html">API Reference</a></li>
                    <li><a href="#comparison">Comparison</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>Resources</h4>
                <ul class="footer-links">
                    <li><a href="https://github.com/fusionstrings/cid-vite-plugin">GitHub</a></li>
                    <li><a href="https://jsr.io/@fusionstrings/cid-vite-plugin">JSR Package</a></li>
                    <li><a href="https://ipfs.io">IPFS</a></li>
                    <li><a href="https://vitejs.dev">Vite</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>Community</h4>
                <ul class="footer-links">
                    <li><a href="https://github.com/fusionstrings/cid-vite-plugin/issues">Issues</a></li>
                    <li><a href="https://github.com/fusionstrings/cid-vite-plugin/discussions">Discussions</a></li>
                    <li><a href="https://twitter.com/fusionstrings">Twitter</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>About</h4>
                <ul class="footer-links">
                    <li><a href="https://github.com/fusionstrings">@fusionstrings</a></li>
                    <li><a href="#">MIT License</a></li>
                    <li><a href="#">Version 0.0.1</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <p>Built with ❤️ for the Decentralized Web | © 2025 CID Vite Plugin</p>
        </div>
    </footer>
</body>
</html>
`;

// Create main documentation site
await Deno.mkdir(docsDir, { recursive: true });
await Deno.writeTextFile(join(docsDir, "index.html"), documentationContent);

console.log("\n✨ Comprehensive documentation site created!");
console.log("📄 Content includes:");
console.log("   ✓ Hero section with gradient animation");
console.log("   ✓ 4 key stats dashboard");
console.log("   ✓ 6 feature cards");
console.log("   ✓ Installation guide with code");
console.log("   ✓ 4-step 'How It Works' section");
console.log("   ✓ Comparison table (8 rows)");
console.log("   ✓ 6 use case examples");
console.log("   ✓ CTA section");
console.log("   ✓ Footer with 16 links");
console.log("🚀 Ready to showcase!");
