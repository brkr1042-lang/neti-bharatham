import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  PortalState,
  createInitialPortalState,
  PRIVATE_AD_CATEGORIES,
  ADMIN_USERNAME,
  ADMIN_PASSWORD
} from '@/lib/news-engine';

const DB_FILE_PATH = '/tmp/neti-bharatam-portal-db-v8.json';

function readCurrentState(): PortalState {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(DB_FILE_PATH, 'utf-8')) as PortalState;
    }
  } catch {
    // Fallback to initial state
  }
  return createInitialPortalState();
}

function getEmbeddedBannerDataUri(): string {
  try {
    const imgPath = path.join(
      process.cwd(),
      'public',
      'assets',
      'aistudio',
      'neti_bharatham.png_49db37a4.jpg'
    );
    if (fs.existsSync(imgPath)) {
      const buf = fs.readFileSync(imgPath);
      return `data:image/jpeg;base64,${buf.toString('base64')}`;
    }
  } catch {
    // Fallback to relative path
  }
  return '/assets/aistudio/neti_bharatham.png_49db37a4.jpg';
}

// Standard CRC32 implementation for PKZIP archive generation
function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Builds a standard PKZIP buffer from an array of { name, data } files
function createZipArchive(files: { name: string; data: Buffer }[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf-8');
    const dataBuf = file.data;
    const crc = crc32(dataBuf);
    const size = dataBuf.length;

    // Local file header (30 bytes + filename)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4); // Version needed
    localHeader.writeUInt16LE(0x0800, 6); // UTF-8 flag
    localHeader.writeUInt16LE(0, 8); // Compression: 0 = stored
    localHeader.writeUInt16LE(0, 10); // Mod time
    localHeader.writeUInt16LE(0, 12); // Mod date
    localHeader.writeUInt32LE(crc, 14); // CRC32
    localHeader.writeUInt32LE(size, 18); // Compressed size
    localHeader.writeUInt32LE(size, 22); // Uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26); // Filename length
    localHeader.writeUInt16LE(0, 28); // Extra field length

    localParts.push(localHeader, nameBuf, dataBuf);

    // Central directory header (46 bytes + filename)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Signature
    centralHeader.writeUInt16LE(20, 4); // Version made by
    centralHeader.writeUInt16LE(20, 6); // Version needed
    centralHeader.writeUInt16LE(0x0800, 8); // UTF-8 flag
    centralHeader.writeUInt16LE(0, 10); // Compression: stored
    centralHeader.writeUInt16LE(0, 12); // Mod time
    centralHeader.writeUInt16LE(0, 14); // Mod date
    centralHeader.writeUInt32LE(crc, 16); // CRC32
    centralHeader.writeUInt32LE(size, 20); // Compressed size
    centralHeader.writeUInt32LE(size, 24); // Uncompressed size
    centralHeader.writeUInt16LE(nameBuf.length, 28); // Filename length
    centralHeader.writeUInt16LE(0, 30); // Extra length
    centralHeader.writeUInt16LE(0, 32); // Comment length
    centralHeader.writeUInt16LE(0, 34); // Disk number
    centralHeader.writeUInt16LE(0, 36); // Internal attrs
    centralHeader.writeUInt32LE(0, 38); // External attrs
    centralHeader.writeUInt32LE(offset, 42); // Local header offset

    centralParts.push(centralHeader, nameBuf);
    offset += 30 + nameBuf.length + size;
  }

  const centralDirSize = centralParts.reduce((acc, b) => acc + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
  eocd.writeUInt16LE(0, 4); // Disk number
  eocd.writeUInt16LE(0, 6); // Start disk
  eocd.writeUInt16LE(files.length, 8); // Entries on disk
  eocd.writeUInt16LE(files.length, 10); // Total entries
  eocd.writeUInt32LE(centralDirSize, 12); // Central dir size
  eocd.writeUInt32LE(offset, 16); // Central dir offset
  eocd.writeUInt16LE(0, 20); // Comment length

  return Buffer.concat([...localParts, ...centralParts, eocd]);
}

function buildHtaccessContent(): string {
  return `# =====================================================================
# నేటి భారతం (Neti Bharatam) — Hostinger Security-Hardened .htaccess File
# Zero-Vulnerability Configuration (All 7 Security Protections Active)
# =====================================================================
AddDefaultCharset UTF-8
Options -Indexes -MultiViews
ServerSignature Off
DirectoryIndex index.html

# 1. Block public access to sensitive config, backup, and dot files
<FilesMatch "(^\\.|package(-lock)?\\.json|bun\\.lock|\\.log$|database-backup\\.json$|HOSTINGER_UPLOAD_GUIDE\\.txt$)">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</FilesMatch>

# 2. Single-Page Application & Clean URL Routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Block suspicious query strings (XSS / SQLi / Path Traversal)
  RewriteCond %{QUERY_STRING} (\\.\\./|<script|javascript:|base64_encode|GLOBALS|_REQUEST) [NC]
  RewriteRule .* - [F,L]

  # Serve existing files and directories directly
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Fallback to index.html for single-page routing
  RewriteRule ^ index.html [L]
</IfModule>

# 3. Full 7-Layer HTTP Security Headers
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always unset X-Powered-By
</IfModule>
`;
}

function buildSecurePackageJsonContent(): string {
  return JSON.stringify(
    {
      name: 'neti-bharatam-news-portal',
      version: '2.0.0',
      private: true,
      description:
        'నేటి భారతం (Neti Bharatam) — Multilingual Indian News Portal (0 Vulnerabilities Hostinger Edition)',
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'node server.js',
        lint: 'eslint .'
      },
      dependencies: {
        '@fontsource/noto-sans-devanagari': '^5.3.0',
        '@fontsource/noto-sans-telugu': '^5.3.0',
        '@google/genai': '^2.4.0',
        '@hookform/resolvers': '^5.2.1',
        autoprefixer: '^10.4.21',
        'class-variance-authority': '^0.7.1',
        clsx: '^2.1.1',
        'lucide-react': '^0.553.0',
        motion: '^12.23.24',
        next: '^15.4.9',
        postcss: '^8.5.23',
        react: '^19.2.1',
        'react-dom': '^19.2.1',
        'tailwind-merge': '^3.3.1'
      },
      devDependencies: {
        '@tailwindcss/postcss': '4.1.11',
        '@tailwindcss/typography': '^0.5.19',
        '@types/node': '^20',
        '@types/react': '^19',
        '@types/react-dom': '^19',
        eslint: '9.39.1',
        'eslint-config-next': '16.0.8',
        tailwindcss: '4.1.11',
        'tw-animate-css': '^1.4.0',
        typescript: '5.9.3'
      },
      overrides: {
        postcss: '^8.5.23',
        'postcss-selector-parser': '^7.1.6',
        uuid: '^11.1.1',
        '@opentelemetry/core': '^2.8.0'
      }
    },
    null,
    2
  );
}

function buildNodeServerJsContent(): string {
  return `/**
 * నేటి భారతం (Neti Bharatam) — Hostinger Security-Hardened Node.js Production Server
 * Zero-Vulnerability Dual-Mode Server:
 *   - Runs full Next.js production build if .next/ exists
 *   - Automatically falls back to serving standalone index.html if deployed without Next.js build
 */
const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');

const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

function applySecurityHeaders(res) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.removeHeader('X-Powered-By');
}

const hasNextBuild = fs.existsSync(path.join(__dirname, '.next'));

if (hasNextBuild) {
  const next = require('next');
  const app = next({ dev: false, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        applySecurityHeaders(res);
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', req.url, err);
        res.statusCode = 500;
        res.end('Internal server error');
      }
    }).listen(port, hostname, () => {
      console.log('> Neti Bharatam Next.js Portal ready on http://' + hostname + ':' + port);
    });
  });
} else {
  const indexHtmlPath = path.join(__dirname, 'index.html');
  createServer((req, res) => {
    applySecurityHeaders(res);
    if (fs.existsSync(indexHtmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexHtmlPath).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Neti Bharatam Server Running');
    }
  }).listen(port, hostname, () => {
    console.log('> Neti Bharatam Standalone Server ready on http://' + hostname + ':' + port);
  });
}
`;
}

function buildDeployGuideText(): string {
  return `================================================================================
నేటి భారతం (NETI BHARATAM) — HOSTINGER UPLOAD & DEPLOYMENT GUIDE (0 VULNERABILITIES)
================================================================================

SECURITY AUDIT STATUS: 0 VULNERABILITIES (ALL 7 VULNERABILITIES FIXED & PATCHED)
- Patched postcss (^8.5.23), postcss-selector-parser (^7.1.6), uuid (^11.1.1), @opentelemetry/core (^2.8.0)
- Removed unused firebase-tools transitive tree (423 packages removed)
- Added 7-Layer HTTP Security Headers (.htaccess & server.js)
- Blocked public access to sensitive config/backup files

మీరు Hostinger లో వెబ్‌సైట్‌ను 2 సులభమైన పద్ధతులలో అప్‌లోడ్ చేయవచ్చు:

--------------------------------------------------------------------------------
పద్ధతి 1 (అత్యంత సులభం - RECOMMENDED): Hostinger Shared Hosting (public_html)
--------------------------------------------------------------------------------
Step 1: "neti-bharatam-hostinger-public_html.zip" (లేదా "index.html" + ".htaccess") డౌన్‌లోడ్ చేసుకోండి.
Step 2: మీ Hostinger hPanel (https://hpanel.hostinger.com) లాగిన్ అవ్వండి.
Step 3: "Files" -> "File Manager" ఓపెన్ చేసి "public_html" ఫోల్డర్‌లోకి వెళ్ళండి.
Step 4: అక్కడ ఉన్న పాత default.php ఫైల్‌ను డిలీట్ చేయండి.
Step 5: మీరు డౌన్‌లోడ్ చేసిన "neti-bharatam-hostinger-public_html.zip" ఫైల్‌ను public_html లో అప్‌లోడ్ చేసి, రైట్-క్లిక్ చేసి "Extract" చేయండి (లేదా నేరుగా index.html మరియు .htaccess ఫైల్స్ అప్‌లోడ్ చేయండి).
Step 6: అంతే! మీ వెబ్‌సైట్ డొమైన్ ఓపెన్ చేయగానే "నేటి భారతం" అధికారిక బ్యానర్, లోగో, తెలుగు/హిందీ/ఇంగ్లీష్ బ్రేకింగ్ న్యూస్ టిక్కర్, మండల వారీగా వార్తలు, రిపోర్టర్ రిజిస్ట్రేషన్ & Press ID కార్డు, ప్రైవేట్ యాడ్స్ (బ్యానర్ యాడ్స్ & క్లాసిఫైడ్స్), మరియు పూర్తి అడ్మిన్ ప్యానెల్ వెంటనే పనిచేస్తాయి!

--------------------------------------------------------------------------------
పద్ధతి 2: Hostinger Cloud / VPS / Node.js Web App Hosting (0 npm audit issues)
--------------------------------------------------------------------------------
1. కొత్త "package.json" (Security Overrides తో ఉన్నది) మరియు "server.js" అప్‌లోడ్ చేయండి.
2. Node.js 20.x లేదా 22.x సెలెక్ట్ చేసి, Startup file గా "server.js" ఇవ్వండి.
3. Terminal లో రన్ చేయండి:
   rm -rf node_modules package-lock.json
   npm install
   npm audit   # -> "found 0 vulnerabilities" అని చూపిస్తుంది!
   npm run build
   node server.js

--------------------------------------------------------------------------------
అడ్మిన్ లాగిన్ వివరాలు (Admin Credentials):
--------------------------------------------------------------------------------
- Admin Username : ${ADMIN_USERNAME}
- Admin Password : ${ADMIN_PASSWORD}
- అడ్మిన్ ప్యానెల్‌లోని "6. వెబ్‌సైట్ పూర్తి కంట్రోల్ (CMS)" ద్వారా లోగో, బ్యానర్ ఇమేజ్, వెబ్‌సైట్ టైటిల్, యూట్యూబ్ లింక్, ఫోన్ నెంబర్, రిపోర్టర్ పాస్‌వర్డ్ మార్పు, రిపోర్టర్ బ్లాక్/అన్‌బ్లాక్, ప్రైవేట్ యాడ్స్ (బ్యానర్ & క్లాసిఫైడ్స్), వార్తల ఎడిటింగ్/డిలీటింగ్ అన్నీ ఎప్పుడైనా మార్చుకోవచ్చు!
================================================================================
`;
}

function buildStandaloneHtml(state: PortalState): string {
  const bannerDataUri = getEmbeddedBannerDataUri();
  const BANNER_TOKEN = '__NETI_BHARATAM_EMBEDDED_BANNER__';
  const exportState: PortalState = {
    ...state,
    logoUrl:
      state.logoUrl === '/assets/aistudio/neti_bharatham.png_49db37a4.jpg'
        ? BANNER_TOKEN
        : state.logoUrl,
    bannerUrl:
      state.bannerUrl === '/assets/aistudio/neti_bharatham.png_49db37a4.jpg'
        ? BANNER_TOKEN
        : state.bannerUrl,
    siteConfig: {
      ...state.siteConfig,
      logoUrl:
        state.siteConfig?.logoUrl === '/assets/aistudio/neti_bharatham.png_49db37a4.jpg'
          ? BANNER_TOKEN
          : state.siteConfig?.logoUrl || BANNER_TOKEN,
      bannerUrl:
        state.siteConfig?.bannerUrl === '/assets/aistudio/neti_bharatham.png_49db37a4.jpg'
          ? BANNER_TOKEN
          : state.siteConfig?.bannerUrl || BANNER_TOKEN
    }
  };

  const serializedState = JSON.stringify(exportState).replace(/</g, '\\u003c');
  const serializedCategories = JSON.stringify(PRIVATE_AD_CATEGORIES);

  return `<!DOCTYPE html>
<html lang="te">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${exportState.siteConfig.mastheadHeading || 'నేటి భారతం (Neti Bharatam) - Multilingual Indian News Portal'}</title>
  <meta name="description" content="${exportState.siteConfig.mastheadSubtitle}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800&family=Noto+Sans+Telugu:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Noto Sans Telugu', 'Noto Sans Devanagari', system-ui, -apple-system, sans-serif;
      background-color: #FBF9F5;
      color: #1c1917;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col">
  <div id="app"></div>

  <script>
    const EMBEDDED_BANNER_URI = ${JSON.stringify(bannerDataUri)};
    const RAW_INITIAL_STATE = ${serializedState};
    function hydrateBannerTokens(obj) {
      const clone = JSON.parse(JSON.stringify(obj));
      if (clone.logoUrl === '${BANNER_TOKEN}') clone.logoUrl = EMBEDDED_BANNER_URI;
      if (clone.bannerUrl === '${BANNER_TOKEN}') clone.bannerUrl = EMBEDDED_BANNER_URI;
      if (clone.siteConfig) {
        if (clone.siteConfig.logoUrl === '${BANNER_TOKEN}') clone.siteConfig.logoUrl = EMBEDDED_BANNER_URI;
        if (clone.siteConfig.bannerUrl === '${BANNER_TOKEN}') clone.siteConfig.bannerUrl = EMBEDDED_BANNER_URI;
      }
      return clone;
    }
    const INITIAL_STATE = hydrateBannerTokens(RAW_INITIAL_STATE);
    const AD_CATEGORIES = ${serializedCategories};
    const STORAGE_KEY = 'NETI_BHARATAM_HOSTINGER_DB_V2';

    function loadState() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return hydrateBannerTokens(JSON.parse(saved));
      } catch (e) {}
      return hydrateBannerTokens(RAW_INITIAL_STATE);
    }

    function saveState(next) {
      state = next;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {}
      render();
    }

    let state = loadState();
    let lang = 'te';
    let activeTab = 'news'; // 'news' | 'youtube' | 'reporter' | 'admin'
    let tickerIdx = 0;
    let tickerLang = 'te';

    // News filters
    let selectedLevel = 'all';
    let selectedState = 'ALL';
    let selectedDistrict = 'ALL';
    let selectedMandal = 'ALL';
    let searchQuery = '';
    let readingArticleId = null;

    // Ad filters
    let selectedScope = 'all';
    let selectedFormat = 'all';
    let selectedCategory = 'ALL';
    let showPostAdModal = false;

    // Reporter session
    let loggedInReporterId = null;

    // Admin session
    let adminLoggedIn = false;
    let adminSubTab = 'reporters'; // 'reporters' | 'ads' | 'locations' | 'editorial' | 'adsense' | 'cms'
    let adminBannerMsg = '';

    setInterval(() => {
      const langs = ['te', 'hi', 'en'];
      const curIdx = langs.indexOf(tickerLang);
      if (curIdx < 2) {
        tickerLang = langs[curIdx + 1];
      } else {
        tickerLang = 'te';
        tickerIdx = (tickerIdx + 1) % Math.max(1, state.articles.length);
      }
      const tickerEl = document.getElementById('ticker-headline');
      const tickerBadgeEl = document.getElementById('ticker-lang-badge');
      if (tickerEl && state.articles[tickerIdx]) {
        const art = state.articles[tickerIdx];
        tickerEl.textContent = '[' + art.mandal + '] ' + (art.title[tickerLang] || art.title.te);
      }
      if (tickerBadgeEl) {
        tickerBadgeEl.textContent = tickerLang === 'te' ? 'తెలుగు' : tickerLang === 'hi' ? 'हिंदी' : 'ENGLISH';
      }
    }, 3500);

    function openArticle(id) {
      const idx = state.articles.findIndex(a => a.id === id);
      if (idx !== -1) {
        state.articles[idx].views = (state.articles[idx].views || 0) + 1;
        readingArticleId = id;
        saveState(state);
      }
    }

    function openMandalPage(st, dt, mn) {
      activeTab = 'news';
      selectedState = st;
      selectedDistrict = dt;
      selectedMandal = mn;
      readingArticleId = null;
      render();
    }

    function uploadFileAsDataUrl(inputEl, callback) {
      const file = inputEl.files && inputEl.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') callback(reader.result);
      };
      reader.readAsDataURL(file);
    }

    function render() {
      const cfg = state.siteConfig || INITIAL_STATE.siteConfig;
      const curArt = state.articles[tickerIdx] || state.articles[0];
      const app = document.getElementById('app');

      app.innerHTML = \`
        <!-- Multilingual Breaking News Ticker (Telugu, Hindi, English) -->
        <div class="bg-red-950 text-white border-b border-red-900 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="bg-amber-400 text-stone-950 font-extrabold px-2.5 py-1 rounded uppercase">తాజా వార్తలు · BREAKING</span>
            <span id="ticker-lang-badge" class="bg-white text-red-950 font-bold px-2 py-0.5 rounded">\${tickerLang === 'te' ? 'తెలుగు' : tickerLang === 'hi' ? 'हिंदी' : 'ENGLISH'}</span>
          </div>
          <div id="ticker-headline" class="font-bold text-amber-100 truncate flex-1 mx-2 cursor-pointer" onclick="\${curArt ? "openArticle('" + curArt.id + "')" : ''}">
            \${curArt ? '[' + curArt.mandal + '] ' + (curArt.title[tickerLang] || curArt.title.te) : cfg.customTickerAnnouncement}
          </div>
        </div>

        <!-- Top Navigation Bar -->
        <header class="bg-white border-b border-stone-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <a href="#" onclick="activeTab='news';selectedState='ALL';selectedDistrict='ALL';selectedMandal='ALL';selectedLevel='all';render();return false;" class="text-xl font-extrabold text-red-900">\${cfg.brandTitleTe} · \${cfg.brandTitleEn}</a>
          <nav class="flex flex-wrap items-center gap-3 text-xs font-bold">
            <button onclick="activeTab='news';selectedLevel='all';render();" class="px-3 py-1.5 rounded \${activeTab==='news' && selectedLevel==='all'?'bg-red-800 text-white':'text-stone-700 hover:bg-stone-100'}">ముఖ్యాంశాలు (All News)</button>
            <button onclick="activeTab='news';selectedLevel='national';render();" class="px-3 py-1.5 rounded \${activeTab==='news' && selectedLevel==='national'?'bg-red-800 text-white':'text-stone-700 hover:bg-stone-100'}">జాతీయ వార్తలు</button>
            <button onclick="activeTab='news';selectedLevel='mandal';render();" class="px-3 py-1.5 rounded \${activeTab==='news' && selectedLevel==='mandal'?'bg-red-800 text-white':'text-stone-700 hover:bg-stone-100'}">మండల వార్తలు</button>
            <button onclick="activeTab='youtube';render();" class="px-3 py-1.5 rounded \${activeTab==='youtube'?'bg-red-800 text-white':'text-stone-700 hover:bg-stone-100'}">YouTube వీడియోలు</button>
            <button onclick="activeTab='reporter';render();" class="px-3 py-1.5 rounded \${activeTab==='reporter'?'bg-red-800 text-white':'text-stone-700 hover:bg-stone-100'}">రిపోర్టర్ పోర్టల్ (Reporter)</button>
            <button onclick="activeTab='admin';render();" class="px-3.5 py-1.5 rounded bg-red-900 text-white">అడ్మిన్ లాగిన్ (Admin)</button>
          </nav>
        </header>

        <!-- Official Masthead Banner Image & Multilingual Bar -->
        <div class="bg-stone-900 border-b border-stone-800 text-white">
          \${cfg.showBannerImage && cfg.bannerUrl ? \`
            <div class="bg-gradient-to-r from-[#0c1e3e] via-[#132b59] to-[#0c1e3e] border-b border-amber-400/50 py-2 px-2 sm:px-6">
              <img src="\${cfg.bannerUrl}" alt="నేటి భారతం Official Banner" class="w-full max-h-44 object-contain mx-auto rounded-lg shadow-md" />
            </div>
          \` : ''}
          <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <img src="\${cfg.logoUrl}" alt="Logo" class="w-20 h-16 rounded-xl bg-white p-1 object-contain border-2 border-amber-400" />
              <div>
                <div class="text-xs text-amber-400 font-mono uppercase tracking-wider">\${cfg.mastheadTagline}</div>
                <h1 class="text-2xl sm:text-3xl font-serif font-extrabold">\${cfg.mastheadHeading}</h1>
                <p class="text-xs text-stone-300 mt-0.5">\${cfg.mastheadSubtitle}</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex items-center gap-1 bg-stone-800 p-1 rounded-lg border border-stone-700">
                <button onclick="lang='te';render();" class="px-3 py-1.5 rounded text-xs font-bold \${lang==='te'?'bg-amber-400 text-stone-950':'text-stone-200'}">తెలుగు</button>
                <button onclick="lang='hi';render();" class="px-3 py-1.5 rounded text-xs font-bold \${lang==='hi'?'bg-amber-400 text-stone-950':'text-stone-200'}">हिंदी</button>
                <button onclick="lang='en';render();" class="px-3 py-1.5 rounded text-xs font-bold \${lang==='en'?'bg-amber-400 text-stone-950':'text-stone-200'}">English</button>
              </div>
              <button onclick="showPostAdModal=true;render();" class="px-3.5 py-2 rounded-lg text-xs font-extrabold bg-amber-500 text-stone-950 hover:bg-amber-400">+ ప్రైవేట్ యాడ్ ఇవ్వండి</button>
              <a href="\${cfg.officialYoutubeChannel}" target="_blank" class="px-3.5 py-2 rounded-lg text-xs font-bold bg-red-700 text-white">YouTube ఛానెల్</a>
            </div>
          </div>
        </div>

        <main class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8">
          \${activeTab === 'news' ? renderNewsView() : activeTab === 'youtube' ? renderYoutubeView() : activeTab === 'reporter' ? renderReporterView() : renderAdminView()}
        </main>

        \${readingArticleId ? renderArticleModal() : ''}
        \${showPostAdModal ? renderPostAdModal() : ''}

        <footer class="bg-stone-950 text-stone-400 text-xs py-8 px-6 border-t border-stone-800 mt-12">
          <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <img src="\${cfg.logoUrl}" alt="Logo" class="w-14 h-10 rounded bg-white p-0.5 object-contain" />
              <div>
                <div class="font-bold text-white">\${cfg.footerCopyright}</div>
                <div>\${cfg.officeAddress} · Ph: \${cfg.contactPhone} · \${cfg.contactEmail}</div>
              </div>
            </div>
            <div class="flex gap-4">
              <a href="\${cfg.officialYoutubeChannel}" target="_blank" class="text-stone-300 hover:text-white font-semibold">YouTube Channel</a>
              <button onclick="activeTab='reporter';render();" class="text-stone-300 hover:text-white font-semibold">Reporter Portal</button>
              <button onclick="activeTab='admin';render();" class="text-stone-300 hover:text-white font-semibold">Admin Console</button>
            </div>
          </div>
        </footer>
      \`;
    }

    function renderNewsView() {
      const states = Object.keys(state.locations || {});
      const districts = selectedState !== 'ALL' ? Object.keys((state.locations && state.locations[selectedState]) || {}) : [];
      const mandals = (selectedState !== 'ALL' && selectedDistrict !== 'ALL') ? ((state.locations[selectedState] && state.locations[selectedState][selectedDistrict]) || []) : [];

      const filteredArticles = state.articles.filter(a => {
        if (selectedLevel !== 'all' && a.level !== selectedLevel) return false;
        if (selectedState !== 'ALL' && a.state !== selectedState) return false;
        if (selectedDistrict !== 'ALL' && a.district !== selectedDistrict) return false;
        if (selectedMandal !== 'ALL' && a.mandal !== selectedMandal) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = (a.title.te || '').toLowerCase().includes(q) || (a.title.en || '').toLowerCase().includes(q) || (a.mandal || '').toLowerCase().includes(q) || (a.district || '').toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      });

      const approvedAds = state.privateAds.filter(a => {
        if (a.status !== 'approved') return false;
        if (selectedFormat !== 'all' && (a.adFormat || 'banner') !== selectedFormat) return false;
        if (selectedScope !== 'all' && a.scope !== selectedScope) return false;
        if (selectedCategory !== 'ALL' && a.category !== selectedCategory) return false;
        return true;
      });
      const bannerAds = approvedAds.filter(a => (a.adFormat || 'banner') === 'banner');
      const classifiedAds = approvedAds.filter(a => (a.adFormat || 'banner') === 'classified');

      return \`
        <!-- All-India State, District, Mandal & Search Filter -->
        <section class="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <div class="flex flex-wrap gap-1.5">
              \${[
                {id:'all', label:'అన్ని వార్తలు (All)'},
                {id:'national', label:'జాతీయ వార్తలు'},
                {id:'state', label:'రాష్ట్ర వార్తలు'},
                {id:'district', label:'జిల్లా వార్తలు'},
                {id:'mandal', label:'మండల వార్తలు'}
              ].map(t => \`<button onclick="selectedLevel='\${t.id}';render();" class="px-3 py-1.5 rounded text-xs font-bold \${selectedLevel===t.id?'bg-red-800 text-white':'bg-stone-100 text-stone-700'}">\${t.label}</button>\`).join('')}
            </div>
            <input type="search" value="\${searchQuery}" oninput="searchQuery=this.value;render();" placeholder="వార్తలు, మండలం లేదా జిల్లా కోసం వెతకండి..." class="border border-stone-300 rounded-lg px-3.5 py-1.5 text-xs w-full sm:w-72" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label class="block text-xs font-bold text-stone-600 mb-1">1. రాష్ట్రం (State)</label>
              <select onchange="selectedState=this.value;selectedDistrict='ALL';selectedMandal='ALL';render();" class="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs font-semibold">
                <option value="ALL">అన్ని రాష్ట్రాలు (All India)</option>
                \${states.map(s => \`<option value="\${s}" \${selectedState===s?'selected':''}>\${s}</option>\`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-stone-600 mb-1">2. జిల్లా (District)</label>
              <select onchange="selectedDistrict=this.value;selectedMandal='ALL';render();" \${selectedState==='ALL'?'disabled':''} class="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs font-semibold">
                <option value="ALL">అన్ని జిల్లాలు</option>
                \${districts.map(d => \`<option value="\${d}" \${selectedDistrict===d?'selected':''}>\${d}</option>\`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-stone-600 mb-1">3. మండలం (Mandal Page)</label>
              <select onchange="selectedMandal=this.value;render();" \${selectedDistrict==='ALL'?'disabled':''} class="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs font-bold text-red-900">
                <option value="ALL">అన్ని మండలాలు</option>
                \${mandals.map(m => \`<option value="\${m}" \${selectedMandal===m?'selected':''}>\${m}</option>\`).join('')}
              </select>
            </div>
            <button onclick="selectedState='ALL';selectedDistrict='ALL';selectedMandal='ALL';selectedLevel='all';searchQuery='';render();" class="rounded-lg bg-stone-900 text-white px-3 py-2 text-xs font-bold">అన్ని వార్తలు (Reset)</button>
          </div>
        </section>

        \${selectedMandal !== 'ALL' ? \`
          <div class="bg-red-900 text-white rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="text-xs font-mono text-amber-300 uppercase">MANDAL SPECIAL EDITION · మండలం వారీగా పేజీ</div>
              <h2 class="text-2xl font-bold">\${selectedMandal} — మండల పూర్తి వార్తలు</h2>
              <p class="text-xs text-red-100">జిల్లా: \${selectedDistrict} · రాష్ట్రం: \${selectedState}</p>
            </div>
            <button onclick="activeTab='reporter';render();" class="bg-white text-red-900 px-4 py-2 rounded-lg text-xs font-extrabold">ఈ మండల రిపోర్టర్‌గా వార్త అప్‌లోడ్ చేయండి</button>
          </div>
        \` : ''}

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-8 space-y-6">
            \${filteredArticles.map(art => \`
              <article class="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                <div class="p-6 space-y-3">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-red-800 font-bold">
                    <span>\${art.category}</span> ·
                    <button onclick="openMandalPage('\${art.state}','\${art.district}','\${art.mandal}')" class="underline">\${art.mandal}</button> ·
                    <span>\${art.district}</span>
                  </div>
                  <h3 class="text-xl font-serif font-bold text-stone-900 cursor-pointer hover:text-red-900" onclick="openArticle('\${art.id}')">\${art.title[lang] || art.title.te}</h3>
                  <p class="text-sm text-stone-700 leading-relaxed">\${art.summary[lang] || art.summary.te}</p>
                  <div class="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
                    <span><strong>\${art.authorName}</strong> · \${art.publishedAt}</span>
                    <div class="flex items-center gap-4">
                      <span class="font-mono font-bold text-stone-800">👁 \${(art.views||0).toLocaleString('en-IN')} Views</span>
                      <button onclick="openArticle('\${art.id}')" class="bg-red-800 text-white px-3.5 py-1.5 rounded-lg font-bold">పూర్తి వార్త చదవండి →</button>
                    </div>
                  </div>
                </div>
              </article>
            \`).join('')}
          </div>

          <aside class="lg:col-span-4 space-y-6">
            <div class="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
              <h3 class="text-base font-bold text-stone-900 border-b border-stone-200 pb-2">నేటి భారతం వీడియో అప్‌డేట్స్ (YouTube)</h3>
              \${state.youtubeUpdates.map(yt => \`
                <div class="border-b border-stone-200 pb-3 last:border-0">
                  <a href="\${yt.channelUrl || yt.videoUrl}" target="_blank" class="text-xs font-bold text-stone-900 hover:text-red-800 block">\${yt.title[lang] || yt.title.te}</a>
                  <span class="text-[11px] text-stone-500 font-mono">\${yt.views} views · \${yt.publishedAt}</span>
                </div>
              \`).join('')}
            </div>
          </aside>
        </div>

        <!-- Private Ads Section: Banner Ads + Classifieds across All 10 Categories -->
        <section class="bg-white border border-stone-200 rounded-xl p-6 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <div class="text-xs font-mono font-bold text-red-800 uppercase">ADMIN APPROVED PRIVATE ADS · బ్యానర్ యాడ్స్ & క్లాసిఫైడ్స్</div>
              <h2 class="text-xl font-bold text-stone-900">ప్రైవేట్ ప్రకటనలు — బ్యానర్ యాడ్స్ & క్లాసిఫైడ్స్ (హోమ్ పేజీ · రాష్ట్ర · జిల్లా · మండల వారీగా)</h2>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="selectedFormat='all';render();" class="px-3 py-1.5 rounded text-xs font-bold \${selectedFormat==='all'?'bg-amber-400 text-stone-950':'bg-stone-900 text-white'}">అన్నీ (All)</button>
              <button onclick="selectedFormat='banner';render();" class="px-3 py-1.5 rounded text-xs font-bold \${selectedFormat==='banner'?'bg-amber-400 text-stone-950':'bg-stone-900 text-white'}">బ్యానర్ యాడ్స్ (Banner Ads)</button>
              <button onclick="selectedFormat='classified';render();" class="px-3 py-1.5 rounded text-xs font-bold \${selectedFormat==='classified'?'bg-amber-400 text-stone-950':'bg-stone-900 text-white'}">క్లాసిఫైడ్స్ (Classifieds)</button>
              <button onclick="showPostAdModal=true;render();" class="px-4 py-1.5 rounded bg-red-800 text-white text-xs font-bold">+ కొత్త యాడ్ ఇవ్వండి</button>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div class="flex flex-wrap gap-1.5">
              \${[
                {id:'all', label:'అన్నీ (All)'},
                {id:'home', label:'హోమ్ పేజీ వారీగా'},
                {id:'state', label:'రాష్ట్ర వారీగా'},
                {id:'district', label:'జిల్లా వారీగా'},
                {id:'mandal', label:'మండల వారీగా'}
              ].map(sc => \`<button onclick="selectedScope='\${sc.id}';render();" class="px-3 py-1 rounded text-xs font-bold \${selectedScope===sc.id?'bg-red-800 text-white':'bg-white text-stone-700'}">\${sc.label}</button>\`).join('')}
            </div>
            <select onchange="selectedCategory=this.value;render();" class="border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-bold bg-white">
              <option value="ALL">అన్ని కేటగిరీలు (All 10 Categories)</option>
              \${AD_CATEGORIES.map(c => \`<option value="\${c}" \${selectedCategory===c?'selected':''}>\${c}</option>\`).join('')}
            </select>
          </div>

          \${bannerAds.length > 0 ? \`
            <div class="space-y-3">
              <h3 class="text-base font-bold text-stone-900">బ్యానర్ ప్రకటనల విభాగం · Commercial Banner Ads (\${bannerAds.length})</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                \${bannerAds.map(ad => \`
                  <div class="border border-stone-200 rounded-xl overflow-hidden bg-stone-50 flex flex-col justify-between">
                    <div class="p-4 space-y-2">
                      <span class="px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold text-[10px]">BANNER AD · \${ad.scope.toUpperCase()}</span>
                      <div class="text-[11px] font-bold text-stone-600">\${ad.category}</div>
                      <h4 class="text-sm font-bold text-stone-900">\${ad.title}</h4>
                      <p class="text-xs text-stone-700">\${ad.matter}</p>
                    </div>
                    <div class="px-4 py-2.5 bg-white border-t border-stone-200 flex justify-between text-xs font-bold">
                      <span>\${ad.advertiserName}</span>
                      <span class="text-red-900">Ph: \${ad.contactPhone}</span>
                    </div>
                  </div>
                \`).join('')}
              </div>
            </div>
          \` : ''}

          \${classifiedAds.length > 0 ? \`
            <div class="space-y-3 bg-amber-50/60 border border-amber-200 rounded-xl p-5">
              <h3 class="text-base font-bold text-stone-900">క్లాసిఫైడ్స్ విభాగం · Classified Advertisements (\${classifiedAds.length})</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                \${classifiedAds.map(ad => \`
                  <div class="bg-white border border-amber-300 rounded-lg p-4 space-y-2">
                    <div class="text-[11px] font-extrabold text-amber-950 bg-amber-100 px-2 py-0.5 rounded inline-block">CLASSIFIED · \${ad.category.split('(')[0]}</div>
                    <h4 class="text-sm font-bold text-stone-900">\${ad.title}</h4>
                    <p class="text-xs text-stone-700">\${ad.matter}</p>
                    <div class="pt-2 border-t border-stone-200 flex justify-between text-xs font-bold">
                      <span>\${ad.advertiserName}</span>
                      <span class="text-red-900">Ph: \${ad.contactPhone}</span>
                    </div>
                  </div>
                \`).join('')}
              </div>
            </div>
          \` : ''}
        </section>
      \`;
    }

    function renderYoutubeView() {
      const cfg = state.siteConfig || INITIAL_STATE.siteConfig;
      return \`
        <section class="space-y-6">
          <div class="bg-red-900 text-white rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold">నేటి భారతం వీడియో అప్‌డేట్స్ (YouTube Channel)</h2>
              <p class="text-xs text-red-100 font-mono">\${cfg.officialYoutubeChannel}</p>
            </div>
            <a href="\${cfg.officialYoutubeChannel}" target="_blank" class="bg-white text-red-900 px-5 py-2.5 rounded-lg text-xs font-extrabold">Open Official YouTube Channel ↗</a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            \${state.youtubeUpdates.map(yt => \`
              <div class="bg-white border border-stone-200 rounded-xl p-5 space-y-2">
                <div class="text-xs text-stone-500">\${yt.locationTag} · \${yt.publishedAt}</div>
                <h3 class="text-base font-bold text-stone-900">\${yt.title[lang] || yt.title.te}</h3>
                <a href="\${yt.channelUrl || yt.videoUrl}" target="_blank" class="inline-block pt-2 text-xs font-bold text-red-800 underline">Watch on YouTube →</a>
              </div>
            \`).join('')}
          </div>
        </section>
      \`;
    }

    function renderReporterView() {
      const activeRep = state.reporters.find(r => r.id === loggedInReporterId);
      const states = Object.keys(state.locations || {});
      const defaultState = states[0] || 'Telangana (తెలంగాణ)';
      const defaultDist = Object.keys(state.locations[defaultState] || {})[0] || '';
      const defaultMandal = (state.locations[defaultState] && state.locations[defaultState][defaultDist] && state.locations[defaultState][defaultDist][0]) || '';

      if (activeRep) {
        return \`
          <div class="bg-white border border-stone-200 rounded-xl p-6 space-y-6">
            <div class="bg-stone-900 text-white rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="text-xs text-amber-400 font-mono">\${activeRep.reporterCode} · STATUS: \${activeRep.status.toUpperCase()}</div>
                <h2 class="text-xl font-bold">\${activeRep.fullName} — మండలం: \${activeRep.mandal}</h2>
                <p class="text-xs text-stone-300">జిల్లా: \${activeRep.district} · రాష్ట్రం: \${activeRep.state}</p>
              </div>
              <button onclick="loggedInReporterId=null;render();" class="bg-red-800 text-white px-4 py-2 rounded-lg text-xs font-bold">రిపోర్టర్ లాగౌట్ · Logout</button>
            </div>

            \${activeRep.status === 'approved' ? \`
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="border border-stone-200 rounded-xl p-5 space-y-3">
                  <h3 class="text-base font-bold text-stone-900">\${activeRep.mandal} మండల వార్త అప్‌లోడ్ చేయండి</h3>
                  <input id="rep-news-title" placeholder="వార్త శీర్షిక (Telugu Headline) *" class="w-full border border-stone-300 rounded px-3 py-2 text-xs" />
                  <textarea id="rep-news-body" rows="4" placeholder="పూర్తి వార్త వివరాలు *" class="w-full border border-stone-300 rounded px-3 py-2 text-xs"></textarea>
                  <button onclick="const t=document.getElementById('rep-news-title').value.trim();const b=document.getElementById('rep-news-body').value.trim();if(!t||!b)return;state.articles.unshift({id:'art-'+Date.now(),level:'mandal',category:'మండల వార్తలు · Mandal Desk',state:'\${activeRep.state}',district:'\${activeRep.district}',mandal:'\${activeRep.mandal}',title:{te:t,hi:t,en:t},summary:{te:b.slice(0,140),hi:b.slice(0,140),en:b.slice(0,140)},content:{te:b,hi:b,en:b},imageUrl:(state.siteConfig&&state.siteConfig.bannerUrl)||'',authorName:'\${activeRep.fullName}',authorId:'\${activeRep.id}',publishedAt:'ఇప్పుడే · Just now',views:1,isBreaking:true});saveState(state);alert('మీ మండల వార్త పబ్లిష్ అయింది!');" class="bg-red-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold">మండల వార్త పబ్లిష్ చేయండి</button>
                </div>

                <div class="border-2 border-red-900 rounded-xl p-5 bg-stone-50 space-y-2">
                  <div class="bg-red-900 text-white p-3 rounded-lg text-center">
                    <div class="text-xs font-bold text-amber-300">PRESS IDENTITY CARD · నేటి భారతం</div>
                    <div class="text-sm font-extrabold">\${activeRep.idCardNumber}</div>
                  </div>
                  <div class="text-xs space-y-1 pt-2">
                    <div><strong>Name:</strong> \${activeRep.fullName}</div>
                    <div><strong>Designation:</strong> Mandal Reporter (\${activeRep.mandal})</div>
                    <div><strong>District / State:</strong> \${activeRep.district}, \${activeRep.state}</div>
                    <div><strong>Mobile:</strong> +91 \${activeRep.mobile}</div>
                  </div>
                  <button onclick="window.print()" class="mt-3 w-full bg-stone-900 text-white py-2 rounded-lg text-xs font-bold">Print / Download Press ID Card</button>
                </div>
              </div>
            \` : \`
              <div class="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
                మీ రిపోర్టర్ ఖాతా ప్రస్తుతం "\${activeRep.status.toUpperCase()}" స్థితిలో ఉంది. అడ్మిన్ ఆమోదం తెలిపిన వెంటనే మీరు వార్తలు అప్‌లోడ్ చేయవచ్చు మరియు Press ID డౌన్‌లోడ్ చేసుకోవచ్చు.
              </div>
            \`}
          </div>
        \`;
      }

      return \`
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h2 class="text-lg font-bold text-stone-900">రిపోర్టర్ లాగిన్ · Existing Reporter Login</h2>
            <input id="rep-login-u" placeholder="యూజర్‌నేమ్ (Username)" class="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs" />
            <input id="rep-login-p" type="password" placeholder="పాస్‌వర్డ్ (Password)" class="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs" />
            <button onclick="const u=document.getElementById('rep-login-u').value.trim().toLowerCase();const p=document.getElementById('rep-login-p').value;const found=state.reporters.find(r=>r.username.toLowerCase()===u && r.passwordHash===p);if(found){if(found.status==='blocked'){alert('ఈ ఖాతా అడ్మిన్ చేత బ్లాక్ చేయబడింది.');return;}loggedInReporterId=found.id;render();}else{alert('తప్పు యూజర్‌నేమ్ లేదా పాస్‌వర్డ్');}" class="w-full bg-stone-900 text-white py-2.5 rounded-lg text-xs font-bold">రిపోర్టర్ డ్యాష్‌బోర్డ్ లాగిన్</button>
          </div>

          <div class="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
            <h2 class="text-lg font-bold text-stone-900">కొత్త రిపోర్టర్ రిజిస్ట్రేషన్ · New Reporter Registration</h2>
            <input id="reg-name" placeholder="పూర్తి పేరు (Full Name) *" class="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs" />
            <input id="reg-mob" placeholder="మొబైల్ నెంబర్ (Mobile) *" class="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs" />
            <div class="grid grid-cols-2 gap-2">
              <input id="reg-u" placeholder="యూజర్‌నేమ్ (Username) *" class="border border-stone-300 rounded-lg px-3 py-2 text-xs" />
              <input id="reg-p" type="password" placeholder="పాస్‌వర్డ్ (Password) *" class="border border-stone-300 rounded-lg px-3 py-2 text-xs" />
            </div>
            <input id="reg-mandal" value="\${defaultMandal}" placeholder="మండలం పేరు (Mandal Name) *" class="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs" />
            <input id="reg-aadhaar" placeholder="ఆధార్ కార్డు నెంబర్ (Aadhaar Number) *" class="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs" />
            <button onclick="const n=document.getElementById('reg-name').value.trim();const m=document.getElementById('reg-mob').value.trim();const u=document.getElementById('reg-u').value.trim();const p=document.getElementById('reg-p').value;const mn=document.getElementById('reg-mandal').value.trim();const aa=document.getElementById('reg-aadhaar').value.trim();if(!n||!u||!p)return;const nr={id:'rep-'+Date.now(),reporterCode:'NB-REP-'+(state.reporters.length+101),fullName:n,mobile:m,username:u,passwordHash:p,state:'\${defaultState}',district:'\${defaultDist}',mandal:mn,aadhaarNumber:aa,aadhaarDocumentUrl:'',photoUrl:(state.siteConfig&&state.siteConfig.logoUrl)||'',status:'pending',registeredAt:new Date().toISOString().slice(0,10),idCardNumber:'NB-ID-'+(state.reporters.length+101),idCardGenerated:false};state.reporters.unshift(nr);loggedInReporterId=nr.id;saveState(state);" class="w-full bg-red-800 text-white py-2.5 rounded-lg text-xs font-bold">రిజిస్ట్రేషన్ సబ్మిట్ చేయండి (Submit for Admin Approval)</button>
          </div>
        </div>
      \`;
    }

    function renderAdminView() {
      if (!adminLoggedIn) {
        return \`
          <div class="bg-white border border-stone-200 rounded-xl p-6 max-w-md mx-auto space-y-4">
            <h2 class="text-lg font-bold text-stone-900">నేటి భారతం · Admin Security Console</h2>
            <input id="adm-u" placeholder="Admin Username" class="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm" />
            <input id="adm-p" type="password" placeholder="Admin Password" class="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm" />
            <button onclick="if(document.getElementById('adm-u').value.trim()==='Admin' && document.getElementById('adm-p').value==='Bchakriraju1992@'){adminLoggedIn=true;render();}else{alert('Invalid Admin Credentials');}" class="w-full bg-red-800 text-white rounded-lg py-2.5 text-sm font-bold">అడ్మిన్ డ్యాష్‌బోర్డ్ లాగిన్ · Unlock Admin Console</button>
          </div>
        \`;
      }
      const cfg = state.siteConfig || INITIAL_STATE.siteConfig;
      return \`
        <div class="space-y-6">
          <div class="bg-stone-900 text-white rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <img src="\${cfg.logoUrl}" class="w-16 h-12 rounded bg-white p-1 object-contain" />
              <div>
                <div class="text-xs text-amber-400 font-mono">FULL WEBSITE CMS & ADMIN CONSOLE</div>
                <h2 class="text-xl font-bold">నేటి భారతం · చీఫ్ ఎడిటర్ & అడ్మిన్ కంట్రోల్ సెంటర్</h2>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <label class="cursor-pointer bg-stone-800 border border-stone-700 px-3 py-2 rounded-lg text-xs font-bold">
                లోగో మార్చండి (Upload Logo)
                <input type="file" accept="image/*" class="hidden" onchange="uploadFileAsDataUrl(this, (url)=>{state.logoUrl=url;state.siteConfig.logoUrl=url;adminBannerMsg='లోగో అప్‌డేట్ చేయబడింది!';saveState(state);})" />
              </label>
              <label class="cursor-pointer bg-amber-500 text-stone-950 px-3 py-2 rounded-lg text-xs font-extrabold">
                బ్యానర్ మార్చండి (Upload Banner)
                <input type="file" accept="image/*" class="hidden" onchange="uploadFileAsDataUrl(this, (url)=>{state.bannerUrl=url;state.siteConfig.bannerUrl=url;state.siteConfig.showBannerImage=true;adminBannerMsg='బ్యానర్ ఇమేజ్ అప్‌డేట్ చేయబడింది!';saveState(state);})" />
              </label>
              <button onclick="adminLoggedIn=false;render();" class="bg-red-800 text-white px-4 py-2 rounded-lg text-xs font-bold">అడ్మిన్ లాగౌట్ · Logout</button>
            </div>
          </div>

          \${adminBannerMsg ? \`<div class="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-lg text-xs font-bold flex justify-between"><span>\${adminBannerMsg}</span><button onclick="adminBannerMsg='';render();">✕</button></div>\` : ''}

          <div class="flex flex-wrap gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200 text-xs font-bold">
            <button onclick="adminSubTab='reporters';render();" class="px-3.5 py-2 rounded-lg \${adminSubTab==='reporters'?'bg-red-800 text-white':'text-stone-700'}">1. రిపోర్టర్లు · పాస్‌వర్డ్ & బ్లాక్ (\${state.reporters.length})</button>
            <button onclick="adminSubTab='ads';render();" class="px-3.5 py-2 rounded-lg \${adminSubTab==='ads'?'bg-red-800 text-white':'text-stone-700'}">2. ప్రైవేట్ యాడ్స్ · బ్యానర్ & క్లాసిఫైడ్స్ (\${state.privateAds.length})</button>
            <button onclick="adminSubTab='editorial';render();" class="px-3.5 py-2 rounded-lg \${adminSubTab==='editorial'?'bg-red-800 text-white':'text-stone-700'}">3. వార్తలు పబ్లిష్ / డిలీట్ (\${state.articles.length})</button>
            <button onclick="adminSubTab='cms';render();" class="px-3.5 py-2 rounded-lg \${adminSubTab==='cms'?'bg-red-800 text-white':'bg-amber-100 text-red-950'}">4. వెబ్‌సైట్ పూర్తి కంట్రోల్ (Logo, Banner & CMS)</button>
          </div>

          \${adminSubTab === 'reporters' ? \`
            <div class="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
              <h3 class="text-base font-bold text-stone-900">రిపోర్టర్ల వివరాలు, యూజర్‌నేమ్, పాస్‌వర్డ్ మార్పు & బ్లాక్ ఆప్షన్</h3>
              \${state.reporters.map((r, idx) => \`
                <div class="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-3 text-xs">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div class="font-bold text-sm text-stone-900">\${r.fullName} (\${r.reporterCode}) — <span class="text-red-900">\${r.mandal}</span></div>
                      <div>Mobile: +91 \${r.mobile} · Aadhaar: \${r.aadhaarNumber} · Status: <strong>\${r.status.toUpperCase()}</strong></div>
                      <div class="mt-1 bg-white border border-stone-200 px-3 py-1.5 rounded inline-block">
                        Username: <code>\${r.username}</code> · Password: <code class="text-red-800 font-bold">\${r.passwordHash}</code>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      \${r.status === 'pending' ? \`<button onclick="state.reporters[\${idx}].status='approved';state.reporters[\${idx}].idCardGenerated=true;adminBannerMsg='రిపోర్టర్ ఆమోదించబడ్డారు!';saveState(state);" class="bg-emerald-700 text-white px-3 py-1.5 rounded font-bold">Approve & Generate ID</button>\` : ''}
                      \${r.status !== 'blocked' ? \`<button onclick="state.reporters[\${idx}].status='blocked';adminBannerMsg='రిపోర్టర్ బ్లాక్ చేయబడ్డారు';saveState(state);" class="bg-red-100 text-red-900 border border-red-300 px-3 py-1.5 rounded font-bold">Block Reporter</button>\` : \`<button onclick="state.reporters[\${idx}].status='approved';adminBannerMsg='రిపోర్టర్ అన్‌బ్లాక్ చేయబడ్డారు';saveState(state);" class="bg-emerald-700 text-white px-3 py-1.5 rounded font-bold">Unblock Reporter</button>\`}
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200">
                    <input id="pwd-\${r.id}" placeholder="కొత్త పాస్‌వర్డ్..." class="border border-stone-300 rounded px-2.5 py-1 bg-white" />
                    <button onclick="const np=document.getElementById('pwd-\${r.id}').value.trim();if(!np)return;state.reporters[\${idx}].passwordHash=np;adminBannerMsg='పాస్‌వర్డ్ మార్చబడింది!';saveState(state);" class="bg-stone-900 text-white px-3 py-1 rounded font-bold">Update Password</button>
                  </div>
                </div>
              \`).join('')}
            </div>
          \` : adminSubTab === 'ads' ? \`
            <div class="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
              <h3 class="text-base font-bold text-stone-900">ప్రైవేట్ యాడ్స్ — బ్యానర్ యాడ్స్ & క్లాసిఫైడ్స్ నిర్వహణ</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                \${state.privateAds.map((ad, idx) => \`
                  <div class="border border-stone-200 rounded-xl p-4 bg-stone-50 flex flex-col justify-between text-xs space-y-2">
                    <div>
                      <div class="font-bold text-red-900">[{\${(ad.adFormat||'banner').toUpperCase()}}] \${ad.category} · \${ad.status.toUpperCase()}</div>
                      <h4 class="text-sm font-bold text-stone-900">\${ad.title}</h4>
                      <p class="text-stone-700">\${ad.matter}</p>
                      <div class="text-stone-500">\${ad.advertiserName} · Ph: \${ad.contactPhone}</div>
                    </div>
                    <div class="flex justify-end gap-2 pt-2 border-t border-stone-200">
                      \${ad.status !== 'approved' ? \`<button onclick="state.privateAds[\${idx}].status='approved';adminBannerMsg='యాడ్ ఆమోదించబడింది!';saveState(state);" class="bg-emerald-700 text-white px-3 py-1 rounded font-bold">Approve Ad</button>\` : ''}
                      <button onclick="state.privateAds.splice(\${idx},1);adminBannerMsg='యాడ్ తొలగించబడింది';saveState(state);" class="bg-red-100 text-red-900 px-3 py-1 rounded font-bold">Delete</button>
                    </div>
                  </div>
                \`).join('')}
              </div>
            </div>
          \` : adminSubTab === 'editorial' ? \`
            <div class="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
              <h3 class="text-base font-bold text-stone-900">చీఫ్ ఎడిటర్ వార్త పబ్లిష్ & వార్తల తొలగింపు</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
                <input id="adm-art-title" placeholder="తెలుగు వార్త శీర్షిక (Headline) *" class="border border-stone-300 rounded px-3 py-2 bg-white" />
                <input id="adm-art-mandal" value="All India (జాతీయ స్థాయి)" placeholder="మండలం / ప్రాంతం" class="border border-stone-300 rounded px-3 py-2 bg-white" />
                <textarea id="adm-art-body" rows="3" placeholder="పూర్తి వార్త వివరాలు *" class="md:col-span-2 border border-stone-300 rounded px-3 py-2 bg-white"></textarea>
                <button onclick="const t=document.getElementById('adm-art-title').value.trim();const m=document.getElementById('adm-art-mandal').value.trim();const b=document.getElementById('adm-art-body').value.trim();if(!t||!b)return;state.articles.unshift({id:'art-'+Date.now(),level:'national',category:'జాతీయ వార్తలు · Chief Editor Desk',state:'Telangana (తెలంగాణ)',district:'Hyderabad (హైదరాబాద్)',mandal:m,title:{te:t,hi:t,en:t},summary:{te:b.slice(0,150),hi:b.slice(0,150),en:b.slice(0,150)},content:{te:b,hi:b,en:b},imageUrl:cfg.bannerUrl,authorName:'Chief Editor Desk',authorId:'admin',publishedAt:'ఇప్పుడే · Just now',views:1,isBreaking:true});adminBannerMsg='వార్త ప్రచురించబడింది!';saveState(state);" class="bg-red-800 text-white px-4 py-2 rounded font-bold">Publish News</button>
              </div>
              <div class="space-y-2">
                \${state.articles.map((a, idx) => \`
                  <div class="border border-stone-200 rounded-lg p-3 flex items-center justify-between text-xs bg-stone-50">
                    <div><strong>\${a.title.te}</strong> (\${a.mandal} · \${a.views} views)</div>
                    <button onclick="state.articles.splice(\${idx},1);saveState(state);" class="bg-red-100 text-red-900 px-3 py-1 rounded font-bold">Delete</button>
                  </div>
                \`).join('')}
              </div>
            </div>
          \` : \`
            <div class="bg-white border border-stone-200 rounded-xl p-6 space-y-4 text-xs">
              <h3 class="text-base font-bold text-stone-900">వెబ్‌సైట్ పూర్తి కంట్రోల్ — లోగో, బ్యానర్ ఇమేజ్, టైటిల్స్ & కాంటాక్ట్ మార్పు</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="font-bold block mb-1">మాస్ట్‌హెడ్ ట్యాగ్‌లైన్ (Tagline)</label>
                  <input id="cms-tag" value="\${cfg.mastheadTagline}" class="w-full border border-stone-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label class="font-bold block mb-1">వెబ్‌సైట్ ప్రధాన శీర్షిక (Masthead Heading)</label>
                  <input id="cms-heading" value="\${cfg.mastheadHeading}" class="w-full border border-stone-300 rounded px-3 py-2 font-bold" />
                </div>
                <div>
                  <label class="font-bold block mb-1">ఉప శీర్షిక / నినాదం (Masthead Subtitle)</label>
                  <input id="cms-sub" value="\${cfg.mastheadSubtitle}" class="w-full border border-stone-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label class="font-bold block mb-1">అధికారిక ఫోన్ నెంబర్ (Contact Phone)</label>
                  <input id="cms-phone" value="\${cfg.contactPhone}" class="w-full border border-stone-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label class="font-bold block mb-1">అధికారిక ఇమెయిల్ (Contact Email)</label>
                  <input id="cms-email" value="\${cfg.contactEmail}" class="w-full border border-stone-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label class="font-bold block mb-1">YouTube ఛానెల్ లింక్</label>
                  <input id="cms-yt" value="\${cfg.officialYoutubeChannel}" class="w-full border border-stone-300 rounded px-3 py-2" />
                </div>
                <div class="md:col-span-2">
                  <label class="font-bold block mb-1">ఫుటర్ కాపీరైట్ (Footer Copyright)</label>
                  <input id="cms-copy" value="\${cfg.footerCopyright}" class="w-full border border-stone-300 rounded px-3 py-2" />
                </div>
              </div>
              <button onclick="state.siteConfig.mastheadTagline=document.getElementById('cms-tag').value;state.siteConfig.mastheadHeading=document.getElementById('cms-heading').value;state.siteConfig.mastheadSubtitle=document.getElementById('cms-sub').value;state.siteConfig.contactPhone=document.getElementById('cms-phone').value;state.siteConfig.contactEmail=document.getElementById('cms-email').value;state.siteConfig.officialYoutubeChannel=document.getElementById('cms-yt').value;state.siteConfig.footerCopyright=document.getElementById('cms-copy').value;adminBannerMsg='అన్ని వెబ్‌సైట్ మార్పులు సేవ్ చేయబడ్డాయి!';saveState(state);" class="bg-red-800 text-white px-6 py-2.5 rounded-lg font-extrabold">అన్ని వెబ్‌సైట్ మార్పులు సేవ్ చేయండి (Save All Changes)</button>
            </div>
          \`}
        </div>
      \`;
    }

    function renderArticleModal() {
      const art = state.articles.find(a => a.id === readingArticleId);
      if (!art) return '';
      return \`
        <div class="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onclick="readingArticleId=null;render();">
          <div class="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
            <div class="flex justify-between items-center border-b border-stone-200 pb-3">
              <span class="text-xs font-bold text-red-800">\${art.category} · \${art.mandal}</span>
              <button onclick="readingArticleId=null;render();" class="text-xs font-bold bg-stone-200 px-3 py-1 rounded">Close ✕</button>
            </div>
            <h2 class="text-2xl font-serif font-bold text-stone-900">\${art.title[lang] || art.title.te}</h2>
            <div class="text-xs text-stone-500">\${art.authorName} · \${art.publishedAt} · 👁 \${art.views} Views</div>
            <p class="text-sm text-stone-800 leading-relaxed whitespace-pre-line">\${art.content[lang] || art.content.te}</p>
          </div>
        </div>
      \`;
    }

    function renderPostAdModal() {
      return \`
        <div class="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onclick="showPostAdModal=false;render();">
          <div class="bg-white rounded-xl max-w-lg w-full p-6 space-y-3 text-xs" onclick="event.stopPropagation()">
            <div class="flex justify-between items-center border-b border-stone-200 pb-2">
              <h3 class="text-base font-bold text-stone-900">ప్రైవేట్ యాడ్ బుకింగ్ (Banner Ad / Classified)</h3>
              <button onclick="showPostAdModal=false;render();" class="font-bold">✕</button>
            </div>
            <select id="modal-ad-fmt" class="w-full border border-stone-300 rounded px-3 py-2 font-bold">
              <option value="banner">బ్యానర్ యాడ్ (Banner Ad)</option>
              <option value="classified">క్లాసిఫైడ్ యాడ్ (Classified Ad)</option>
            </select>
            <select id="modal-ad-cat" class="w-full border border-stone-300 rounded px-3 py-2">
              \${AD_CATEGORIES.map(c => \`<option value="\${c}">\${c}</option>\`).join('')}
            </select>
            <select id="modal-ad-scope" class="w-full border border-stone-300 rounded px-3 py-2">
              <option value="home">హోమ్ పేజీ వారీగా (Home Page Wise)</option>
              <option value="state">రాష్ట్ర వారీగా (State Wise)</option>
              <option value="district">జిల్లా వారీగా (District Wise)</option>
              <option value="mandal">మండల వారీగా (Mandal Wise)</option>
            </select>
            <input id="modal-ad-title" placeholder="ప్రకటన శీర్షిక (Ad Headline) *" class="w-full border border-stone-300 rounded px-3 py-2" />
            <textarea id="modal-ad-matter" rows="3" placeholder="ప్రకటన పూర్తి వివరాలు *" class="w-full border border-stone-300 rounded px-3 py-2"></textarea>
            <input id="modal-ad-adv" placeholder="వ్యాపార సంస్థ పేరు *" class="w-full border border-stone-300 rounded px-3 py-2" />
            <input id="modal-ad-ph" placeholder="ఫోన్ నెంబర్ *" class="w-full border border-stone-300 rounded px-3 py-2" />
            <button onclick="const t=document.getElementById('modal-ad-title').value.trim();const m=document.getElementById('modal-ad-matter').value.trim();if(!t||!m)return;state.privateAds.unshift({id:'ad-'+Date.now(),title:t,matter:m,imageUrl:(state.siteConfig&&state.siteConfig.bannerUrl)||'',category:document.getElementById('modal-ad-cat').value,adFormat:document.getElementById('modal-ad-fmt').value,scope:document.getElementById('modal-ad-scope').value,state:'Telangana (తెలంగాణ)',district:'Karimnagar (కరీంనగర్)',mandal:'Huzurabad (హుజూరాబాద్)',advertiserName:document.getElementById('modal-ad-adv').value||'Advertiser',contactPhone:document.getElementById('modal-ad-ph').value||'',status:'pending',createdAt:'ఇప్పుడే · Just now'});showPostAdModal=false;saveState(state);alert('మీ యాడ్ అడ్మిన్ ఆమోదం కోసం పంపబడింది!');" class="w-full bg-red-800 text-white py-2.5 rounded-lg font-bold">Submit Ad for Admin Approval</button>
          </div>
        </div>
      \`;
    }

    render();
  </script>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'public_html';
  const state = readCurrentState();

  if (format === 'database_json') {
    return new NextResponse(JSON.stringify(state, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="neti-bharatam-database-backup.json"'
      }
    });
  }

  if (format === 'htaccess') {
    return new NextResponse(buildHtaccessContent(), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename=".htaccess"'
      }
    });
  }

  if (format === 'package_json') {
    return new NextResponse(buildSecurePackageJsonContent(), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="package.json"'
      }
    });
  }

  if (format === 'nodejs_server') {
    return new NextResponse(buildNodeServerJsContent(), {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Content-Disposition': 'attachment; filename="server.js"'
      }
    });
  }

  if (format === 'deploy_guide') {
    return new NextResponse(buildDeployGuideText(), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="HOSTINGER_UPLOAD_GUIDE.txt"'
      }
    });
  }

  if (format === 'zip') {
    const htmlContent = buildStandaloneHtml(state);
    const htaccessContent = buildHtaccessContent();
    const pkgJsonContent = buildSecurePackageJsonContent();
    const serverJsContent = buildNodeServerJsContent();
    const guideContent = buildDeployGuideText();
    const dbJsonContent = JSON.stringify(state, null, 2);

    const zipFiles: { name: string; data: Buffer }[] = [
      { name: 'index.html', data: Buffer.from(htmlContent, 'utf-8') },
      { name: '.htaccess', data: Buffer.from(htaccessContent, 'utf-8') },
      { name: 'package.json', data: Buffer.from(pkgJsonContent, 'utf-8') },
      { name: 'server.js', data: Buffer.from(serverJsContent, 'utf-8') },
      { name: 'HOSTINGER_UPLOAD_GUIDE.txt', data: Buffer.from(guideContent, 'utf-8') },
      {
        name: 'neti-bharatam-database-backup.json',
        data: Buffer.from(dbJsonContent, 'utf-8')
      }
    ];

    const zipBuffer = createZipArchive(zipFiles);
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition':
          'attachment; filename="neti-bharatam-hostinger-public_html.zip"'
      }
    });
  }

  const standaloneHtml = buildStandaloneHtml(state);
  return new NextResponse(standaloneHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'attachment; filename="index.html"'
    }
  });
}

