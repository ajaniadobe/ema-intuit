/* eslint-disable */
/* global WebImporter */
/**
 * Parser for advanced-tabs-product.
 * Base block: advanced-tabs / tabs.
 * Source: https://www.intuit.com/ (section[data-section="product-showcase"]).
 * Generated: 2026-06-14
 *
 * Output table (per library example/description):
 *   Row 1: block name ("Tabs", 2 columns)
 *   Row N: [ Tab Label | Tab Content ]
 *
 * Each tab content cell holds the panel markup (customer photo + logo + uppercase
 * eyebrow + heading + paragraph + "Go to <product>" link). The inner image|content
 * two-column split is authored as a separate columns-product block inside the panel,
 * so this parser emits the panel content verbatim and does not split it.
 *
 * Tab labels come from the page's tab navigation, not the panel body. They are mapped
 * by the panel's data-panel key, with a fallback to the panel eyebrow text.
 *
 * Mapping (data-panel -> tab nav label):
 *   turbotax     -> "Your taxes done right"
 *   creditkarma  -> "Make financial progress"
 *   quickbooks   -> "Run your business"
 *   mailchimp    -> "Grow your business"
 */
export default function parse(element, { document }) {
  // Tab navigation labels keyed by data-panel (from the source tab nav).
  const tabLabels = {
    turbotax: 'Your taxes done right',
    creditkarma: 'Make financial progress',
    quickbooks: 'Run your business',
    mailchimp: 'Grow your business',
  };

  // Each panel is a direct switchable tab panel within the showcase section.
  const panels = Array.from(element.querySelectorAll(':scope > div[data-panel]'));

  const cells = [];

  panels.forEach((panel) => {
    const key = (panel.getAttribute('data-panel') || '').trim().toLowerCase();

    // Resolve the tab label: prefer the mapped nav label, fall back to the
    // uppercase eyebrow text (e.g. "TURBOTAX") if no mapping is found.
    let label = tabLabels[key];
    if (!label) {
      // Eyebrow paragraph: contains a logo image followed by uppercase product text.
      const eyebrow = panel.querySelector('p img')
        ? panel.querySelector('p img').closest('p')
        : null;
      const eyebrowText = eyebrow ? eyebrow.textContent.trim() : '';
      label = eyebrowText || key;
    }

    // Tab content = the panel element itself, kept intact so the columns-product
    // parser (selector div[data-panel]) can transform its image|content split in
    // place. We keep the data-panel element rather than flattening its children.
    cells.push([label, panel]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'advanced-tabs-product',
    cells,
  });

  element.replaceWith(block);
}
