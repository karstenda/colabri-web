import { useEffect } from 'react';

// Track usage count for each font URL to prevent premature removal
const fontUsageCount: Record<string, number> = {};

/**
 * Hook to load fonts from Google Fonts.
 * @param fontFamilies Array of font family names (e.g., ['Roboto', 'Open Sans'])
 */
export const useGoogleFonts = (fontFamilies: string[]) => {
  useEffect(() => {
    if (!fontFamilies || fontFamilies.length === 0) {
      return;
    }

    // Filter valid font families and format them for the URL
    const formattedFamilies = fontFamilies
      .filter(Boolean)
      .map((family) => family.trim().replace(/\s+/g, '+'));

    if (formattedFamilies.length === 0) {
      return;
    }

    // Construct the Google Fonts URL
    // Requesting common weights: 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold)
    const familiesQuery = formattedFamilies
      .map((family) => `family=${family}:wght@300;400;500;700`)
      .join('&');

    const href = `https://fonts.googleapis.com/css2?${familiesQuery}&display=swap`;

    // Initialize count if not present
    if (!fontUsageCount[href]) {
      fontUsageCount[href] = 0;
    }

    // Increment usage count
    fontUsageCount[href]++;

    // Add preconnect links for performance (idempotent)
    const preconnectUrls = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];
    preconnectUrls.forEach((url) => {
      if (!document.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        if (url === 'https://fonts.gstatic.com') {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      }
    });

    // Only add the stylesheet if it's not already in the DOM
    let link = document.querySelector(
      `link[href="${href}"]`,
    ) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.href = href;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Cleanup: Decrement count and remove if no longer used
    return () => {
      fontUsageCount[href]--;
      if (fontUsageCount[href] <= 0) {
        const linkToRemove = document.querySelector(`link[href="${href}"]`);
        if (linkToRemove && document.head.contains(linkToRemove)) {
          document.head.removeChild(linkToRemove);
        }
        delete fontUsageCount[href];
      }
    };
  }, [fontFamilies.join(',')]); // Re-run only if the list of fonts changes
};
