export default function init(block) {
  // The block holds one row per tile. Each row = [picture cell, link cell].
  const rows = [...block.children];
  rows.forEach((row) => {
    row.classList.add('card-linktile-tile');

    const cells = [...row.children];
    const picCell = cells.find((c) => c.querySelector('picture, img'));
    const linkCell = cells.find((c) => c.querySelector('a[href]'));
    const link = linkCell ? linkCell.querySelector('a[href]') : null;
    if (!link) return;

    const href = link.getAttribute('href');
    const label = link.textContent.trim();

    // Build the heading + arrow text content.
    const heading = document.createElement('h3');
    heading.className = 'card-linktile-heading';
    heading.textContent = label;

    const arrow = document.createElement('span');
    arrow.className = 'card-linktile-arrow';
    arrow.setAttribute('aria-hidden', 'true');

    const text = document.createElement('div');
    text.className = 'card-linktile-text';
    text.append(heading, arrow);

    // Picture container (clips/positions the tall photo).
    const picContainer = document.createElement('div');
    picContainer.className = 'card-linktile-picture';
    const pic = picCell ? picCell.querySelector('picture') : null;
    if (pic) picContainer.append(pic);

    // Whole tile becomes a single anchor.
    const anchor = document.createElement('a');
    anchor.className = 'card-linktile-link';
    anchor.href = href;
    anchor.setAttribute('aria-label', label);
    anchor.append(text, picContainer);

    row.textContent = '';
    row.append(anchor);
  });
}
