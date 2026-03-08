import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('./dist');
const SEO_DATA_PATH = path.resolve('./src/lib/generatedSeoData.json');

if (!fs.existsSync(DIST_DIR)) {
    console.error('dist directory does not exist. Run vite build first.');
    process.exit(1);
}

const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');
const seoData = JSON.parse(fs.readFileSync(SEO_DATA_PATH, 'utf-8'));

console.log('Generating static HTML files for SPA SEO...');

function injectSEO(html, title, description, keywords, canonical, headerContent) {
    // Replace Title
    let output = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

    // Replace Meta Description
    output = output.replace(
        /<meta name="description"\s+content=".*?"\s*\/>/s,
        `<meta name="description" content="${description}" />`
    );

    // Replace Meta Keywords (handling multiline since it's formatted in index.html)
    output = output.replace(
        /<meta name="keywords"\s+content=".*?"\s*\/>/s,
        `<meta name="keywords" content="${keywords}" />`
    );

    // Replace Canonical
    output = output.replace(
        /<link rel="canonical" href=".*?"\s*\/>/,
        `<link rel="canonical" href="${canonical}" />`
    );

    // Inject Static HTML into root for bots (Bing relies on this to see content without JS)
    output = output.replace(
        '<div id="root"></div>',
        `<div id="root">\n    <!-- SEO Static Fallback for Bingbot -->\n    <div style="padding: 2rem;">\n      ${headerContent}\n    </div>\n  </div>`
    );

    return output;
}

// Generate core static pages using base index info
const coreRoutes = ['image-converter', 'units', 'data-converter', 'currency-converter'];
for (const route of coreRoutes) {
    const dir = path.join(DIST_DIR, route);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), indexHtml);
}

// Generate 600+ SEO conversion pages
let count = 0;
for (const entry of seoData) {
    const route = `convert/${entry.slug}`;
    const dir = path.join(DIST_DIR, route);
    fs.mkdirSync(dir, { recursive: true });

    const headerHtml = `
        <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">${entry.h1}</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">${entry.intro}</p>
        <p>Convert <strong>${entry.sourceFormat}</strong> to <strong>${entry.targetFormat}</strong> instantly. No software to download, 100% free.</p>
        <h2>FAQ</h2>
        ${entry.faqItems.map(faq => `
            <h3>${faq.question}</h3>
            <p>${faq.answer}</p>
        `).join('')}
    `;

    const title = entry.title.replace(/"/g, '&quot;');
    const desc = entry.description.replace(/"/g, '&quot;');
    const kws = entry.keywords.join(', ').replace(/"/g, '&quot;');

    const html = injectSEO(
        indexHtml,
        title,
        desc,
        kws,
        `https://convertfiles.app/${route}`,
        headerHtml
    );

    fs.writeFileSync(path.join(dir, 'index.html'), html);
    count++;
}

console.log(`✅ successfully generated static HTML for ${count} SEO conversion pages.`);
