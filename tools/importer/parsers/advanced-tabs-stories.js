/* eslint-disable */
/* global WebImporter */
/**
 * Parser for advanced-tabs-stories.
 * Base block: advanced-tabs (tabs)
 * Source: https://www.intuit.com/  (section[data-section="customer-success"])
 * Generated: 2026-06-14
 *
 * Structure (per library example + description):
 *   row 1: block name
 *   each subsequent row: [Tab Label | Tab Content]
 *
 * For this Intuit customer-success component, each audience pill
 * (div[data-pill]) is one tab. The tab label comes from the pill's <h3>,
 * and the tab content cell holds the nested slide carousel markup. The
 * inner per-audience carousel is transformed separately by the
 * carousel-stories parser (selector div[data-pill]), so we keep the
 * div[data-pill] element intact (minus its label heading) in the content
 * cell for that parser to handle in place.
 *
 * Note: the heading "How Intuit drives success for" is default content
 * ABOVE the block and is intentionally NOT consumed here.
 */
export default function parse(element, { document }) {
  // Each audience pill becomes one tab row. Use :scope > to avoid matching
  // any nested elements that might also carry a data-pill attribute.
  const pills = Array.from(element.querySelectorAll(':scope > div[data-pill]'));

  const cells = [];

  pills.forEach((pill) => {
    // Tab label: the pill's heading (audience name).
    const labelEl = pill.querySelector(':scope > h3, h3, h2, [class*="title"]');
    const label = labelEl ? labelEl.textContent.trim() : (pill.getAttribute('data-pill') || '');

    // Remove the label heading from the carousel content so it isn't
    // duplicated inside the nested carousel block; the label already lives
    // in the tab-label cell.
    if (labelEl) labelEl.remove();

    // Tab content: the pill element itself, which contains the slide
    // carousel. The carousel-stories parser (div[data-pill]) transforms it.
    cells.push([label, pill]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'advanced-tabs-stories',
    cells,
  });

  // Preserve the section's leading heading ("How Intuit drives success for")
  // as default content above the block. It is a direct child of the section
  // (a sibling of the pills), so replacing the whole section would otherwise
  // discard it.
  const heading = element.querySelector(':scope > h1, :scope > h2');
  if (heading) {
    element.replaceWith(heading, block);
  } else {
    element.replaceWith(block);
  }
}
