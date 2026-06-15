/* eslint-disable */
/* global WebImporter */
/**
 * Parser for card-stats. Base block: cards.
 * Source: https://www.intuit.com/company/ (section[data-section="4"] .stats)
 * Generated: 2026-06-15T02:44:32Z
 *
 * Block: Intuit Company "Fast Facts / by-the-numbers" stat grid.
 * The element (div.stats) contains multiple div.stat children, each with:
 *   - <h3> large number/figure (e.g. "18,200", "21", "$18.83B")
 *   - <p> descriptive label
 *   - <img> small accompanying image
 * No outbound links.
 *
 * Output (cards base, "stats" variant) per library example/description:
 *   row 1: block name
 *   each subsequent row: [number + label (content cell) | image (image cell)]
 * Single block instance — all stats emitted as rows within one block.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each stat card becomes one content row: [content | image]
  const stats = element.querySelectorAll(':scope > .stat');
  stats.forEach((stat) => {
    // Number (h3) + descriptive label (p) go together in the content cell.
    const number = stat.querySelector('h3, h2, [class*="number"], [class*="figure"]');
    const label = stat.querySelector('p, [class*="label"], [class*="description"]');
    // Small accompanying image goes in the image cell.
    const image = stat.querySelector('img');

    const contentCell = [];
    if (number) contentCell.push(number);
    if (label) contentCell.push(label);

    cells.push([contentCell, image].map((c) => (c == null ? '' : c)));
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'card-stats', cells });
  element.replaceWith(block);
}
