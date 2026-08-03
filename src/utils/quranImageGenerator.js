import { IMAGE_THEMES } from './imageThemes.js';

function getLines(context, text, maxWidth) {
  const words = text.split(' ');
  let line = '';
  let lines = [];
  
  for(let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = context.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    }
    else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
}

export async function exportQuranToImage(ayahText, surahName, ayahNumber, themeId = 'emerald', options = {}) {
    // Note: options can contain extra texts like tafsir, meaning, asbab AND layoutMode
    const layoutMode = options.layoutMode || 'extend'; // 'extend', 'shrink', 'split'
    const theme = IMAGE_THEMES[themeId] || IMAGE_THEMES['emerald'];
    const scale = 3; 
    const width = 1080 * scale;
    const cardMargin = 80 * scale;
    const maxTextWidth = width - (cardMargin * 2) - (120 * scale);
    const cardPadding = 120 * scale;
    const minCardHeight = 1920 * scale - (cardMargin * 3.5);

    // Measure Header
    const headerHeight = cardMargin * 1.2 + 110 * scale + 70 * scale + 40 * scale; 
    
    // Measure Bottom Section (Footer)
    const bottomSectionHeight = 160 * scale;

    const tCtx = document.createElement('canvas').getContext('2d');
    tCtx.direction = 'rtl';

    // Measure Extras (Tafsir, etc)
    const extraSections = [];
    const extraFontSize = 28;
    const extraLineHeight = extraFontSize * 1.8 * scale;
    tCtx.font = `${extraFontSize * scale}px Almarai, sans-serif`;

    if (options.tafsir) extraSections.push({ title: 'التفسير', text: options.tafsir });
    if (options.meaning) extraSections.push({ title: 'المعنى', text: options.meaning });
    if (options.asbab) extraSections.push({ title: 'سبب النزول', text: options.asbab });

    let extrasHeight = 0;
    if (extraSections.length > 0) {
        extrasHeight += 60 * scale; 
        for (let sec of extraSections) {
            sec.lines = getLines(tCtx, sec.text, maxTextWidth);
            extrasHeight += 80 * scale; 
            extrasHeight += sec.lines.length * extraLineHeight;
            extrasHeight += 20 * scale; 
        }
    }

    const formattedAyah = `﴿ ${ayahText} ﴾`;

    let ayahFontSize = 64;
    if (layoutMode === 'shrink') {
        const fixedCardHeight = minCardHeight;
        const availableTextSpace = fixedCardHeight - headerHeight - bottomSectionHeight - extrasHeight - (cardPadding * 2);
        
        let ayahLines = [];
        let ayahLineHeight = 0;
        let ayahTotalHeight = 0;

        while (ayahFontSize >= 20) {
            tCtx.font = `${ayahFontSize * scale}px "Amiri Quran", Almarai, serif`; 
            ayahLines = getLines(tCtx, formattedAyah, maxTextWidth);
            ayahLineHeight = (ayahFontSize * 1.9) * scale;
            ayahTotalHeight = ayahLines.length * ayahLineHeight;

            if (ayahTotalHeight <= availableTextSpace) {
                break; 
            }
            ayahFontSize -= 2; 
        }

        await drawQuranCanvas(ayahLines, ayahFontSize, ayahLineHeight, ayahTotalHeight, fixedCardHeight, null);

    } else if (layoutMode === 'split') {
        ayahFontSize = 52; 
        tCtx.font = `${ayahFontSize * scale}px "Amiri Quran", Almarai, serif`; 
        const allLines = getLines(tCtx, formattedAyah, maxTextWidth);
        const ayahLineHeight = (ayahFontSize * 1.9) * scale;

        const fixedCardHeight = minCardHeight;
        // In split mode, we might split the Ayah, but extras should only appear on the last page, or we ignore them. 
        // For simplicity, let's put extras on the last page.
        
        let pageStartIdx = 0;
        let pages = [];
        
        while (pageStartIdx < allLines.length) {
            let availableTextSpace = fixedCardHeight - headerHeight - bottomSectionHeight - (cardPadding * 2);
            let isLastPage = false;
            let currentExtrasHeight = 0;

            // Check if we can fit the rest of the lines + extras
            const remainingLines = allLines.length - pageStartIdx;
            if ((remainingLines * ayahLineHeight) + extrasHeight <= availableTextSpace) {
                isLastPage = true;
                currentExtrasHeight = extrasHeight;
            }

            const linesPerPage = Math.max(1, Math.floor((availableTextSpace - currentExtrasHeight) / ayahLineHeight));
            const pageLines = allLines.slice(pageStartIdx, pageStartIdx + linesPerPage);
            
            pages.push({
                lines: pageLines,
                hasExtras: isLastPage,
                totalHeight: pageLines.length * ayahLineHeight
            });

            pageStartIdx += linesPerPage;
        }

        for (let p = 0; p < pages.length; p++) {
            const page = pages[p];
            const paginationText = pages.length > 1 ? `( ${p + 1} من ${pages.length} )` : null;
            await drawQuranCanvas(page.lines, ayahFontSize, ayahLineHeight, page.totalHeight, fixedCardHeight, paginationText, p, page.hasExtras ? extraSections : []);
            await new Promise(r => setTimeout(r, 500));
        }

    } else {
        // Extend mode
        if (ayahText.length > 150) ayahFontSize = 56;
        if (ayahText.length > 300) ayahFontSize = 48;
        if (ayahText.length > 500) ayahFontSize = 42;
        if (ayahText.length > 800) ayahFontSize = 36;

        tCtx.font = `${ayahFontSize * scale}px "Amiri Quran", Almarai, serif`; 
        const ayahLines = getLines(tCtx, formattedAyah, maxTextWidth);
        const ayahLineHeight = (ayahFontSize * 1.9) * scale;
        const ayahTotalHeight = ayahLines.length * ayahLineHeight;

        let requiredCardContentHeight = headerHeight + ayahTotalHeight + extrasHeight + bottomSectionHeight;
        const finalCardHeight = Math.max(requiredCardContentHeight, minCardHeight);
        
        await drawQuranCanvas(ayahLines, ayahFontSize, ayahLineHeight, ayahTotalHeight, finalCardHeight, null, 0, extraSections);
    }

    async function drawQuranCanvas(lines, fSize, lHeight, totalAyahHeight, cardHeight, paginationText, pageIndex = 0, currentExtras = extraSections) {
        const height = cardHeight + (cardMargin * 3.5);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.direction = 'rtl';

        // Background
        const bgGradient = ctx.createLinearGradient(0, 0, width, height);
        bgGradient.addColorStop(0, theme.bgStart);
        bgGradient.addColorStop(1, theme.bgEnd);
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        ctx.beginPath();
        ctx.arc(width * 0.8, height * 0.1, 500 * scale, 0, Math.PI * 2);
        ctx.fillStyle = theme.circle1;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(width * 0.2, height * 0.9, 700 * scale, 0, Math.PI * 2);
        ctx.fillStyle = theme.circle2;
        ctx.fill();

        // Main Card
        const cardWidth = width - (cardMargin * 2);
        const cardX = cardMargin;
        const cardY = cardMargin * 1.2;
        const cardRadius = 40 * scale;

        ctx.shadowColor = theme.cardShadow;
        ctx.shadowBlur = 50 * scale;
        ctx.shadowOffsetY = 20 * scale;

        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
        ctx.fillStyle = theme.cardBg;
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 2 * scale;
        ctx.strokeStyle = theme.cardBorder;
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(cardX + 20*scale, cardY + 20*scale, cardWidth - 40*scale, cardHeight - 40*scale, cardRadius - 10*scale);
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeStyle = theme.innerBorder;
        ctx.stroke();

        let currentY = cardY + 110 * scale;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Header
        ctx.fillStyle = theme.headerText;
        ctx.font = `bold ${52 * scale}px Almarai, sans-serif`;
        const headerTxt = paginationText ? `${surahName} - آية ${ayahNumber} ${paginationText}` : `${surahName} - آية ${ayahNumber}`;
        ctx.fillText(headerTxt, width / 2, currentY);

        currentY += 70 * scale;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 150 * scale, currentY);
        ctx.lineTo(width / 2 + 150 * scale, currentY);
        ctx.strokeStyle = theme.divider;
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
        currentY += 40 * scale;

        // Calculate Extras Height for this specific draw
        let currentExtrasHeight = 0;
        if (currentExtras && currentExtras.length > 0) {
            currentExtrasHeight += 60 * scale; 
            for (let sec of currentExtras) {
                currentExtrasHeight += 80 * scale; 
                currentExtrasHeight += sec.lines.length * extraLineHeight;
                currentExtrasHeight += 20 * scale; 
            }
        }

        const textAvailableSpace = cardHeight - (currentY - cardY) - bottomSectionHeight - currentExtrasHeight;
        const textStartY = currentY + (textAvailableSpace / 2) - (totalAyahHeight / 2) + (lHeight / 2);

        // Ayah Text
        ctx.fillStyle = theme.mainText;
        ctx.font = `${fSize * scale}px "Amiri Quran", Almarai, serif`; 
        
        let textDrawY = textStartY;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], width / 2, textDrawY);
            textDrawY += lHeight;
        }

        currentY = textDrawY + 60 * scale; // move below ayah

        // Draw Extras
        if (currentExtras && currentExtras.length > 0) {
            for (let sec of currentExtras) {
                ctx.beginPath();
                ctx.moveTo(width / 2 - 100 * scale, currentY - 30 * scale);
                ctx.lineTo(width / 2 + 100 * scale, currentY - 30 * scale);
                ctx.strokeStyle = theme.divider;
                ctx.lineWidth = 1 * scale;
                ctx.stroke();
                
                ctx.fillStyle = theme.headerText;
                ctx.font = `bold ${32 * scale}px Almarai, sans-serif`;
                ctx.fillText(sec.title, width / 2, currentY);
                currentY += 50 * scale;

                ctx.fillStyle = theme.mainText;
                ctx.font = `${extraFontSize * scale}px Almarai, sans-serif`;
                for (let i = 0; i < sec.lines.length; i++) {
                    ctx.fillText(sec.lines[i], width / 2, currentY);
                    currentY += extraLineHeight;
                }
                currentY += 20 * scale;
            }
        }

        // Footer App Watermark
        const footerY = height - (cardMargin * 1.5);
        ctx.fillStyle = theme.footerText;
        ctx.font = `${28 * scale}px Almarai, sans-serif`;
        ctx.globalAlpha = 0.6;
        ctx.fillText("تم الإنشاء بواسطة تطبيق سراج", width / 2, footerY);
        ctx.globalAlpha = 1.0;

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const pageSuffix = paginationText ? `_p${pageIndex + 1}` : '';
                a.download = `Warteel_Quran_${Date.now()}${pageSuffix}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            }, 'image/png', 1.0);
        });
    }
}
