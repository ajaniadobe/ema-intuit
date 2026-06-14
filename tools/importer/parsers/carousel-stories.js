/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-stories. Base block: carousel.
 * Source: https://www.intuit.com/ (per-audience customer-story carousel)
 * Selector: section[data-section="customer-success"] div[data-pill]
 * Generated: 2026-06-14
 *
 * Each div[data-pill] is one carousel instance. Inside it are div[data-slide] slides.
 * Each slide = customer photo (first <img>) + optional small brand logos (subsequent <img>)
 *   + a quote paragraph + a "Read/Watch ... story" link paragraph.
 * Table shape (carousel): row1 = block name; each subsequent row = [Image | content].
 * Emit one row per slide: [customer photo | optional brand logos + quote paragraph + story link].
 *
 * Notes:
 * - The data-video overlay (e.g. "1:34") is a UI affordance, not editorial content — not emitted.
 * - Some Mid-Market "Watch his/her story" links point to https://www.intuit.com/ — preserved as-is.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each direct-child div[data-slide] is one carousel slide → one row.
  const slides = Array.from(element.querySelectorAll(':scope > div[data-slide]'));

  slides.forEach((slide) => {
    const images = Array.from(slide.querySelectorAll(':scope > img'));
    // First image is the customer photo; remaining images are small brand logos.
    const photo = images.length ? images[0] : null;
    const logos = images.slice(1);

    // Paragraphs: quote paragraph(s) and the story-link paragraph (link preserved verbatim).
    const paragraphs = Array.from(slide.querySelectorAll(':scope > p'));

    const contentCell = [];
    // Brand logos (if any) precede the quote in the content cell.
    contentCell.push(...logos);
    contentCell.push(...paragraphs);

    cells.push([photo ? [photo] : '', contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-stories', cells });
  element.replaceWith(block);
}
