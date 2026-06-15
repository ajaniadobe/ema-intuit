/*
 * advanced-tabs-stories — Intuit homepage "How Intuit drives success for".
 *
 * Self-contained: this block owns its content (one row per audience:
 * [audience label | slide carousel]) and decorates it into a tab switcher.
 * It does NOT hide main or hunt sibling sections.
 *
 * Each panel's content cell holds an inner "Carousel Stories" table (one row
 * per slide: image | quote + story link). EDS does not decorate blocks nested
 * inside another block's cells, so we unwrap that table into a scroll-snap
 * row of story cards here.
 */

function buildSlides(contentCell) {
  const table = contentCell.querySelector('table');
  if (!table) return contentCell;

  const slidesWrap = document.createElement('ul');
  slidesWrap.className = 'stories-slides';

  const rows = [...table.querySelectorAll('tr')].filter((r) => r.children.length >= 2);
  rows.forEach((row) => {
    const cells = [...row.children];
    const slide = document.createElement('li');
    slide.className = 'stories-slide';

    const image = document.createElement('div');
    image.className = 'stories-slide-image';
    image.append(...cells[0].childNodes);

    const content = document.createElement('div');
    content.className = 'stories-slide-content';
    content.append(...cells[1].childNodes);

    slide.append(image, content);
    slidesWrap.append(slide);
  });

  return slidesWrap;
}

export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const tabList = document.createElement('div');
  tabList.className = 'advanced-tabs-stories-list';
  tabList.setAttribute('role', 'tablist');

  const panels = [];

  rows.forEach((row, idx) => {
    const cells = [...row.children];
    const label = (cells[0]?.textContent || `Tab ${idx + 1}`).trim();
    const contentCell = cells[1] || document.createElement('div');

    const panel = document.createElement('div');
    panel.className = 'advanced-tabs-stories-panel';
    panel.id = `stories-tabpanel-${idx + 1}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `stories-tab-${idx + 1}`);
    panel.append(buildSlides(contentCell));
    if (idx === 0) panel.classList.add('is-visible');
    panels.push(panel);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.id = `stories-tab-${idx + 1}`;
    btn.setAttribute('aria-controls', `stories-tabpanel-${idx + 1}`);
    btn.textContent = label;
    if (idx === 0) {
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.setAttribute('aria-selected', 'false');
    }

    btn.addEventListener('click', () => {
      tabList.querySelectorAll('button').forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach((p) => p.classList.remove('is-visible'));
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      panel.classList.add('is-visible');
    });

    tabList.append(btn);
  });

  el.replaceChildren(tabList, ...panels);
}
