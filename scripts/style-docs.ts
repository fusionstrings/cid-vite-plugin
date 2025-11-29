#!/usr/bin/env -S deno run --allow-read --allow-write

import { join } from "@std/path";

const docsDir = "./docs";

// Award-winning custom HTML/CSS to inject - inspired by Awwwards/Godly designs
const customHeader = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #646cff;
    --primary-dark: #535bf2;
    --accent: #ff6b6b;
    --accent-alt: #4ecdc4;
    --text: #1a1a1a;
    --text-light: #666;
    --text-lighter: #999;
    --bg: #ffffff;
    --bg-dark: #0a0a0a;
    --bg-elevated: #f8f8f8;
    --border: #e0e0e0;
    --code-bg: #1e1e1e;
    --code-text: #d4d4d4;
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.08);
    --shadow-lg: 0 24px 48px rgba(0,0,0,0.12);
    --gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-accent: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

body {
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
    line-height: 1.7 !important;
    color: var(--text) !important;
    background: var(--bg) !important;
    position: relative;
    overflow-x: hidden;
}

/* Animated gradient background */
body::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: 
        radial-gradient(circle at 20% 50%, rgba(100, 108, 255, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(78, 205, 196, 0.05) 0%, transparent 50%);
    z-index: -1;
    animation: gradient-shift 20s ease infinite;
}

@keyframes gradient-shift {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-10%, -10%) rotate(5deg); }
}

/* Hero Header */
.hero-header {
    position: relative;
    background: var(--gradient-hero);
    padding: 8rem 2rem 6rem;
    text-align: center;
    overflow: hidden;
    margin-bottom: 4rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.hero-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%);
    animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
}

.hero-content {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
}

.hero-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 50px;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2rem;
    animation: fade-in-up 0.6s ease;
}

.hero-title {
    font-size: clamp(3rem, 8vw, 6rem) !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: -0.03em !important;
    color: white !important;
    margin-bottom: 1.5rem !important;
    line-height: 1.1 !important;
    animation: fade-in-up 0.8s ease 0.1s both;
}

.hero-subtitle {
    font-size: clamp(1.125rem, 2vw, 1.5rem);
    color: rgba(255,255,255,0.9);
    font-weight: 300;
    margin-bottom: 2.5rem;
    animation: fade-in-up 1s ease 0.2s both;
}

.hero-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: white;
    color: var(--primary-dark);
    text-decoration: none;
    font-weight: 600;
    font-size: 1.125rem;
    border-radius: 50px;
    box-shadow: var(--shadow-lg);
    transition: all 0.3s ease;
    animation: fade-in-up 1.2s ease 0.3s both;
}

.hero-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 32px 64px rgba(0,0,0,0.16);
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Navigation - sticky modern design */
nav {
    position: sticky !important;
    top: 0 !important;
    z-index: 1000 !important;
    background: rgba(255, 255, 255, 0.8) !important;
    backdrop-filter: blur(20px) !important;
    border-bottom: 1px solid var(--border) !important;
    padding: 1rem 2rem !important;
    transition: all 0.3s ease !important;
}

nav.scrolled {
    box-shadow: var(--shadow-md);
}

/* Main content container */
main {
    max-width: 1400px !important;
    margin: 0 auto !important;
    padding: 4rem 2rem !important;
    position: relative;
}

/* Section styling */
.section-wrapper {
    margin: 6rem 0;
    scroll-margin-top: 100px;
}

/* Typography hierarchy */
h1, h2, h3, h4, h5, h6 {
    font-family: 'Space Grotesk', sans-serif !important;
    font-weight: 700 !important;
    letter-spacing: -0.02em !important;
    margin-top: 3rem !important;
    margin-bottom: 1.5rem !important;
    color: var(--text) !important;
    position: relative;
}

h1 {
    font-size: clamp(2.5rem, 5vw, 4rem) !important;
    text-transform: uppercase !important;
    background: var(--gradient-hero);
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
    margin-bottom: 2rem !important;
}

h1::after {
    content: '';
    display: block;
    width: 100px;
    height: 5px;
    background: var(--gradient-accent);
    margin-top: 1rem;
    border-radius: 3px;
}

h2 {
    font-size: clamp(2rem, 4vw, 3rem) !important;
    border-bottom: 3px solid var(--primary) !important;
    padding-bottom: 1rem !important;
    margin-top: 4rem !important;
}

h3 {
    font-size: clamp(1.5rem, 3vw, 2rem) !important;
    color: var(--primary) !important;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

h3::before {
    content: '▸';
    color: var(--accent);
    font-weight: 400;
}

/* Code blocks - premium styling */
pre {
    background: var(--code-bg) !important;
    color: var(--code-text) !important;
    padding: 2rem !important;
    border-radius: 16px !important;
    overflow-x: auto !important;
    margin: 2rem 0 !important;
    border: 1px solid rgba(100, 108, 255, 0.2) !important;
    box-shadow: var(--shadow-md) !important;
    position: relative;
    font-size: 0.95rem !important;
    line-height: 1.6 !important;
}

pre::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
    border-radius: 16px 16px 0 0;
}

code {
    font-family: 'JetBrains Mono', 'Monaco', 'Menlo', monospace !important;
    font-size: 0.95em !important;
    font-weight: 500 !important;
}

:not(pre) > code {
    background: var(--bg-elevated) !important;
    padding: 0.25rem 0.6rem !important;
    border-radius: 6px !important;
    color: var(--primary) !important;
    font-size: 0.9em !important;
    border: 1px solid var(--border) !important;
    font-weight: 500 !important;
}

/* Links - smooth interactions */
a {
    color: var(--primary) !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
    position: relative;
    font-weight: 500;
}

a:hover {
    color: var(--primary-dark) !important;
}

a:not(.hero-cta)::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--gradient-accent);
    transition: width 0.3s ease;
}

a:not(.hero-cta):hover::after {
    width: 100%;
}

/* Lists - enhanced spacing */
ul, ol {
    margin: 1.5rem 0 !important;
    padding-left: 2rem !important;
}

li {
    margin: 1rem 0 !important;
    color: var(--text-light) !important;
    line-height: 1.8 !important;
}

li::marker {
    color: var(--primary);
    font-weight: 600;
}

/* Paragraphs */
p {
    margin: 1.5rem 0 !important;
    line-height: 1.8 !important;
    color: var(--text-light) !important;
    font-size: 1.0625rem !important;
}

/* Tables - modern card-like design */
table {
    width: 100% !important;
    border-collapse: separate !important;
    border-spacing: 0 !important;
    margin: 2rem 0 !important;
    background: white !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    box-shadow: var(--shadow-sm) !important;
}

th, td {
    padding: 1.25rem !important;
    text-align: left !important;
    border-bottom: 1px solid var(--border) !important;
}

th {
    background: var(--bg-elevated) !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    font-size: 0.8125rem !important;
    letter-spacing: 0.05em !important;
    color: var(--text) !important;
}

tr:last-child td {
    border-bottom: none !important;
}

tr:hover td {
    background: var(--bg-elevated);
}

/* Feature cards grid */
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    margin: 3rem 0;
}

.feature-card {
    padding: 2.5rem;
    background: white;
    border-radius: 20px;
    border: 1px solid var(--border);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradient-accent);
    transform: translateX(-100%);
    transition: transform 0.4s ease;
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary);
}

.feature-card:hover::before {
    transform: translateX(0);
}

/* Badges and pills */
.badge {
    display: inline-block !important;
    padding: 0.4rem 1rem !important;
    background: var(--gradient-accent) !important;
    color: white !important;
    border-radius: 50px !important;
    font-size: 0.8125rem !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    margin-right: 0.75rem !important;
    box-shadow: var(--shadow-sm) !important;
}

/* Callouts / Info boxes */
.callout {
    padding: 2rem;
    background: var(--bg-elevated);
    border-left: 4px solid var(--primary);
    border-radius: 12px;
    margin: 2rem 0;
    box-shadow: var(--shadow-sm);
}

.callout-warning {
    border-left-color: var(--accent);
    background: rgba(255, 107, 107, 0.05);
}

.callout-success {
    border-left-color: var(--accent-alt);
    background: rgba(78, 205, 196, 0.05);
}

/* Footer */
footer {
    background: var(--bg-dark) !important;
    color: rgba(255,255,255,0.8) !important;
    padding: 4rem 2rem !important;
    text-align: center !important;
    margin-top: 8rem !important;
    position: relative;
}

footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--primary), transparent);
}

footer a {
    color: white !important;
    font-weight: 600;
}

footer a:hover {
    color: var(--accent-alt) !important;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
}

/* Scroll progress indicator */
.scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: var(--gradient-accent);
    transform-origin: left;
    z-index: 9999;
    transition: transform 0.1s ease;
}

/* Responsive design */
@media (max-width: 768px) {
    .hero-header {
        padding: 4rem 1.5rem 3rem;
    }
    
    main {
        padding: 2rem 1.5rem !important;
    }
    
    .section-wrapper {
        margin: 4rem 0;
    }
    
    pre {
        padding: 1.5rem !important;
        font-size: 0.875rem !important;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
}

/* Print styles */
@media print {
    .hero-header, footer, nav {
        display: none;
    }
    
    body {
        background: white;
    }
    
    main {
        max-width: 100%;
    }
}

/* Smooth scroll animations */
@media (prefers-reduced-motion: no-preference) {
    [data-animate] {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    [data-animate].visible {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Selection styling */
::selection {
    background: var(--primary);
    color: white;
}

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: var(--bg-elevated);
}

::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--primary-dark);
}
</style>

<!-- Hero Header -->
<div class="hero-header">
    <div class="hero-content">
        <div class="hero-badge">⚡ Deno & JSR Ready</div>
        <h1 class="hero-title">CID Vite Plugin</h1>
        <p class="hero-subtitle">Content-Addressed Builds for the Decentralized Web</p>
        <a href="#installation" class="hero-cta">
            <span>Get Started</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </a>
    </div>
</div>

<!-- Scroll Progress Indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<script>
// Scroll progress indicator
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('scrollProgress').style.transform = \`scaleX(\${scrolled / 100})\`;
});

// Sticky nav shadow on scroll
const nav = document.querySelector('nav');
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Intersection Observer for animations
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
</script>
`;

const customFooter = `
<!-- Premium Footer -->
<footer>
    <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">Built with ❤️ for the Decentralized Web</p>
    <p style="opacity: 0.7; margin-bottom: 1rem;">by <a href="https://github.com/fusionstrings" target="_blank" rel="noopener noreferrer">@fusionstrings</a></p>
    <div class="footer-links">
        <a href="https://github.com/fusionstrings/cid-vite-plugin" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" style="vertical-align: middle; margin-right: 0.5rem;" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.165 20 14.418 20 10c0-5.523-4.477-10-10-10z" clip-rule="evenodd"/>
            </svg>
            GitHub
        </a>
        <a href="https://jsr.io/@fusionstrings/cid-vite-plugin" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" style="vertical-align: middle; margin-right: 0.5rem;" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2L3 6v8l7 4 7-4V6l-7-4zm0 2.5L15 7v6l-5 2.857V9.5l-5-2.5 5-2.5z"/>
            </svg>
            JSR
        </a>
        <a href="https://ipfs.io" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" style="vertical-align: middle; margin-right: 0.5rem;" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M10 2v16M2 10h16M6 4.5l8 11M14 4.5l-8 11"/>
            </svg>
            IPFS
        </a>
    </div>
    <p style="margin-top: 2rem; font-size: 0.875rem; opacity: 0.6;">
        MIT Licensed | Version 0.0.1 | Made for Decentralized Applications
    </p>
</footer>
`;

async function processHtmlFile(filePath: string) {
  let content = await Deno.readTextFile(filePath);
  
  // Inject header after <body> tag
  if (content.includes("<body>")) {
    content = content.replace("<body>", `<body>\n${customHeader}\n`);
  }
  
  // Inject footer before </body> tag
  if (content.includes("</body>")) {
    content = content.replace("</body>", `\n${customFooter}\n</body>`);
  }
  
  await Deno.writeTextFile(filePath, content);
  console.log(`✓ Styled: ${filePath}`);
}

async function walkDirectory(dir: string) {
  for await (const entry of Deno.readDir(dir)) {
    const path = join(dir, entry.name);
    
    if (entry.isDirectory) {
      await walkDirectory(path);
    } else if (entry.isFile && entry.name.endsWith(".html")) {
      await processHtmlFile(path);
    }
  }
}

// Process all HTML files in docs directory
await walkDirectory(docsDir);
console.log("\n✨ Award-winning documentation styling complete!");
console.log("🎨 Design inspired by Awwwards & Godly");
console.log("🚀 Ready to showcase your content-addressed builds!");
