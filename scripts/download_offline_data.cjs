const fs = require('fs');
const path = require('path');
const https = require('https');

const QURAN_DIR = path.join(__dirname, '..', 'src', 'quran');
const FONTS_DIR = path.join(__dirname, '..', 'src', 'fonts');

if (!fs.existsSync(QURAN_DIR)) fs.mkdirSync(QURAN_DIR, { recursive: true });
if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR, { recursive: true });

async function downloadJSON(url, dest) {
    console.log(`Downloading ${url}...`);
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                fs.writeFileSync(dest, data);
                console.log(`Saved to ${dest}`);
                resolve();
            });
        }).on('error', err => reject(err));
    });
}

async function downloadFile(url, dest) {
    console.log(`Downloading ${url}...`);
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                fs.unlink(dest, () => {});
                return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Saved to ${dest}`);
                resolve();
            });
        }).on('error', err => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function main() {
    try {
        await downloadJSON('https://api.alquran.cloud/v1/quran/ar.muyassar', path.join(QURAN_DIR, 'ar.muyassar.json'));
        await downloadJSON('https://api.alquran.cloud/v1/quran/en.asad', path.join(QURAN_DIR, 'en.asad.json'));
        
        // Fonts download will be a bit complex because Google Fonts serves CSS that contains URLs to woff2 files.
        // We will download a set of woff2 manually by fetching the CSS with a modern user agent.
        
        const fontsUrl = 'https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Amiri+Quran&family=Cairo:wght@400;600;700&family=Lateef:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Scheherazade+New:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap';
        
        console.log(`Fetching fonts CSS...`);
        const cssData = await new Promise((resolve, reject) => {
            const req = https.get(fontsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', reject);
        });
        
        let localCss = cssData;
        const urlRegex = /url\((https:\/\/[^)]+)\)/g;
        let match;
        let fontIndex = 0;
        
        while ((match = urlRegex.exec(cssData)) !== null) {
            const fontUrl = match[1];
            const ext = fontUrl.split('.').pop() || 'woff2';
            const fileName = `font-${fontIndex}.${ext}`;
            await downloadFile(fontUrl, path.join(FONTS_DIR, fileName));
            localCss = localCss.replace(fontUrl, `/src/fonts/${fileName}`);
            fontIndex++;
        }
        
        fs.writeFileSync(path.join(__dirname, '..', 'src', 'styles', 'fonts.css'), localCss);
        console.log('Fonts CSS generated at src/styles/fonts.css');
        
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
