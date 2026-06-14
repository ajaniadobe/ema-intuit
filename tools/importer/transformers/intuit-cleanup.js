/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Intuit site-wide cleanup.
 *
 * Removes non-authorable global chrome so the import contains only the 5
 * page-level content sections (hero, product-showcase, customer-success,
 * innovation, driving-success). The Intuit homepage is a single <main> of
 * content sections; the header (mega-menu "navigation Primary"), footer
 * ("contentinfo": multi-column links + country switcher + brand logos +
 * legal), and cookie/consent chrome (OneTrust "Privacy" dialog + TRUSTe seal)
 * are global blocks/fragments, NOT page content.
 *
 * Selector sources (all verified against the live DOM and captured artifacts):
 *  - Live DOM (https://www.intuit.com/): header is <nav> role="navigation"
 *    aria-label "Primary" plus a "Main navigation" dialog; footer is
 *    role="contentinfo"; cookie consent is a role="dialog" "Privacy" panel
 *    (OneTrust) plus an "Allow Information Sharing" alert region.
 *  - migration-work/page-structure.json globalChrome: documents the
 *    mega-menu header, multi-column footer + country switcher + brand logos,
 *    OneTrust consent, and TRUSTe seal as non-authorable global chrome.
 *  - migration-work/metadata.json assetClassification.staticBakedIntoCode:
 *    OneTrust consent logos and the TRUSTe seal listed as global chrome.
 *  - migration-work/cleaned.html: authorable content is the 5
 *    <section data-section="..."> elements inside <main>; everything else is
 *    non-authorable.
 *
 * NOTE: No module-scope lexical declarations (const/let). The validator injects
 * the transformer into the page's global scope as a classic script; a top-level
 * `const` collides on re-injection ("Identifier already declared") and aborts
 * the script. Hook names are used as inline string literals instead.
 */

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Cookie / consent overlays and modal chrome (live DOM: OneTrust "Privacy"
    // dialog + "Allow Information Sharing" alert; metadata.json: OneTrust +
    // TRUSTe). Removed before parsing so overlays do not block block matching.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '.onetrust-pc-dark-filter',
      '.ot-sdk-container',
      '[id*="onetrust"]',
      '[class*="onetrust"]',
      '[id*="truste"]',
      '[class*="truste"]',
      '[class*="cookie"]',
      '[id*="cookie"]',
      '[role="alertdialog"]',
    ]);
  }

  if (hookName === 'afterTransform') {
    // Global chrome: mega-menu header ("navigation Primary"), multi-column
    // footer ("contentinfo"), and nav. (Live DOM + page-structure.json
    // globalChrome: auto-populated via header/footer blocks/fragments.)
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      '[role="banner"]',
      '[role="navigation"]',
      '[role="contentinfo"]',
      '[aria-label="Primary"]',
      '[aria-label="Main navigation"]',
      '[class*="header"]',
      '[class*="footer"]',
      '[class*="navigation"]',
      '[class*="megamenu"]',
      '[class*="mega-menu"]',
      '[class*="country-switcher"]',
    ]);

    // Safe leftover / non-authorable elements.
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'iframe',
      'link',
      'source',
      'template',
      'svg[aria-hidden="true"]',
    ]);

    // Strip tracking / analytics attributes where present.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-tracking');
      el.removeAttribute('data-wa-link');
    });
  }
}
