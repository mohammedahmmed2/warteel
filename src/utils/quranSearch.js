/**
 * Smart Quran Search Engine (quranSearch.js)
 * High-performance, fuzzy-tolerant Arabic text search for Quran Surahs and Ayahs.
 */

// Strip Arabic Diacritics (Tashkeel) and Quranic symbols
export function stripDiacritics(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u0653\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Diacritics & Quran marks
    .replace(/\u0640/g, '') // Tatweel (ـ)
    .replace(/[\ufeff\u200b\u200c\u200d]/g, '') // Zero-width spaces & BOM
    .trim();
}

// Normalize Arabic letters for fuzzy/typo-tolerant matching
export function normalizeArabic(text) {
  if (!text) return '';
  let cleaned = stripDiacritics(text).toLowerCase();
  
  return cleaned
    // Normalize Alef variants: أ, إ, آ, ٱ, ٲ, ٳ, ٵ -> ا
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673\u0675]/g, 'ا')
    // Normalize Yaa / Alif Maqsoora: ى, ئ -> ي
    .replace(/[\u0649\u0626]/g, 'ي')
    // Normalize Taa Marboota: ة -> ه
    .replace(/\u0629/g, 'ه')
    // Normalize Waw with Hamza: ؤ -> و
    .replace(/\u0624/g, 'و')
    // Normalize Hamza alone: ء -> (remove or replace for uniform search)
    .replace(/\u0621/g, '')
    // Replace non-alphanumeric punctuation with space
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Compute Levenshtein distance between two normalized strings
export function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
}

// Compute similarity score between 0 and 1
export function stringSimilarity(str1, str2) {
  const norm1 = normalizeArabic(str1);
  const norm2 = normalizeArabic(str2);
  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  const maxLen = Math.max(norm1.length, norm2.length);
  if (maxLen === 0) return 1.0;

  const dist = levenshteinDistance(norm1, norm2);
  return 1 - dist / maxLen;
}

// Map of famous Quranic shortcuts & keywords
export const FAMOUS_SHORTCUTS = [
  {
    keywords: ['اية الكرسي', 'كرسي', 'الله لا اله الا هو الحي القيوم'],
    surah: 2,
    ayah: 255,
    title: 'آية الكرسي',
    subtitle: 'سورة البقرة (آية 255)'
  },
  {
    keywords: ['اية الدين', 'دين', 'يا ايها الذين امنوا اذا تداينتم'],
    surah: 2,
    ayah: 282,
    title: 'آية الدين',
    subtitle: 'سورة البقرة (آية 282)'
  },
  {
    keywords: ['خواتيم البقرة', 'امن الرسول', 'امن الرسول بما انزل اليه'],
    surah: 2,
    ayah: 285,
    title: 'خواتيم سورة البقرة',
    subtitle: 'سورة البقرة (آية 285 - 286)'
  },
  {
    keywords: ['اية النور', 'الله نور السماوات والأرض', 'نور السماوات'],
    surah: 24,
    ayah: 35,
    title: 'آية النور',
    subtitle: 'سورة النور (آية 35)'
  },
  {
    keywords: ['اية الملك', 'شهد الله', 'قل اللهم مالك الملك'],
    surah: 3,
    ayah: 26,
    title: 'آية الملك',
    subtitle: 'سورة آل عمران (آية 26)'
  },
  {
    keywords: ['سورة يس', 'يس', 'يس والقران الحكيم'],
    surah: 36,
    ayah: 1,
    title: 'سورة يس',
    subtitle: 'سورة 36'
  },
  {
    keywords: ['سورة الكهف', 'الكهف', 'الحمد لله الذي انزل على عبده الكتاب'],
    surah: 18,
    ayah: 1,
    title: 'سورة الكهف',
    subtitle: 'سورة 18'
  },
  {
    keywords: ['سورة تبارك', 'تبارك', 'الملك', 'تبارك الذي بيده الملك'],
    surah: 67,
    ayah: 1,
    title: 'سورة الملك',
    subtitle: 'سورة 67'
  },
  {
    keywords: ['سورة الرحمن', 'الرحمن', 'علم القران'],
    surah: 55,
    ayah: 1,
    title: 'سورة الرحمن',
    subtitle: 'سورة 55'
  },
  {
    keywords: ['سورة الواقعة', 'الواقعة', 'إذا وقعت الواقعة'],
    surah: 56,
    ayah: 1,
    title: 'سورة الواقعة',
    subtitle: 'سورة 56'
  }
];

/**
 * Main Quran Search Function
 * @param {string} rawQuery Search input
 * @param {Object} quranData Cached Quran data object (containing surahs array)
 * @param {Object} options Search options { limit, filterTab }
 */
export function searchQuran(rawQuery, quranData, options = {}) {
  if (!rawQuery || !rawQuery.trim() || !quranData || !quranData.surahs) {
    return {
      surahs: [],
      ayahs: [],
      shortcuts: [],
      juzPages: [],
      didYouMean: [],
      query: rawQuery || ''
    };
  }

  const query = rawQuery.trim();
  const normQuery = normalizeArabic(query);
  const queryTokens = normQuery.split(' ').filter(t => t.length > 0);
  const limit = options.limit || 50;

  const results = {
    surahs: [],
    ayahs: [],
    shortcuts: [],
    juzPages: [],
    didYouMean: [],
    query
  };

  // 1. Check Famous Shortcuts
  FAMOUS_SHORTCUTS.forEach(shortcut => {
    const matched = shortcut.keywords.some(kw => {
      const normKw = normalizeArabic(kw);
      return normQuery.includes(normKw) || normKw.includes(normQuery) || stringSimilarity(normQuery, normKw) > 0.75;
    });
    if (matched) {
      results.shortcuts.push(shortcut);
    }
  });

  // 2. Check Juz & Page direct numbers
  const numberMatch = query.match(/(\d+)/);
  if (numberMatch) {
    const num = parseInt(numberMatch[1]);
    if (normQuery.includes('جزء') || normQuery.includes('juz')) {
      if (num >= 1 && num <= 30) {
        results.juzPages.push({
          type: 'juz',
          number: num,
          title: `الجزء ${num}`,
          subtitle: `Juz ${num}`
        });
      }
    }
    if (normQuery.includes('صفحه') || normQuery.includes('صفحة') || normQuery.includes('page')) {
      if (num >= 1 && num <= 604) {
        results.juzPages.push({
          type: 'page',
          number: num,
          title: `الصفحة ${num}`,
          subtitle: `Page ${num}`
        });
      }
    }
  }

  // Dictionary for typo suggestions (did you mean?)
  const suggestionsMap = new Map();

  // 3. Search Surahs
  quranData.surahs.forEach(surah => {
    const normSurahName = normalizeArabic(surah.name);
    const normEnName = surah.englishName ? surah.englishName.toLowerCase() : '';
    const normEnTrans = surah.englishNameTranslation ? surah.englishNameTranslation.toLowerCase() : '';
    const rawLower = query.toLowerCase();

    let isMatch = false;
    let score = 0;

    // Exact or Substring Match
    if (normSurahName.includes(normQuery) || normQuery.includes(normSurahName)) {
      isMatch = true;
      score = 100;
    } else if (normEnName.includes(rawLower) || normEnTrans.includes(rawLower)) {
      isMatch = true;
      score = 90;
    } else if (surah.number.toString() === query) {
      isMatch = true;
      score = 100;
    } else {
      // Fuzzy Match for Surah Name (Handles "الفقره", "الفاتحه", "ال عمران", etc.)
      const similarity = stringSimilarity(normSurahName, normQuery);
      if (similarity >= 0.65) {
        isMatch = true;
        score = Math.floor(similarity * 80);
        suggestionsMap.set(stripDiacritics(surah.name).replace('سورة ', ''), score);
      }
    }

    if (isMatch) {
      results.surahs.push({
        ...surah,
        score
      });
    }
  });

  // Sort Surahs by score
  results.surahs.sort((a, b) => b.score - a.score);

  // 4. Search Ayahs
  const foundAyahs = [];

  quranData.surahs.forEach(surah => {
    const normSurahName = normalizeArabic(surah.name);

    surah.ayahs.forEach(ayah => {
      const normAyahText = normalizeArabic(ayah.text);
      const cleanAyahText = stripDiacritics(ayah.text);

      let isMatch = false;
      let score = 0;
      let matchType = '';

      // Case A: Exact Substring Match
      if (normAyahText.includes(normQuery)) {
        isMatch = true;
        score = 100;
        matchType = 'exact';
      }
      // Case B: All Query Tokens Present (Token Match)
      else if (queryTokens.length > 1 && queryTokens.every(token => normAyahText.includes(token))) {
        isMatch = true;
        score = 85;
        matchType = 'token';
      }
      // Case C: Fuzzy Word Match (Spell Tolerance for Typos)
      else if (normQuery.length >= 4) {
        const ayahWords = normAyahText.split(' ');
        let bestWordSimilarity = 0;
        let matchedWordsCount = 0;

        for (const qToken of queryTokens) {
          if (qToken.length < 3) continue;
          let bestTokenSim = 0;
          let bestMatchingWord = '';

          for (const aWord of ayahWords) {
            if (Math.abs(aWord.length - qToken.length) > 3) continue;
            
            // Substring or prefix match
            if (aWord.includes(qToken) || qToken.includes(aWord)) {
              bestTokenSim = 0.9;
              bestMatchingWord = aWord;
              break;
            }

            const sim = stringSimilarity(qToken, aWord);
            if (sim > bestTokenSim) {
              bestTokenSim = sim;
              bestMatchingWord = aWord;
            }
          }

          if (bestTokenSim >= 0.70) {
            matchedWordsCount++;
            bestWordSimilarity += bestTokenSim;

            if (bestMatchingWord && bestTokenSim < 0.95 && bestMatchingWord.length > 3) {
              suggestionsMap.set(bestMatchingWord, Math.floor(bestTokenSim * 100));
            }
          }
        }

        // If high proportion of tokens match fuzzily
        if (queryTokens.length > 0 && matchedWordsCount / queryTokens.length >= 0.6) {
          const avgSim = bestWordSimilarity / queryTokens.length;
          if (avgSim >= 0.68) {
            isMatch = true;
            score = Math.floor(avgSim * 75);
            matchType = 'fuzzy';
          }
        }
      }

      if (isMatch) {
        foundAyahs.push({
          surahNumber: surah.number,
          surahName: surah.name,
          surahEnglishName: surah.englishName,
          numberInSurah: ayah.numberInSurah,
          number: ayah.number,
          text: ayah.text,
          cleanText: cleanAyahText,
          normText: normAyahText,
          page: ayah.page,
          juz: ayah.juz,
          score,
          matchType
        });
      }
    });
  });

  // Sort Ayahs by relevance score & length
  foundAyahs.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Prefer shorter ayahs for same score
    return a.normText.length - b.normText.length;
  });

  results.ayahs = foundAyahs.slice(0, limit);

  // 5. Build "Did You Mean?" Suggestions if results are small or fuzzy
  if (results.ayahs.length < 5 || results.surahs.length === 0) {
    const sortedSuggestions = Array.from(suggestionsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .filter(s => normalizeArabic(s) !== normQuery)
      .slice(0, 4);

    results.didYouMean = sortedSuggestions;
  }

  return results;
}

/**
 * Highlight Query Matches in Ayah / Surah Text
 * @param {string} text Full text to display
 * @param {string} rawQuery Search input
 * @returns {string} HTML with <mark> tags around matched words
 */
export function highlightMatches(text, rawQuery) {
  if (!text || !rawQuery || !rawQuery.trim()) return text;

  const normQuery = normalizeArabic(rawQuery);
  const queryTokens = normQuery.split(' ').filter(t => t.length > 1);

  if (queryTokens.length === 0) return text;

  // Split text into words to match normalized words with original words
  const words = text.split(/(\s+)/);

  return words.map(part => {
    if (/^\s+$/.test(part)) return part;

    const normWord = normalizeArabic(part);
    const isMatched = queryTokens.some(token => {
      if (normWord.includes(token)) return true;
      if (token.length > 3 && normWord.length > 3) {
        return stringSimilarity(normWord, token) >= 0.72;
      }
      return false;
    });

    if (isMatched) {
      return `<mark class="search-highlight">${part}</mark>`;
    }
    return part;
  }).join('');
}
