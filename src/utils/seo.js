/**
 * Utility for dynamic SEO management in Warteel App
 * Updates title, meta description, OpenGraph, Twitter tags, canonical URLs, and Schema.org JSON-LD.
 */

export function updateSEO({
  title = 'وَرْتِيل | Warteel - القرآن الكريم كاملاً قراءة واستماع وتفسير',
  description = 'تطبيق ورتيل للقرآن الكريم: قراءة المصحف الشريف بالرسم العثماني، التفسير الميسر، التلاوة الصوتية، التتبع الصوتي والتكرار، مواقيت الصلاة والأذكار.',
  keywords = 'القرآن الكريم, سورة, آية, تفسير القرآن, المصحف الشريف, ورتيل, warteel, مواقيت الصلاة, الأذكار, استماع القرآن',
  url = window.location.href,
  ogType = 'website',
  ogImage = window.location.origin + '/logo.png',
  jsonLd = null
}) {
  // 1. Update Title
  document.title = title;

  // 2. Helper to set or create meta tag
  const setMetaTag = (selector, attribute, value) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      if (selector.startsWith('meta[name=')) {
        const nameMatch = selector.match(/name="([^"]+)"/);
        if (nameMatch) element.setAttribute('name', nameMatch[1]);
      } else if (selector.startsWith('meta[property=')) {
        const propMatch = selector.match(/property="([^"]+)"/);
        if (propMatch) element.setAttribute('property', propMatch[1]);
      }
      document.head.appendChild(element);
    }
    element.setAttribute(attribute, value);
  };

  // 3. Basic Meta Tags
  setMetaTag('meta[name="description"]', 'content', description);
  setMetaTag('meta[name="keywords"]', 'content', keywords);
  setMetaTag('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // 4. OpenGraph Meta Tags
  setMetaTag('meta[property="og:site_name"]', 'content', 'وَرْتِيل | Warteel');
  setMetaTag('meta[property="og:title"]', 'content', title);
  setMetaTag('meta[property="og:description"]', 'content', description);
  setMetaTag('meta[property="og:type"]', 'content', ogType);
  setMetaTag('meta[property="og:url"]', 'content', url);
  setMetaTag('meta[property="og:image"]', 'content', ogImage);
  setMetaTag('meta[property="og:locale"]', 'content', 'ar_SA');

  // 5. Twitter Meta Tags
  setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'content', title);
  setMetaTag('meta[name="twitter:description"]', 'content', description);
  setMetaTag('meta[name="twitter:image"]', 'content', ogImage);

  // 6. Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url.split('?')[0].split('#')[0]);

  // 7. Schema.org JSON-LD Structured Data
  let jsonLdScript = document.getElementById('json-ld-seo');
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.id = 'json-ld-seo';
    jsonLdScript.type = 'application/ld+json';
    document.head.appendChild(jsonLdScript);
  }

  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': window.location.origin + '/#website',
        'url': window.location.origin,
        'name': 'وَرْتِيل - Warteel',
        'description': description,
        'inLanguage': 'ar',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': window.location.origin + '/?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };

  if (jsonLd) {
    if (jsonLd['@context']) {
      defaultJsonLd['@graph'].push(jsonLd);
    } else if (Array.isArray(jsonLd)) {
      defaultJsonLd['@graph'].push(...jsonLd);
    }
  }

  jsonLdScript.textContent = JSON.stringify(defaultJsonLd, null, 2);
}

/**
 * Generate SEO metadata specifically for a Quran Surah or Ayah
 */
export function updateQuranSurahSEO(surahData, ayahNum = null) {
  if (!surahData) return;

  const surahName = surahData.name || `سورة رقم ${surahData.number}`;
  const surahEngName = surahData.englishName || '';
  const numberOfAyahs = surahData.numberOfAyahs || '';
  const revelationType = surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية';

  let title = '';
  let description = '';
  let keywords = '';

  if (ayahNum) {
    title = `سورة ${surahName} آية ${ayahNum} - القرآن الكريم مكتوب ومسموع | تطبيق ورتيل`;
    description = `قراءة واستماع الآية رقم ${ayahNum} من سورة ${surahName} بالرسم العثماني مع التفسير الميسر وأسباب النزول وإعراب القرآن في تطبيق ورتيل.`;
    keywords = `سورة ${surahName} آية ${ayahNum}, آية ${ayahNum} سورة ${surahName}, تفسير سورة ${surahName}, آيات القرآن الكريم, ورتيل`;
  } else {
    title = `سورة ${surahName} (${surahEngName}) مكتوبة كاملة بالرسم العثماني والتفسير | ورتيل`;
    description = `اقرأ واستمع إلى سورة ${surahName} كاملة (${numberOfAyahs} آية - ${revelationType}) بالرسم العثماني مع التفسير الميسر، أسباب النزول، التلاوة الصوتية بأجمل الأصوات في تطبيق ورتيل.`;
    keywords = `سورة ${surahName}, قراءة سورة ${surahName}, استماع سورة ${surahName}, تفسير سورة ${surahName}, سورة ${surahName} مكتوبة, القرآن الكريم, ورتيل`;
  }

  const surahJsonLd = {
    '@type': 'Chapter',
    'name': `سورة ${surahName}`,
    'alternateName': surahEngName,
    'position': surahData.number,
    'inLanguage': 'ar',
    'isPartOf': {
      '@type': 'Book',
      'name': 'القرآن الكريم',
      'inLanguage': 'ar'
    },
    'description': description
  };

  updateSEO({
    title,
    description,
    keywords,
    url: window.location.href,
    ogType: 'article',
    jsonLd: surahJsonLd
  });
}
