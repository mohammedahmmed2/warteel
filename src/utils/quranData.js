import { fetchQuranEdition } from './quranEditions.js';

export async function getQuranData(editionId = 'default') {
  if (window.quranDataCache && window.quranDataCacheEdition === editionId) {
    return window.quranDataCache;
  }
  const data = await fetchQuranEdition(editionId);
  window.quranDataCache = data;
  window.quranDataCacheEdition = editionId;
  return window.quranDataCache;
}
