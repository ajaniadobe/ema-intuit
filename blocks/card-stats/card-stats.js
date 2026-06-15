/* card-stats: "by the numbers" stat grid (Intuit /company/ Fast Facts section).
   Each authored row is one stat card:
     [ content cell ( <h3> big figure + <p> label ) | image cell (small photo/icon) ]
   The figure is the dominant element; the small image sits alongside/below it.
   Image cell is optional — a stat with no picture renders figure + label only. */

export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    row.classList.add('card-stats-card');

    const cells = [...row.children];
    const pic = row.querySelector('picture');

    let contentCell;

    if (pic) {
      const picCell = cells.find((c) => c.contains(pic)) || cells[cells.length - 1];
      picCell.classList.add('card-stats-image');
      // Strip any wrapping <p> decorateMain added around the picture.
      const picPara = pic.closest('p');
      if (picPara && picPara !== picCell) {
        picCell.append(pic);
        picPara.remove();
      }
      contentCell = cells.find((c) => c !== picCell) || cells[0];
    } else {
      [contentCell] = cells;
    }

    if (!contentCell) return;
    contentCell.classList.add('card-stats-content');

    // The big figure is the heading; its label is the following paragraph.
    const figure = contentCell.querySelector('h2, h3, h4');
    if (figure) figure.classList.add('card-stats-figure');

    const label = contentCell.querySelector('p');
    if (label) label.classList.add('card-stats-label');
  });
}
