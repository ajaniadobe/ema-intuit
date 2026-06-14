/* eslint-disable */
/* global WebImporter */
/**
 * Parser for card-linktile. Base block: cards.
 * Source: https://www.intuit.com/ ("Driving success together" row).
 * Generated: 2026-06-14
 *
 * Source structure: div[data-cards] containing N div[data-card] children.
 * Each tile is a clickable <a href> wrapping an <img> and an <h3> heading.
 * The whole tile links to a destination, so the heading is emitted as a link
 * to the tile's href.
 *
 * Output (cards base block): 2 columns.
 *   row 1: block name
 *   each subsequent row: [tile image | heading as link to tile destination]
 *
 * NOTE: element here is the single div[data-cards] block instance containing
 * all tiles as rows — a single block, NOT one block per tile.
 *
 * Output: cards block, 2 columns. row1=block name; one row per tile.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each direct card tile. Validated against source.html: div[data-card] children.
  const tiles = Array.from(element.querySelectorAll(':scope > [data-card]'));

  tiles.forEach((tile) => {
    // The clickable wrapper that carries the destination href.
    const link = tile.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;

    // Tile image.
    const img = tile.querySelector('img');

    // Tile heading (h3 in source; fallbacks for variation).
    const heading = tile.querySelector('h3, h2, h4, [class*="title"]');

    // Build the content cell: heading rendered as a link to the tile destination.
    const contentCell = [];
    if (heading) {
      if (href) {
        const anchor = document.createElement('a');
        anchor.setAttribute('href', href);
        anchor.textContent = heading.textContent.trim();
        contentCell.push(anchor);
      } else {
        contentCell.push(heading);
      }
    } else if (href && link) {
      // Fallback: no heading element, use the link text directly.
      const anchor = document.createElement('a');
      anchor.setAttribute('href', href);
      anchor.textContent = link.textContent.trim();
      contentCell.push(anchor);
    }

    cells.push([img, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'card-linktile', cells });
  element.replaceWith(block);
}
