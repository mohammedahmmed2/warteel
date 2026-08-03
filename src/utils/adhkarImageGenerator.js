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

export async function exportAdhkarToImage(dhikrText, typeName, source, repeat, themeId = 'dark', options = {}) {
    const layoutMode = options.layoutMode || 'extend'; // 'extend', 'shrink', 'split'
    const theme = IMAGE_THEMES[themeId] || IMAGE_THEMES['dark'];
    const scale = 3; 
    const width = 1080 * scale;
    const cardMargin = 80 * scale;
    const maxTextWidth = width - (cardMargin * 2) - (120 * scale);
    const cardPadding = 120 * scale;
    const minCardHeight = 1920 * scale - (cardMargin * 3.5);

    // Measure Header
    let headerHeight = 80 * scale; 
    headerHeight += 60 * scale; 

    // Measure Footer
    let footerHeight = 0;
    if (options.source && source) footerHeight += 100 * scale;
    if (options.repeat && repeat) footerHeight += 80 * scale;

    const tCtx = document.createElement('canvas').getContext('2d');
    tCtx.direction = 'rtl';

    let fontSize = 60;
    if (layoutMode === 'shrink') {
        const fixedCardHeight = minCardHeight;
        const availableTextSpace = fixedCardHeight - headerHeight - footerHeight - (cardPadding * 2);
        
        let dhikrLines = [];
        let dhikrLineHeight = 0;
        let dhikrTotalHeight = 0;

        while (fontSize >= 20) {
            tCtx.font = `${fontSize * scale}px Almarai, sans-serif`; 
            dhikrLines = getLines(tCtx, dhikrText, maxTextWidth);
            dhikrLineHeight = (fontSize * 1.8) * scale;
            dhikrTotalHeight = dhikrLines.length * dhikrLineHeight;

            if (dhikrTotalHeight <= availableTextSpace) {
                break; 
            }
            fontSize -= 2; 
        }

        await drawAdhkarCanvas(dhikrLines, fontSize, dhikrLineHeight, dhikrTotalHeight, fixedCardHeight, null);

    } else if (layoutMode === 'split') {
        fontSize = 52; 
        tCtx.font = `${fontSize * scale}px Almarai, sans-serif`; 
        const allLines = getLines(tCtx, dhikrText, maxTextWidth);
        const dhikrLineHeight = (fontSize * 1.8) * scale;

        const fixedCardHeight = minCardHeight;
        const availableTextSpace = fixedCardHeight - headerHeight - footerHeight - (cardPadding * 2);
        const linesPerPage = Math.max(1, Math.floor(availableTextSpace / dhikrLineHeight));

        const pagesCount = Math.ceil(allLines.length / linesPerPage);
        
        for (let p = 0; p < pagesCount; p++) {
            const pageLines = allLines.slice(p * linesPerPage, (p + 1) * linesPerPage);
            const pageTotalHeight = pageLines.length * dhikrLineHeight;
            const paginationText = pagesCount > 1 ? `( ${p + 1} من ${pagesCount} )` : null;
            
            await drawAdhkarCanvas(pageLines, fontSize, dhikrLineHeight, pageTotalHeight, fixedCardHeight, paginationText, p);
            await new Promise(r => setTimeout(r, 500));
        }

    } else {
        // Extend mode
        if (dhikrText.length > 200) fontSize = 52;
        if (dhikrText.length > 400) fontSize = 44;
        if (dhikrText.length > 700) fontSize = 38;
        if (dhikrText.length > 1000) fontSize = 32;

        tCtx.font = `${fontSize * scale}px Almarai, sans-serif`; 
        const dhikrLines = getLines(tCtx, dhikrText, maxTextWidth);
        const dhikrLineHeight = (fontSize * 1.8) * scale;
        const dhikrTotalHeight = dhikrLines.length * dhikrLineHeight;

        const computedCardHeight = headerHeight + dhikrTotalHeight + footerHeight + (cardPadding * 2);
        const finalCardHeight = Math.max(computedCardHeight, minCardHeight);
        
        await drawAdhkarCanvas(dhikrLines, fontSize, dhikrLineHeight, dhikrTotalHeight, finalCardHeight, null);
    }

    async function drawAdhkarCanvas(lines, fSize, lHeight, totalHeight, cardHeight, paginationText, pageIndex = 0) {
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
        ctx.fillStyle = theme.headerText;
        ctx.font = `bold ${56 * scale}px "Amiri Quran", Almarai, serif`;
        const headerTxt = paginationText ? `${typeName} ${paginationText}` : typeName;
        ctx.fillText(headerTxt, width / 2, currentY);
        currentY += 60 * scale;

        ctx.beginPath();
        ctx.moveTo(width / 2 - 150 * scale, currentY);
        ctx.lineTo(width / 2 + 150 * scale, currentY);
        ctx.strokeStyle = theme.divider;
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
        currentY += 60 * scale;

        // Dhikr Text
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

        if ((options.source && source) || (options.repeat && repeat)) {
            ctx.beginPath();
            ctx.moveTo(cardX + 80 * scale, bottomY - footerHeight);
            ctx.lineTo(cardX + cardWidth - 80 * scale, bottomY - footerHeight);
            ctx.strokeStyle = theme.divider;
            ctx.lineWidth = 1.5 * scale;
            ctx.stroke();
        }

        if (options.repeat && repeat) {
            ctx.fillStyle = theme.headerText;
            ctx.font = `bold ${32 * scale}px Almarai, sans-serif`;
            ctx.fillText(`التكرار: ${repeat}`, width / 2, bottomY);
            bottomY -= 80 * scale;
        }

        if (options.source && source) {
            ctx.fillStyle = theme.footerText;
            ctx.font = `${28 * scale}px Almarai, sans-serif`;
            const sourceLines = getLines(ctx, source, maxTextWidth - 100 * scale);
            for (let i = sourceLines.length - 1; i >= 0; i--) {
                ctx.fillText(sourceLines[i], width / 2, bottomY);
                bottomY -= 45 * scale;
            }
        }

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
                a.download = `Warteel_Adhkar_${Date.now()}${pageSuffix}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            }, 'image/png', 1.0);
        });
    }
}
