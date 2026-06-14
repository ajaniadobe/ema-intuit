/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPlatformParser from './parsers/hero-platform.js';
import advancedTabsProductParser from './parsers/advanced-tabs-product.js';
import columnsProductParser from './parsers/columns-product.js';
import advancedTabsStoriesParser from './parsers/advanced-tabs-stories.js';
import carouselStoriesParser from './parsers/carousel-stories.js';
import cardArticlesParser from './parsers/card-articles.js';
import cardLinktileParser from './parsers/card-linktile.js';

// TRANSFORMER IMPORTS
import normalizeTransformer from './transformers/intuit-normalize.js';
import cleanupTransformer from './transformers/intuit-cleanup.js';
import sectionsTransformer from './transformers/intuit-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-platform': heroPlatformParser,
  'advanced-tabs-product': advancedTabsProductParser,
  'columns-product': columnsProductParser,
  'advanced-tabs-stories': advancedTabsStoriesParser,
  'carousel-stories': carouselStoriesParser,
  'card-articles': cardArticlesParser,
  'card-linktile': cardLinktileParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Intuit en-US homepage: hero, product showcase tabs, customer success carousel, innovation card grid, and link-card row.',
  urls: ['https://www.intuit.com/'],
  blocks: [
    { name: 'hero-platform', instances: ['section[data-section="hero"]'] },
    { name: 'advanced-tabs-product', instances: ['section[data-section="product-showcase"]'] },
    { name: 'columns-product', instances: ['section[data-section="product-showcase"] div[data-cols]'] },
    { name: 'advanced-tabs-stories', instances: ['section[data-section="customer-success"]'] },
    { name: 'carousel-stories', instances: ['section[data-section="customer-success"] div[data-carousel]'] },
    { name: 'card-articles', instances: ['section[data-section="innovation"] div[data-cards]'] },
    { name: 'card-linktile', instances: ['section[data-section="driving-success"] div[data-cards]'] },
    { name: 'section-product-showcase', instances: ['section[data-section="product-showcase"]'], section: 'light-grey' },
    { name: 'section-customer-success', instances: ['section[data-section="customer-success"]'], section: 'light' },
    { name: 'section-innovation', instances: ['section[data-section="innovation"]'], section: 'light' },
    { name: 'section-driving-success', instances: ['section[data-section="driving-success"]'], section: 'sky-blue' },
  ],
};

// TRANSFORMER REGISTRY (normalize runs FIRST in beforeTransform to tag live-DOM
// landmarks with the data-* anchors the parsers expect; cleanup runs next as a
// safety net; sections runs after parsing in afterTransform)
const transformers = [
  normalizeTransformer,
  cleanupTransformer,
  sectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all block instances on the page using the embedded template.
 * Skips section-* entries (handled by the sections transformer, not parsers).
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks
    .filter((blockDef) => !blockDef.name.startsWith('section-'))
    .forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null,
          });
        });
      });
    });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks. Parse inner blocks (columns-product, carousel-stories)
    //    BEFORE their wrapping blocks so the wrappers capture already-transformed inner markup.
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    const innerFirst = ['columns-product', 'carousel-stories'];
    pageBlocks.sort((a, b) => {
      const ai = innerFirst.includes(a.name) ? 0 : 1;
      const bi = innerFirst.includes(b.name) ? 0 : 1;
      return ai - bi;
    });

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
