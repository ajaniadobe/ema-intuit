/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-platform.
 * Base block: hero (block-collection format).
 * Source: https://www.intuit.com/ — section[data-section="hero"]
 * Generated: 2026-06-14 (revalidated)
 *
 * Block library structure (1 column):
 *   row1 = block name
 *   row2 = background image (OPTIONAL — only when an author-editorial image exists)
 *   row3 = title / subheading / CTA combined into one cell
 *
 * Source note: the hero's right-side visual is a Lottie animation
 * (animated product UI mockup) — a structural/decorative graphic, NOT an
 * author-editorial image. It is intentionally NOT emitted as a background
 * image row. The background image row is therefore omitted for this instance,
 * but the conditional below keeps the parser resilient if a real editorial
 * <img> appears in future instances.
 */
export default function parse(element, { document }) {
  // Heading — primary headline of the hero
  const heading = element.querySelector('h1, h2, .hero-title, [class*="title"]');

  // Subheading paragraph — the first <p> that is NOT a CTA wrapper (no anchor)
  const subheading = Array.from(element.querySelectorAll(':scope > p'))
    .find((p) => !p.querySelector('a'));

  // CTA links — anchors inside the hero (e.g. "See it in action")
  const ctaLinks = Array.from(element.querySelectorAll('a[href]'));

  // Optional editorial background image (NOT the decorative Lottie visual).
  // Only a real <img> qualifies; decorative animations are skipped.
  const bgImage = element.querySelector('img[class*="background"], img[class*="hero-bg"], picture img');

  const cells = [];

  // Row 2 (optional): editorial background image — omitted here (Lottie is decorative)
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: title + subheading + CTA(s) combined into one cell
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push(contentCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-platform', cells });
  element.replaceWith(block);
}
