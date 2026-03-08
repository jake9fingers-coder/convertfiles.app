import fs from 'fs';
import https from 'https';

const HOST = 'convertfiles.app';
const KEY = 'a9b8c7d6e5f4'; // Must match the .txt file hosted at the root
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Parse sitemap to get full URL list
const sitemap = fs.readFileSync('./public/sitemap.xml', 'utf-8');
const urls = [];
const regex = /<loc>(.*?)<\/loc>/g;
let match;
while ((match = regex.exec(sitemap)) !== null) {
    urls.push(match[1]);
}

const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
});

const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
    }
};

console.log(`📡 Submitting ${urls.length} URLs to IndexNow (Bing/Yandex)...`);

const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', d => responseBody += d);
    res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
            console.log('✅ IndexNow submission successful! Search engines notified.');
        } else {
            console.error(`❌ IndexNow submission failed. HTTP ${res.statusCode}: ${responseBody}`);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ IndexNow request error: ${e.message}`);
});

req.write(payload);
req.end();
