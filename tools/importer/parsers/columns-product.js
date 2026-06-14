/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-product.
 * Base block: columns.
 * Source: https://www.intuit.com/ (section[data-section="product-showcase"] div[data-panel])
 * Generated: 2026-06-14
 *
 * Each div[data-panel] is the inner two-column layout of a product-showcase panel:
 *   - One side: large customer photo
 *   - Other side: logo + uppercase product eyebrow + heading + paragraph + "Go to <product>" link
 *
 * Target structure (columns base): row1 = block name, row2 = two cells [image | content]
 * that render as side-by-side responsive columns (image left, content right).
 */
export default function parse(element, { document }) {
  // Customer photo: first top-level image in the panel (not the inline logo inside the eyebrow paragraph).
  const customerImage = element.querySelector(':scope > img, :scope > picture')
    || Array.from(element.querySelectorAll('img')).find((img) => !img.closest('p'));

  // Eyebrow: paragraph containing the product logo image + uppercase product name.
  const eyebrow = Array.from(element.querySelectorAll(':scope > p')).find((p) => p.querySelector('img'));

  // Heading.
  const heading = element.querySelector(':scope > h1, :scope > h2, :scope > h3, h2');

  // Body paragraph: a top-level paragraph that has neither an image (eyebrow) nor a link (CTA).
  const bodyParagraph = Array.from(element.querySelectorAll(':scope > p')).find(
    (p) => !p.querySelector('img') && !p.querySelector('a'),
  );

  // CTA: the "Go to <product>" link (within its paragraph, if present).
  const ctaParagraph = Array.from(element.querySelectorAll(':scope > p')).find((p) => p.querySelector('a'));
  const ctaLink = ctaParagraph ? ctaParagraph.querySelector('a') : element.querySelector('a');

  // Build the content cell in source order: eyebrow, heading, body, CTA.
  const contentCell = [];
  if (eyebrow) contentCell.push(eyebrow);
  if (heading) contentCell.push(heading);
  if (bodyParagraph) contentCell.push(bodyParagraph);
  if (ctaLink) contentCell.push(ctaParagraph || ctaLink);

  // Image cell.
  const imageCell = customerImage ? [customerImage] : [];

  const cells = [
    [imageCell, contentCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-product', cells });
  element.replaceWith(block);
}
