// Utility to manage Quran text editions and audio reciters

export const QURAN_EDITIONS = [
  { id: 'default', name: 'حفص عن عاصم (الافتراضي)', type: 'hafs' },
  { id: 'quran-uthmani-warsh', name: 'ورش عن نافع (رسم عثماني)', type: 'warsh' },
  { id: 'quran-uthmani-qalon', name: 'قالون عن نافع (رسم عثماني)', type: 'qaloon' },
  { id: 'quran-uthmani-doori', name: 'الدوري عن أبي عمرو (رسم عثماني)', type: 'doori' }
];

export const AUDIO_RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري راشد العفاسي (حفص)', type: 'hafs' },
  { id: 'ar.husary', name: 'محمود خليل الحصري (حفص)', type: 'hafs' },
  { id: 'ar.husarymujawwad', name: 'محمود خليل الحصري (مجود)', type: 'hafs' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد (مرتل)', type: 'hafs' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي (مرتل)', type: 'hafs' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي (حفص)', type: 'hafs' },
  { id: 'ar.abdullahbasfar', name: 'عبد الله بصفر (حفص)', type: 'hafs' }
];

const editionCache = {};

/**
 * Fetch the Quran dataset for a specific edition (Rewayah).
 * @param {string} editionId - The ID of the edition (e.g., 'quran-uthmani-warsh')
 * @returns {Promise<Object>} The Quran data object in a format similar to the default quran.json
 */
export async function fetchQuranEdition(editionId) {
  if (editionCache[editionId]) {
    return editionCache[editionId];
  }

  try {
    if (!editionId || editionId === 'default' || editionId === 'quran-uthmani') {
      const res = await fetch('/src/quran/quran.json');
      const data = await res.json();
      const actualData = data.data ? data.data : data;
      editionCache['default'] = actualData;
      return actualData;
    }

    const res = await fetch(`https://api.alquran.cloud/v1/quran/${editionId}`);
    const json = await res.json();
    
    if (json && json.data) {
      editionCache[editionId] = json.data;
      return json.data;
    }
    
    throw new Error('Invalid response from API');
  } catch (error) {
    console.error('Error fetching Quran edition:', error);
    const res = await fetch('/src/quran/quran.json');
    const data = await res.json();
    return data.data ? data.data : data;
  }
}
