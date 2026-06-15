import { getConfig, getMetadata } from '../../scripts/ak.js';

const FOOTER_PATH = '/fragments/nav/footer';

/**
 * Fetch the footer fragment as plain HTML. Tries the local /content path first
 * (aem up serves the workspace's content/ folder there), then falls back to the
 * published path for DA/EDS production.
 * @param {string} path fragment path without the .plain.html suffix
 * @returns {HTMLElement} a wrapper div containing the fragment's top-level sections
 */
async function fetchFooterFragment(path) {
  let resp = await fetch(`/content${path}.plain.html`);
  if (!resp.ok) resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) throw Error(`Couldn't fetch footer fragment: ${path}`);
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const wrapper = document.createElement('div');
  wrapper.classList.add('footer-content');
  wrapper.append(...doc.body.querySelectorAll(':scope > div'));
  return wrapper;
}

/**
 * Build the link-column section: each <h2> + following <ul> becomes a column.
 */
function decorateColumns(section) {
  section.classList.add('footer-columns');
  const headings = [...section.querySelectorAll('h2')];
  headings.forEach((h) => {
    const col = document.createElement('div');
    col.className = 'footer-column';
    const list = h.nextElementSibling;
    col.append(h);
    if (list && list.tagName === 'UL') col.append(list);
    section.append(col);
  });
}

/**
 * loads and decorates the footer
 * @param {Element} el The footer element
 */
export default async function init(el) {
  const { locale } = getConfig();
  const footerMeta = getMetadata('footer');
  const path = footerMeta || FOOTER_PATH;
  const fragment = await fetchFooterFragment(`${locale.prefix}${path}`);
  const sections = [...fragment.querySelectorAll(':scope > div')];

  if (sections[0]) decorateColumns(sections[0]);
  if (sections[1]) sections[1].classList.add('footer-brands');
  if (sections[2]) sections[2].classList.add('footer-legal');

  el.append(fragment);
}
