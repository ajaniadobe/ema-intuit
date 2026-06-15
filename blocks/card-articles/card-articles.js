/* card-articles: innovation/news card grid (Intuit homepage C05BlogArticleCards).
   Each authored row is one card:
     [ image cell | content cell ( category <p> + <h3> + optional subheading <p> + link <p><a> ) ]
   Cards with no image have a single content cell.
   The final card ("See all stories") has only a heading + link and renders as a blue CTA tile. */

export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    row.classList.add('card-articles-card');

    const cells = [...row.children];

    // Locate the picture (image cell) anywhere in the row.
    const pic = row.querySelector('picture');
    let contentCell;

    if (pic) {
      // The first cell that contains the picture becomes the image container.
      const picCell = cells.find((c) => c.contains(pic)) || cells[0];
      picCell.classList.add('card-articles-image');
      // Strip any wrapping <p> that decorateMain added around the picture.
      const picPara = pic.closest('p');
      if (picPara && picPara !== picCell) {
        picCell.append(pic);
        picPara.remove();
      }
      contentCell = cells.find((c) => c !== picCell) || cells[cells.length - 1];
    } else {
      [contentCell] = cells;
    }

    if (!contentCell) return;
    contentCell.classList.add('card-articles-content');

    // Eyebrow = first <p> that is NOT a link wrapper.
    const paras = [...contentCell.querySelectorAll(':scope > p')];
    const eyebrow = paras.find((p) => !p.querySelector('a'));
    if (eyebrow) eyebrow.classList.add('card-articles-eyebrow');

    // Link container = the <p> that wraps the trailing link.
    const linkPara = [...contentCell.querySelectorAll(':scope > p')].reverse().find((p) => p.querySelector('a'));
    if (linkPara) linkPara.classList.add('card-articles-link');

    // CTA tile: no image and no eyebrow -> "See all stories" style blue tile.
    if (!pic && !eyebrow) {
      row.classList.add('card-articles-cta-tile');
    }
  });
}
