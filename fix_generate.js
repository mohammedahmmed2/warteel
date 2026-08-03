const fs = require('fs');
let c = fs.readFileSync('src/pages/QuranList.js', 'utf8');

const juzTarget = `<div class="surah-info">
              <div class="surah-name-en" style="font-family: var(--font-arabic);\'>\\$\\{document\\.documentElement\\.lang === 'ar' \\? 'الجزء' : 'Juz'\\} \\$\\{document\\.documentElement\\.lang === 'ar' \\? toArabicNumeral\\(i\\) : i\\}</div>
            </div>
            \\$\\{document\\.documentElement\\.lang === 'ar' \\? '' : \`<div class="surah-name-ar">الجزء \\$\\{toArabicNumeral\\(i\\)\\}</div>\`\\}`;

// We will just string-replace because regex is messy with all these symbols.
c = c.split(`<div class="surah-info">
              <div class="surah-name-en" style="font-family: var(--font-arabic);\'>${document.documentElement.lang === 'ar' ? 'الجزء' : 'Juz'} ${document.documentElement.lang === 'ar' ? toArabicNumeral(i) : i}</div>
            </div>
            ${document.documentElement.lang === 'ar' ? '' : \`<div class="surah-name-ar">الجزء ${toArabicNumeral(i)}</div>\`}`).join(`<div class="surah-info">
              <div class="surah-name-en">Juz ${i}</div>
              <div class="surah-meta">الجزء ${toArabicNumeral(i)}</div>
            </div>
            <div class="surah-name-ar">الجزء ${toArabicNumeral(i)}</div>`);

c = c.split(`<div class="surah-info">
              <div class="surah-name-en" style="font-family: var(--font-arabic);\'>${document.documentElement.lang === 'ar' ? 'الصفحة' : 'Page'} ${document.documentElement.lang === 'ar' ? toArabicNumeral(i) : i}</div>
            </div>
            ${document.documentElement.lang === 'ar' ? '' : \`<div class="surah-name-ar">الصفحة ${toArabicNumeral(i)}</div>\`}`).join(`<div class="surah-info">
              <div class="surah-name-en">Page ${i}</div>
              <div class="surah-meta">الصفحة ${toArabicNumeral(i)}</div>
            </div>
            <div class="surah-name-ar">الصفحة ${toArabicNumeral(i)}</div>`);

// wait, the actual view_file had:
/*
            <div class="surah-info">
              <div class="surah-name-en" style="font-family: var(--font-arabic);">${document.documentElement.lang === 'ar' ? 'الجزء' : 'Juz'} ${document.documentElement.lang === 'ar' ? toArabicNumeral(i) : i}</div>
            </div>
            ${document.documentElement.lang === 'ar' ? '' : `<div class="surah-name-ar">الجزء ${toArabicNumeral(i)}</div>`}
*/

fs.writeFileSync('fix.js', \`
const fs = require('fs');
let c = fs.readFileSync('src/pages/QuranList.js', 'utf8');

let juzSearch = \`            <div class="surah-info">
              <div class="surah-name-en" style="font-family: var(--font-arabic);">\${document.documentElement.lang === 'ar' ? 'الجزء' : 'Juz'} \${document.documentElement.lang === 'ar' ? toArabicNumeral(i) : i}</div>
            </div>
            \${document.documentElement.lang === 'ar' ? '' : \\\`<div class="surah-name-ar">الجزء \${toArabicNumeral(i)}</div>\\\`}\`;

let juzReplace = \`            <div class="surah-info">
              <div class="surah-name-en">Juz \${i}</div>
              <div class="surah-meta">الجزء \${toArabicNumeral(i)}</div>
            </div>
            <div class="surah-name-ar">الجزء \${toArabicNumeral(i)}</div>\`;

let pageSearch = \`            <div class="surah-info">
              <div class="surah-name-en" style="font-family: var(--font-arabic);">\${document.documentElement.lang === 'ar' ? 'الصفحة' : 'Page'} \${document.documentElement.lang === 'ar' ? toArabicNumeral(i) : i}</div>
            </div>
            \${document.documentElement.lang === 'ar' ? '' : \\\`<div class="surah-name-ar">الصفحة \${toArabicNumeral(i)}</div>\\\`}\`;

let pageReplace = \`            <div class="surah-info">
              <div class="surah-name-en">Page \${i}</div>
              <div class="surah-meta">الصفحة \${toArabicNumeral(i)}</div>
            </div>
            <div class="surah-name-ar">الصفحة \${toArabicNumeral(i)}</div>\`;

c = c.replace(juzSearch, juzReplace);
c = c.replace(pageSearch, pageReplace);

fs.writeFileSync('src/pages/QuranList.js', c);
\`);
