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

export async function exportHadithToImage(hadithText, bookName, chapterName, narrator, hadithNumber, themeId = 'gold', options = {}) {
    const layoutMode = options.layoutMode || 'extend'; // 'extend', 'shrink', 'split'
    const theme = IMAGE_THEMES[themeId] || IMAGE_THEMES['gold'];
    const scale = 3;
    const width = 1080 * scale;
    const cardMargin = 80 * scale;
    const maxTextWidth = width - (cardMargin * 2) - (120 * scale);
    const cardPadding = 120 * scale;
    const minCardHeight = 1920 * scale - (cardMargin * 3.5);

    // Measure Header
    let headerHeight = 0;
    if (options.narrator && narrator) headerHeight += 60 * scale;
    headerHeight += 80 * scale;
    headerHeight += 80 * scale;

    // Measure Footer
    let footerHeight = 120 * scale;
    if (options.chapter && chapterName) footerHeight += 60 * scale;

    const tCtx = document.createElement('canvas').getContext('2d');
    tCtx.direction = 'rtl';

    let fontSize = 60;
    if (layoutMode === 'shrink') {
        const fixedCardHeight = minCardHeight;
        const availableTextSpace = fixedCardHeight - headerHeight - footerHeight - (cardPadding * 2);
        
        let hadithLines = [];
        let hadithLineHeight = 0;
        let hadithTotalHeight = 0;

        while (fontSize >= 20) {
            tCtx.font = `${fontSize * scale}px Almarai, sans-serif`; 
            hadithLines = getLines(tCtx, hadithText, maxTextWidth);
            hadithLineHeight = (fontSize * 1.8) * scale;
            hadithTotalHeight = hadithLines.length * hadithLineHeight;

            if (hadithTotalHeight <= availableTextSpace) {
                break; 
            }
            fontSize -= 2; 
        }

        await drawHadithCanvas(hadithLines, fontSize, hadithLineHeight, hadithTotalHeight, fixedCardHeight, null);

    } else if (layoutMode === 'split') {
        fontSize = 52; 
        tCtx.font = `${fontSize * scale}px Almarai, sans-serif`; 
        const allLines = getLines(tCtx, hadithText, maxTextWidth);
        const hadithLineHeight = (fontSize * 1.8) * scale;

        const fixedCardHeight = minCardHeight;
        const availableTextSpace = fixedCardHeight - headerHeight - footerHeight - (cardPadding * 2);
        const linesPerPage = Math.max(1, Math.floor(availableTextSpace / hadithLineHeight));

        const pagesCount = Math.ceil(allLines.length / linesPerPage);
        
        for (let p = 0; p < pagesCount; p++) {
            const pageLines = allLines.slice(p * linesPerPage, (p + 1) * linesPerPage);
            const pageTotalHeight = pageLines.length * hadithLineHeight;
            const paginationText = pagesCount > 1 ? `( ${p + 1} من ${pagesCount} )` : null;
            
            await drawHadithCanvas(pageLines, fontSize, hadithLineHeight, pageTotalHeight, fixedCardHeight, paginationText, p);
            await new Promise(r => setTimeout(r, 500));
        }

    } else {
        // Extend mode
        if (hadithText.length > 200) fontSize = 52;
        if (hadithText.length > 400) fontSize = 44;
        if (hadithText.length > 700) fontSize = 38;
        if (hadithText.length > 1000) fontSize = 32;

        tCtx.font = `${fontSize * scale}px Almarai, sans-serif`; 
        const hadithLines = getLines(tCtx, hadithText, maxTextWidth);
        const hadithLineHeight = (fontSize * 1.8) * scale;
        const hadithTotalHeight = hadithLines.length * hadithLineHeight;

        const computedCardHeight = headerHeight + hadithTotalHeight + footerHeight + (cardPadding * 2);
        const finalCardHeight = Math.max(computedCardHeight, minCardHeight);
        
        await drawHadithCanvas(hadithLines, fontSize, hadithLineHeight, hadithTotalHeight, finalCardHeight, null);
    }

    async function drawHadithCanvas(lines, fSize, lHeight, totalHeight, cardHeight, paginationText, pageIndex = 0) {
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

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let currentY = cardY + cardPadding;

        // Header
        if (options.narrator && narrator) {
            ctx.fillStyle = theme.footerText;
            ctx.font = `bold ${32 * scale}px Almarai, sans-serif`;
            ctx.fillText(narrator, width / 2, currentY);
            currentY += 60 * scale;
        }

        ctx.fillStyle = theme.headerText;
        ctx.font = `bold ${52 * scale}px "Amiri Quran", Almarai, serif`;
        ctx.fillText("قال رسول الله ﷺ", width / 2, currentY);
        currentY += 60 * scale;

        ctx.beginPath();
        ctx.moveTo(width / 2 - 200 * scale, currentY);
        ctx.lineTo(width / 2 + 200 * scale, currentY);
        ctx.strokeStyle = theme.divider;
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
        currentY += 60 * scale;

        // Hadith Text
        const textAvailableSpace = cardHeight - (currentY - cardY) - footerHeight - cardPadding;
        const textStartY = currentY + (textAvailableSpace / 2) - (totalHeight / 2) + (lHeight / 2);

        ctx.fillStyle = theme.mainText;
        ctx.font = `${fSize * scale}px Almarai, sans-serif`; 
        
        let textDrawY = textStartY;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], width / 2, textDrawY);
            textDrawY += lHeight;
        }

        // Footer
        let bottomY = cardY + cardHeight - cardPadding;

        ctx.beginPath();
        ctx.moveTo(cardX + 60 * scale, bottomY - 60 * scale);
        ctx.lineTo(cardX + cardWidth - 60 * scale, bottomY - 60 * scale);
        ctx.strokeStyle = theme.divider;
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        if (options.chapter && chapterName) {
            ctx.fillStyle = theme.footerText;
            ctx.font = `${28 * scale}px Almarai, sans-serif`;
            ctx.fillText(chapterName, width / 2, bottomY - 100 * scale);
        }

        ctx.font = `bold ${32 * scale}px Almarai, sans-serif`;
        ctx.fillStyle = theme.headerText;
        const paginationStr = paginationText ? ` ${paginationText}` : '';
        const footerText = `${bookName} ${hadithNumber ? `| رقم الحديث: ${hadithNumber}` : ''}${paginationStr}`;
        ctx.fillText(footerText, width / 2, bottomY);

        // App Watermark
        ctx.fillStyle = theme.footerText;
        ctx.font = `${28 * scale}px Almarai, sans-serif`;
        ctx.globalAlpha = 0.6;
        ctx.fillText("تم الإنشاء بواسطة تطبيق سراج", width / 2, height - (cardMargin * 1.5));
        ctx.globalAlpha = 1.0;

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const pageSuffix = paginationText ? `_p${pageIndex + 1}` : '';
                a.download = `Warteel_Hadith_${Date.now()}${pageSuffix}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            }, 'image/png', 1.0);
        });
    }
}
