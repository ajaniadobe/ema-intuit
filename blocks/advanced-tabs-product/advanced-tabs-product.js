/*
 * advanced-tabs-product — Intuit homepage product showcase.
 *
 * Self-contained: this block owns its own content (one row per product:
 * [tab label | panel content]) and decorates it into a tab switcher. It does
 * NOT hide main or hunt sibling sections (the base advanced-tabs pattern),
 * because the panels live inside this block, not in adjacent sections.
 *
 * Each panel's content cell holds an inner "Columns Product" table
 * (image | text). EDS does not decorate blocks nested inside another block's
 * cells, so we unwrap that table here into a two-column grid.
 */

function buildPanelColumns(contentCell) {
  const table = contentCell.querySelector('table');
  if (!table) return contentCell;

  // Data row = the row with 2+ cells (skip the single-cell block-name marker).
  const rows = [...table.querySelectorAll('tr')];
  const dataRow = rows.find((r) => r.children.length >= 2);
  if (!dataRow) return contentCell;

  const grid = document.createElement('div');
  grid.className = 'product-panel-cols';
  [...dataRow.children].forEach((cell, idx) => {
    const col = document.createElement('div');
    col.className = `product-panel-col product-panel-col-${idx + 1}`;
    col.append(...cell.childNodes);
    grid.append(col);
  });
  return grid;
}

export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const tabList = document.createElement('div');
  tabList.className = 'advanced-tabs-product-list';
  tabList.setAttribute('role', 'tablist');

  const panels = [];

  rows.forEach((row, idx) => {
    const cells = [...row.children];
    const label = (cells[0]?.textContent || `Tab ${idx + 1}`).trim();
    const contentCell = cells[1] || document.createElement('div');

    const panel = document.createElement('div');
    panel.className = 'advanced-tabs-product-panel';
    panel.id = `product-tabpanel-${idx + 1}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `product-tab-${idx + 1}`);
    panel.append(buildPanelColumns(contentCell));
    if (idx === 0) panel.classList.add('is-visible');
    panels.push(panel);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.id = `product-tab-${idx + 1}`;
    btn.setAttribute('aria-controls', `product-tabpanel-${idx + 1}`);
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
