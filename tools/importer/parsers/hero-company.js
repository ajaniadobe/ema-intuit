/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-company.
 * Base block: hero (block-collection format).
 * Source: https://www.intuit.com/company/ — section[data-section="1"] .hero
 * Generated: 2026-06-15
 *
 * Variant: LIGHT, image-beside-text hero (distinct from the dark
 * homepage hero-platform). Customer photo on one side, eyebrow + heading
 * + supporting paragraph on the other. No CTA.
 *
 * Block library structure (1 column):
 *   row1 = block name
 *   row2 = image cell (the customer photo)
 *   row3 = content cell: eyebrow + h1 + supporting paragraph
 *
 * Source DOM:
 *   <div class="hero">
 *     <img ...>                              -> row2 image
 *     <div class="hero-content">
 *       <p class="eyebrow">OUR MISSION</p>   -> row3 eyebrow
 *       <h1>...</h1>                          -> row3 heading
 *       <p>...</p>                            -> row3 supporting paragraph
 *     </div>
 *   </div>
 */
export default function parse(element, { document }) {
  // Image — the customer photo. Prefer a direct child <img> of the hero,
  // fall back to any hero image / <picture> source for resilience.
  const image = element.querySelector(':scope > img, :scope > picture img, img[class*="hero"], picture img');

  // Content wrapper holding the textual content.
  const content = element.querySelector('.hero-content') || element;

  // Eyebrow — small label above the heading (e.g. "OUR MISSION").
  const eyebrow = content.querySelector('.eyebrow, [class*="eyebrow"]');

  // Heading — primary headline.
  const heading = content.querySelector('h1, h2, .hero-title, [class*="title"]');

  // Supporting paragraph — the first <p> that is NOT the eyebrow and not a CTA wrapper.
  const supporting = Array.from(content.querySelectorAll('p'))
    .find((p) => !p.classList.contains('eyebrow')
      && !p.className.toLowerCase().includes('eyebrow')
      && !p.querySelector('a'));

  const cells = [];

  // Row 2: single image cell (customer photo)
  if (image) {
    cells.push([image]);
  }

  // Row 3: a single content cell holding eyebrow + heading + supporting paragraph
  // stacked together. The cell is itself an array so createTable groups all
  // nodes into ONE <td> (one column) rather than splitting into multiple cells.
  const contentCell = [];
  if (eyebrow) contentCell.push(eyebrow);
  if (heading) contentCell.push(heading);
  if (supporting) contentCell.push(supporting);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-company', cells });
  element.replaceWith(block);
}
