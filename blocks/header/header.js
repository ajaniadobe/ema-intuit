import { getConfig, getMetadata } from '../../scripts/ak.js';

const { locale } = getConfig();
const HEADER_PATH = '/fragments/nav/header';
const DESKTOP_MQ = '(width >= 1120px)';

const MENU_ICON = '<svg viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M1 1.5h17M1 6.5h17M1 11.5h17"/></svg>';
const CLOSE_ICON = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M2 2l12 12M14 2L2 14"/></svg>';
const CHEVRON = '<svg viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1 1.5L6 6.5L11 1.5"/></svg>';

/**
 * Fetch the nav fragment as plain HTML. Tries the local /content path first
 * (aem up serves the workspace's content/ folder there), then falls back to
 * the published path for DA/EDS production.
 * @param {string} path fragment path without the .plain.html suffix
 * @returns {HTMLElement} a wrapper div containing the fragment's top-level sections
 */
async function fetchNavFragment(path) {
  let resp = await fetch(`/content${path}.plain.html`);
  if (!resp.ok) resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) throw Error(`Couldn't fetch nav fragment: ${path}`);
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const wrapper = document.createElement('div');
  // plain.html fragments are top-level <div> sections (no <main>)
  const sections = doc.body.querySelectorAll(':scope > div');
  wrapper.append(...sections);
  return wrapper;
}

/**
 * Build one nav section: a toggle button + a panel holding its link list.
 * Used for both the desktop dropdown and the mobile accordion (CSS decides
 * which presentation applies at the active breakpoint).
 */
function buildSection(heading, allToggles) {
  const section = document.createElement('div');
  section.className = 'nav-section';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-section-toggle';
  btn.setAttribute('aria-expanded', 'false');
  const label = document.createElement('span');
  label.textContent = heading.textContent.trim();
  const chev = document.createElement('span');
  chev.className = 'nav-section-chevron';
  chev.innerHTML = CHEVRON;
  btn.append(label, chev);

  const panel = document.createElement('div');
  panel.className = 'nav-section-panel';
  const list = heading.nextElementSibling;
  if (list && list.tagName === 'UL') panel.append(list);

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    // single-open: close any other open section
    allToggles.forEach((other) => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        other.parentElement.classList.remove('is-open');
      }
    });
    btn.setAttribute('aria-expanded', String(!open));
    section.classList.toggle('is-open', !open);
  });

  section.append(btn, panel);
  return { section, btn };
}

function buildSections(navSection) {
  const wrap = document.createElement('div');
  wrap.className = 'nav-sections';
  const toggles = [];
  navSection.querySelectorAll('h2').forEach((h) => {
    const { section, btn } = buildSection(h, toggles);
    toggles.push(btn);
    wrap.append(section);
  });
  return wrap;
}

function buildUtility(utilSection) {
  const wrap = document.createElement('div');
  wrap.className = 'nav-utility';

  const lists = utilSection.querySelectorAll('ul');

  // Country switcher: <h3> + the first <ul>
  const countryHeading = utilSection.querySelector('h3');
  if (countryHeading && lists[0]) {
    const country = document.createElement('div');
    country.className = 'nav-country';
    const cl = document.createElement('p');
    cl.className = 'nav-country-label';
    cl.textContent = countryHeading.textContent.trim();
    country.append(cl, lists[0]);
    wrap.append(country);
  }

  // Sign in link (first <p><a>)
  const signIn = utilSection.querySelector('p a');
  if (signIn) {
    signIn.classList.add('nav-signin');
    wrap.append(signIn);
  }

  // Brand logos: the last <ul> (contains <img> links)
  if (lists.length > 1) {
    const brands = lists[lists.length - 1];
    brands.classList.add('nav-brands');
    wrap.append(brands);
  }

  return wrap;
}

export default async function init(el) {
  const headerMeta = getMetadata('header');
  const path = headerMeta || HEADER_PATH;
  const fragment = await fetchNavFragment(`${locale.prefix}${path}`);
  const sections = fragment.querySelectorAll(':scope > div');

  const utility = sections[2] ? buildUtility(sections[2]) : null;

  // Brand-logo strip (shown above the bar on desktop). Pull the brand <ul>
  // out of the utility cluster so it can sit at the very top on desktop.
  const brandStrip = document.createElement('div');
  brandStrip.className = 'nav-brand-strip';
  const brands = utility && utility.querySelector('.nav-brands');
  if (brands) brandStrip.append(brands.cloneNode(true));

  // Logo bar: logo + inline section list (desktop) / + hamburger (mobile)
  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  const logoLink = sections[0] && sections[0].querySelector('a');
  if (logoLink) {
    logoLink.classList.add('nav-logo');
    bar.append(logoLink);
  }

  const navSections = sections[1] ? buildSections(sections[1]) : document.createElement('div');
  bar.append(navSections);

  // Desktop utility (country + sign in) sits at the right of the bar.
  const barUtility = document.createElement('div');
  barUtility.className = 'nav-bar-utility';
  if (utility) {
    const country = utility.querySelector('.nav-country');
    const signIn = utility.querySelector('.nav-signin');
    if (country) barUtility.append(country);
    if (signIn) barUtility.append(signIn);
  }
  bar.append(barUtility);

  // Hamburger toggle (mobile only via CSS)
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = MENU_ICON;
  bar.append(toggle);

  // Mobile flyout: reuses the same nav-sections + utility, shown < 1120px.
  const flyout = document.createElement('div');
  flyout.className = 'nav-flyout';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'nav-close';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = CLOSE_ICON;
  flyout.append(closeBtn);
  // The bar's nav-sections and bar-utility are reparented into the flyout at
  // mobile widths via JS (so we don't duplicate event handlers/DOM).

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';

  const toggleFlyout = (force) => {
    const open = typeof force === 'boolean' ? force : !el.classList.contains('is-open');
    el.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-flyout-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => toggleFlyout());
  closeBtn.addEventListener('click', () => toggleFlyout(false));
  backdrop.addEventListener('click', () => toggleFlyout(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleFlyout(false); });

  // Move nav-sections + bar-utility between the bar (desktop) and the flyout
  // (mobile) so a single instance serves both layouts.
  const mq = window.matchMedia(DESKTOP_MQ);
  const applyLayout = () => {
    if (mq.matches) {
      // desktop: order is logo | sections | utility | (hidden toggle)
      bar.append(navSections, barUtility, toggle);
      toggleFlyout(false);
    } else {
      // mobile: sections + utility live in the flyout, toggle stays in the bar
      bar.append(toggle);
      flyout.append(navSections, barUtility);
    }
  };
  mq.addEventListener('change', applyLayout);

  el.append(brandStrip, bar, backdrop, flyout);
  applyLayout();
}
