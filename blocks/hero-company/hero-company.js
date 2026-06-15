/* hero-company: light, image-beside-text mission hero (Intuit /company/ top section).
   Authored as a single row with two cells:
     [ image cell (picture) | content cell ( eyebrow <p> + <h1> + paragraph ) ]
   The image sits to one side of the heading/paragraph on a light background.
   If no picture is present the block degrades to a centered text-only hero. */

export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];
  const pic = block.querySelector('picture');

  let imageCell;
  let contentCell;

  if (pic) {
    imageCell = cells.find((c) => c.contains(pic)) || cells[0];
    imageCell.classList.add('hero-company-image');
    // Strip any wrapping <p> decorateMain added around the picture.
    const picPara = pic.closest('p');
    if (picPara && picPara !== imageCell) {
      imageCell.append(pic);
      picPara.remove();
    }
    contentCell = cells.find((c) => c !== imageCell) || cells[cells.length - 1];
  } else {
    block.classList.add('hero-company-no-image');
    [contentCell] = cells;
  }

  if (!contentCell) return;
  contentCell.classList.add('hero-company-content');

  // Eyebrow = first <p> that precedes the heading (e.g. "OUR MISSION").
  const heading = contentCell.querySelector('h1, h2, h3');
  if (heading) {
    const eyebrow = heading.previousElementSibling;
    if (eyebrow && eyebrow.tagName === 'P') {
      eyebrow.classList.add('hero-company-eyebrow');
    }
  }
}
