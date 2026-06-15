/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCompanyParser from './parsers/hero-company.js';
import cardArticlesParser from './parsers/card-articles.js';
import cardStatsParser from './parsers/card-stats.js';
import carouselStoriesParser from './parsers/carousel-stories.js';
import columnsProductParser from './parsers/columns-product.js';
import cardLinktileParser from './parsers/card-linktile.js';

// TRANSFORMER IMPORTS
import companyNormalizeTransformer from './transformers/intuit-company-normalize.js';
import cleanupTransformer from './transformers/intuit-cleanup.js';
import sectionsTransformer from './transformers/intuit-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-company': heroCompanyParser,
  'card-articles': cardArticlesParser,
  'card-stats': cardStatsParser,
  'carousel-stories': carouselStoriesParser,
  'columns-product': columnsProductParser,
  'card-linktile': cardLinktileParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json "company")
const PAGE_TEMPLATE = {
  name: 'company',
  description: 'Intuit Company landing page (corporate about): light hero, blog card grid, fast-facts stat cards, customer-stories carousel, two columns splits, and a link-tile row.',
  urls: ['https://www.intuit.com/company/'],
  blocks: [
    { name: 'hero-company', instances: ['section[data-section="1"] .hero'] },
    { name: 'card-articles', instances: ['section[data-section="3"] .article-cards'] },
    { name: 'card-stats', instances: ['section[data-section="4"] .stats'] },
    { name: 'carousel-stories', instances: ['section[data-section="5"] .stories-carousel'] },
    {
      name: 'columns-product',
      instances: [
        'section[data-section="6"] .columns',
        'section[data-section="7"] .columns',
      ],
    },
    { name: 'card-linktile', instances: ['section[data-section="8"] .link-tiles'] },
    { name: 'section-stand-for', instances: ['section[data-section="2"]'], section: 'light' },
    { name: 'section-blog', instances: ['section[data-section="3"]'], section: 'light' },
    { name: 'section-fast-facts', instances: ['section[data-section="4"]'], section: 'light' },
    { name: 'section-stories', instances: ['section[data-section="5"]'], section: 'light' },
    { name: 'section-products', instances: ['section[data-section="6"]'], section: 'light' },
    { name: 'section-beyond', instances: ['section[data-section="7"]'], section: 'light' },
    { name: 'section-together', instances: ['section[data-section="8"]'], section: 'light-green' },
  ],
};

// TRANSFORMER REGISTRY (company normalize runs FIRST in beforeTransform to tag
// live-DOM landmarks with the clean class anchors the parsers expect; cleanup
// runs next as a safety net; sections runs after parsing in afterTransform)
const transformers = [
  companyNormalizeTransformer,
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

    // 1. beforeTransform (normalize live DOM -> clean anchors, then cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks.
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

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
