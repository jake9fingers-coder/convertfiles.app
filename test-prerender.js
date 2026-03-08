import fs from 'fs';

const indexHtml = fs.readFileSync('dist/index.html', 'utf-8');
const seoData = JSON.parse(fs.readFileSync('src/lib/generatedSeoData.json', 'utf-8'));
const entry = seoData.find(e => e.slug === 'heic-to-jpg');

function injectSEO_Old(html, title, description, keywords, canonical, headerContent) {
    let output = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

    output = output.replace(
        /<meta name="description"\s+content=".*?"\s*\/>/s,
        `<meta name="description" content="${description}" />`
    );

    output = output.replace(
        /<meta name="keywords"\s+content=".*?"\s*\/>/s,
        `<meta name="keywords" content="${keywords}" />`
    );

    output = output.replace(
        /<link rel="canonical" href=".*?"\s*\/>/,
        `<link rel="canonical" href="${canonical}" />`
    );

    output = output.replace(
        '<div id="root"></div>',
        `<div id="root">\n    <!-- SEO Static Fallback for Bingbot -->\n    <div style="padding: 2rem;">\n      ${headerContent}\n    </div>\n  </div>`
    );

    return output;
}

const headerHtml = '<h1>Test</h1>';
const title = entry.title;
const desc = entry.description;
const kws = entry.keywords.join(', ');

const oldHtml = injectSEO_Old(indexHtml, title, desc, kws, 'https://test', headerHtml);
fs.writeFileSync('test-old-output.html', oldHtml);
console.log("Wrote test-old-output.html");
