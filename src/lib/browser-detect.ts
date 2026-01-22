import type { BrowserInfo } from '@/types';

export function getBrowserInfo(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      isVanadium: false,
      isBrave: false,
      isFirefox: false,
      pushReliability: 'unknown',
    };
  }

  const ua = navigator.userAgent;
  const isVanadium = ua.includes('Vanadium');
  const isBrave = !!(navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } }).brave;
  const isFirefox = ua.includes('Firefox');
  const isChrome = ua.includes('Chrome') && !isBrave && !isVanadium;

  let pushReliability: 'good' | 'poor' | 'unknown' = 'unknown';

  if (isBrave || isFirefox) {
    pushReliability = 'good';
  } else if (isVanadium) {
    pushReliability = 'poor';
  } else if (isChrome) {
    pushReliability = 'good';
  }

  return {
    isVanadium,
    isBrave,
    isFirefox,
    pushReliability,
  };
}
