/* eslint-disable */
/* global WebImporter */
/**
 * Parser for card-articles. Base block: cards.
 * Source: https://www.intuit.com/ (Innovation, action, and impact card grid)
 * Generated: 2026-06-14
 *
 * The block element is div[data-cards] containing N div[data-card] children.
 * Each card becomes one row in the cards table:
 *   [ image (cell omitted if card has no image) | category + heading + optional subheading + link ]
 * Some cards have data-no-image="true" (no <img>) and one is a CTA card
 * (data-cta-card="true") with only a heading + link.
 * This produces a SINGLE cards block whose rows are the individual cards.
 */
export default function parse(element, { document }) {
  // Direct children cards only (avoid selecting any nested div in the future)
  const cards = Array.from(element.querySelectorAll(':scope > div[data-card]'));

  const cells = [];

  cards.forEach((card) => {
    const image = card.querySelector(':scope > img, img');

    // Content nodes in their natural document order: eyebrow/category label,
    // heading, optional subheading/description, and the CTA link.
    // Iterating direct children in order preserves: category -> heading ->
    // [subheading] -> link, exactly as in source.html.
    const contentCell = [];

    Array.from(card.children).forEach((child) => {
      const tag = child.tagName.toLowerCase();
      // Skip the image; it belongs in the left cell.
      if (tag === 'img') return;
      // Keep paragraphs (eyebrow, subheading, link wrappers) and headings as-is.
      contentCell.push(child);
    });

    if (image) {
      cells.push([image, contentCell]);
    } else {
      // No image: emit a single-cell row (matches the 'no images' variant)
      cells.push([contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'card-articles', cells });
  element.replaceWith(block);
}
