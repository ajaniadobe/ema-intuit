/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Intuit live-DOM normalization.
 *
 * The block parsers (tools/importer/parsers/*.js) were authored against the
 * idealized migration-work/cleaned.html, which uses clean landmark anchors:
 *   - section[data-section="hero"|"product-showcase"|"customer-success"|"innovation"|"driving-success"]
 *   - div[data-panel="turbotax"|...]   (product showcase tabs)
 *   - div[data-pill]  > div[data-slide]   (customer success carousels)
 *   - div[data-cards] > div[data-card]    (innovation + driving-success cards)
 *
 * The LIVE intuit.com homepage is a Next.js SPA with hashed CSS-module class
 * names (e.g. .C03ProductCarousel-container-fa322f8) and NONE of those data-*
 * attributes. This transformer runs FIRST (beforeTransform), locates the live
 * DOM landmarks by stable structural signals (ids, role/aria-label, anchor
 * hrefs, eyebrow text), and BUILDS clean <section data-section> trees that
 * carry the exact anchors the parsers expect. Real <img> (live src), real
 * <a href>, and real heading/text nodes are moved/cloned verbatim — no copy is
 * fabricated or paraphrased.
 *
 * It must run BEFORE intuit-cleanup (afterTransform global-chrome removal) and
 * intuit-sections. The newly built sections live inside <main>/body; cleanup's
 * afterTransform class-based removals (header/footer/nav/[class*=...]) do not
 * touch them because the built nodes carry only safe tags + data-section/
 * data-panel/data-pill/data-slide/data-card[s] attributes (no chrome classes).
 *
 * NOTE: No module-scope lexical (const/let) declarations — the validator injects
 * transformers into the page global scope as a classic script, where a top-level
 * `const` collides on re-injection and aborts the script. All declarations live
 * inside the function body.
 */

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  var document = (payload && payload.document) || element.ownerDocument;
  if (!document) return;

  // ---- helpers -------------------------------------------------------------

  function warn(msg) {
    try { console.warn('[intuit-normalize] ' + msg); } catch (e) {}
  }

  // The deepest real text leaf (p / h1-h3) inside a live Responsivetext wrapper.
  // Returns a fresh clean element (tag) carrying the verbatim innerHTML.
  function cloneLeaf(node, tag) {
    if (!node) return null;
    var el = document.createElement(tag);
    el.innerHTML = node.innerHTML;
    return el;
  }

  // Build a <p> whose verbatim text is taken from a source node (plain text).
  function pFromText(text) {
    var p = document.createElement('p');
    p.textContent = text;
    return p;
  }

  // A live <img> moved into a clean wrapper; preserves src/alt verbatim.
  function cloneImg(img) {
    if (!img) return null;
    var n = document.createElement('img');
    if (img.getAttribute('src')) n.setAttribute('src', img.getAttribute('src'));
    if (img.getAttribute('alt') != null) n.setAttribute('alt', img.getAttribute('alt'));
    return n;
  }

  // A clean anchor preserving href + verbatim text.
  function anchorFrom(href, text) {
    var a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = text;
    return a;
  }

  // Video-duration UI affordance like "1:34" / "4:21" — not editorial copy.
  function isDuration(text) {
    return /^\d{1,2}:\d{2}$/.test((text || '').trim());
  }

  function qAll(root, sel) {
    return root ? Array.prototype.slice.call(root.querySelectorAll(sel)) : [];
  }

  // ---- HERO ----------------------------------------------------------------

  function buildHero() {
    var hero = document.querySelector('#icom-hp-hero');
    if (!hero) { warn('hero #icom-hp-hero not found'); return null; }

    var section = document.createElement('section');
    section.setAttribute('data-section', 'hero');

    var h1 = hero.querySelector('h1');
    if (h1) section.appendChild(cloneLeaf(h1, 'h1'));

    // Subhead: the first <p> that is not a CTA/button wrapper.
    var subhead = qAll(hero, 'p').find(function (p) {
      return !p.querySelector('a') && p.textContent.trim().length;
    });
    if (subhead) section.appendChild(cloneLeaf(subhead, 'p'));

    // CTA: live "See it in action" is a <button> (sometimes duplicated for
    // desktop/mobile). The idealized model is an in-page anchor.
    var ctaBtn = qAll(hero, 'button, a').find(function (b) {
      return /see it in action/i.test(b.textContent.trim());
    });
    var ctaText = ctaBtn ? ctaBtn.textContent.trim() : 'See it in action';
    var ctaHref = (ctaBtn && ctaBtn.tagName.toLowerCase() === 'a' && ctaBtn.getAttribute('href'))
      ? ctaBtn.getAttribute('href')
      : '#see-it-in-action';
    var ctaP = document.createElement('p');
    ctaP.appendChild(anchorFrom(ctaHref, ctaText));
    section.appendChild(ctaP);

    return section;
  }

  // ---- PRODUCT SHOWCASE ----------------------------------------------------

  function buildProductShowcase() {
    var container = document.querySelector('[class*="C03ProductCarousel-container"]');
    if (!container) { warn('product-showcase container not found'); return null; }

    var section = document.createElement('section');
    section.setAttribute('data-section', 'product-showcase');

    // Customer photos: one per assets-wrapper, in panel order.
    var assets = qAll(container, '[class*="C03ProductCarouselItem-assets-wrapper"]');
    // Text panels: one content-wrapper per panel, in panel order.
    var contents = qAll(container, '[class*="C03ProductCarouselItem-content-wrapper"]');
    // Logo balls (eyebrow logos), in panel order, found within the carousel.
    var logos = qAll(container, 'img').filter(function (im) {
      return /logoball/.test(im.getAttribute('src') || '');
    });

    // Stable data-panel keys keyed by the eyebrow product name (the parser maps
    // these keys -> human tab labels).
    var keyByEyebrow = {
      'turbotax': 'turbotax',
      'credit karma': 'creditkarma',
      'quickbooks': 'quickbooks',
      'mailchimp': 'mailchimp',
    };

    if (!contents.length) { warn('product-showcase: no content panels found'); }

    contents.forEach(function (cw, i) {
      var ps = qAll(cw, 'p');
      var eyebrowSrc = ps[0];
      var bodySrc = ps[1];
      var h2 = cw.querySelector('h2');
      var cta = cw.querySelector('[class*="cta-wrapper"] a, [class*="cta-wrapper"] button, a, button');

      var eyebrowText = eyebrowSrc ? eyebrowSrc.textContent.trim() : '';
      var key = keyByEyebrow[eyebrowText.toLowerCase()] || ('panel-' + (i + 1));

      // Outer panel (advanced-tabs-product reads :scope > div[data-panel] and
      // keeps it as tab content). The inner columns layout lives in a nested
      // div[data-cols] so the columns-product parser can transform it in place
      // WITHOUT destroying the data-panel wrapper the tabs parser depends on.
      var panel = document.createElement('div');
      panel.setAttribute('data-panel', key);

      var cols = document.createElement('div');
      cols.setAttribute('data-cols', '');

      // Customer photo: matching assets-wrapper by index (top-level img so the
      // columns-product parser picks it via :scope > img).
      var photo = assets[i] ? assets[i].querySelector('img') : null;
      var photoEl = cloneImg(photo);
      if (photoEl) cols.appendChild(photoEl);
      else warn('product-showcase: panel "' + key + '" missing customer photo');

      // Eyebrow paragraph: logo image (so the parser's "p with img" detection
      // fires) followed by the uppercase product name, verbatim.
      var eyebrowP = document.createElement('p');
      var logoEl = cloneImg(logos[i]);
      if (logoEl) {
        if (!logoEl.getAttribute('alt')) logoEl.setAttribute('alt', eyebrowText);
        eyebrowP.appendChild(logoEl);
        eyebrowP.appendChild(document.createTextNode(' '));
      }
      if (eyebrowSrc) eyebrowP.appendChild(document.createTextNode(eyebrowText));
      cols.appendChild(eyebrowP);

      // Heading.
      if (h2) cols.appendChild(cloneLeaf(h2, 'h2'));

      // Body paragraph (verbatim, no link / no image).
      if (bodySrc) cols.appendChild(cloneLeaf(bodySrc, 'p'));

      // CTA "Go to <product>" link.
      if (cta) {
        // Some CTAs are anchors directly; some wrap an anchor.
        var realA = cta.tagName.toLowerCase() === 'a' ? cta : cta.querySelector('a');
        if (realA && realA.getAttribute('href')) {
          var ctaP = document.createElement('p');
          ctaP.appendChild(anchorFrom(realA.getAttribute('href'), realA.textContent.trim()));
          cols.appendChild(ctaP);
        }
      }

      panel.appendChild(cols);
      section.appendChild(panel);
    });

    return section;
  }

  // ---- CUSTOMER SUCCESS ----------------------------------------------------

  function buildCustomerSuccess() {
    var h2 = Array.prototype.slice.call(document.querySelectorAll('h2')).find(function (h) {
      return /how intuit drives success/i.test(h.textContent);
    });
    var audiences = ['Small Businesses', 'Individuals', 'Mid-Market Businesses'];
    var regions = audiences.map(function (al) {
      return { label: al, el: document.querySelector('[role="region"][aria-label="' + al + '"]') };
    });

    if (!h2 && !regions.some(function (r) { return r.el; })) {
      warn('customer-success not found');
      return null;
    }

    var section = document.createElement('section');
    section.setAttribute('data-section', 'customer-success');

    // Heading is default content above the block.
    if (h2) section.appendChild(cloneLeaf(h2, 'h2'));

    regions.forEach(function (r) {
      if (!r.el) { warn('customer-success: audience region "' + r.label + '" not found'); return; }

      var pill = document.createElement('div');
      pill.setAttribute('data-pill', r.label.toLowerCase().replace(/\s+/g, '-'));

      // Audience label heading (advanced-tabs-stories reads :scope > h3 as the
      // tab label and removes it). Kept as a direct child of the pill.
      var h3 = document.createElement('h3');
      h3.textContent = r.label;
      pill.appendChild(h3);

      // Inner carousel wrapper: the carousel-stories parser reads
      // :scope > div[data-slide]. Nesting the slides in div[data-carousel]
      // (not directly under the pill) means carousel-stories transforms the
      // carousel in place WITHOUT destroying the div[data-pill] wrapper that
      // advanced-tabs-stories keeps as its tab content.
      var carousel = document.createElement('div');
      carousel.setAttribute('data-carousel', '');

      var groups = qAll(r.el, '[role="group"]');
      if (!groups.length) warn('customer-success: no slides in "' + r.label + '"');

      groups.forEach(function (g, gi) {
        var slide = document.createElement('div');
        slide.setAttribute('data-slide', String(gi + 1));

        var imgs = qAll(g, 'img');
        // First image = customer photo (top-level :scope > img for carousel parser).
        if (imgs.length) {
          var photo = cloneImg(imgs[0]);
          if (photo) slide.appendChild(photo);
        }
        // Remaining images = small brand logos.
        imgs.slice(1).forEach(function (logo) {
          var l = cloneImg(logo);
          if (l) slide.appendChild(l);
        });

        // Quote paragraph(s): exclude the video-duration affordance ("1:34").
        var quotes = qAll(g, 'p').filter(function (p) {
          var t = p.textContent.trim();
          return t.length && !isDuration(t);
        });
        quotes.forEach(function (q) { slide.appendChild(cloneLeaf(q, 'p')); });

        // Story link ("Read/Watch ... story"), preserved verbatim.
        var link = g.querySelector('a[href]');
        if (link) {
          var lp = document.createElement('p');
          lp.appendChild(anchorFrom(link.getAttribute('href') || '', link.textContent.trim()));
          slide.appendChild(lp);
        }

        carousel.appendChild(slide);
      });

      pill.appendChild(carousel);
      section.appendChild(pill);
    });

    return section;
  }

  // ---- INNOVATION ----------------------------------------------------------

  function buildInnovation() {
    var region = Array.prototype.slice.call(document.querySelectorAll('[role="region"]')).find(function (r) {
      return /innovation, action/i.test(r.getAttribute('aria-label') || '')
        || (r.querySelector('h2') && /innovation, action/i.test(r.querySelector('h2').textContent || ''));
    });
    if (!region) {
      region = document.querySelector('#articles');
    }
    if (!region) { warn('innovation region not found'); return null; }

    var section = document.createElement('section');
    section.setAttribute('data-section', 'innovation');

    var h2 = region.querySelector('h2');
    if (h2) section.appendChild(cloneLeaf(h2, 'h2'));

    var cardsWrap = document.createElement('div');
    cardsWrap.setAttribute('data-cards', '');

    // Each card has exactly one <h3>; derive card wrappers from the h3s.
    var h3s = qAll(region, 'h3');
    if (!h3s.length) warn('innovation: no cards found');

    h3s.forEach(function (h3, i) {
      // Card wrapper = nearest ancestor whose parent holds more than one h3.
      var card = h3;
      while (card && card.parentElement && card.parentElement.querySelectorAll('h3').length <= 1) {
        card = card.parentElement;
      }
      if (!card) card = h3;

      var div = document.createElement('div');
      div.setAttribute('data-card', String(i + 1));

      var img = card.querySelector('img');
      if (img) {
        var imgEl = cloneImg(img);
        if (imgEl) div.appendChild(imgEl);
      } else {
        div.setAttribute('data-no-image', 'true');
      }

      // Category eyebrow + optional subheading: paragraphs that are not links.
      // In source order: category -> heading -> [subheading] -> link.
      // Collect non-link, non-empty paragraphs (category first, subhead later).
      var paras = qAll(card, 'p').filter(function (p) {
        return p.textContent.trim().length && !p.querySelector('a');
      });
      var link = card.querySelector('a[href]');
      var isCta = !img && (!paras.length) && link; // CTA tile: only heading + link

      if (isCta) div.setAttribute('data-cta-card', 'true');

      // Category eyebrow (first paragraph).
      if (paras[0]) div.appendChild(pFromText(paras[0].textContent.trim()));

      // Heading.
      div.appendChild(cloneLeaf(h3, 'h3'));

      // Optional subheading paragraph(s) after the first.
      paras.slice(1).forEach(function (p) {
        div.appendChild(pFromText(p.textContent.trim()));
      });

      // CTA link.
      if (link) {
        var lp = document.createElement('p');
        lp.appendChild(anchorFrom(link.getAttribute('href') || '', link.textContent.trim()));
        div.appendChild(lp);
      }

      cardsWrap.appendChild(div);
    });

    section.appendChild(cardsWrap);
    return section;
  }

  // ---- DRIVING SUCCESS -----------------------------------------------------

  function buildDrivingSuccess() {
    var h2 = Array.prototype.slice.call(document.querySelectorAll('h2')).find(function (h) {
      return /driving success together/i.test(h.textContent);
    });

    var hrefMarks = ['/careers/', '/company/', '/technology/'];
    var tiles = Array.prototype.slice.call(document.querySelectorAll('a[href]')).filter(function (a) {
      var href = a.getAttribute('href') || '';
      return a.querySelector('img') && hrefMarks.some(function (m) { return href.indexOf(m) !== -1; });
    });

    if (!h2 && !tiles.length) { warn('driving-success not found'); return null; }

    var section = document.createElement('section');
    section.setAttribute('data-section', 'driving-success');

    if (h2) section.appendChild(cloneLeaf(h2, 'h2'));

    var cardsWrap = document.createElement('div');
    cardsWrap.setAttribute('data-cards', '');

    if (!tiles.length) warn('driving-success: no link tiles found');

    tiles.forEach(function (tile) {
      var div = document.createElement('div');
      div.setAttribute('data-card', '');

      var a = document.createElement('a');
      a.setAttribute('href', tile.getAttribute('href') || '');

      var img = tile.querySelector('img');
      var imgEl = cloneImg(img);
      if (imgEl) a.appendChild(imgEl);

      var h3src = tile.querySelector('h3, h2, h4');
      var title = h3src ? h3src.textContent.trim() : (tile.getAttribute('aria-label') || '').trim();
      var h3 = document.createElement('h3');
      h3.textContent = title;
      a.appendChild(h3);

      div.appendChild(a);
      cardsWrap.appendChild(div);
    });

    section.appendChild(cardsWrap);
    return section;
  }

  // ---- assemble ------------------------------------------------------------

  var sections = [
    buildHero(),
    buildProductShowcase(),
    buildCustomerSuccess(),
    buildInnovation(),
    buildDrivingSuccess(),
  ].filter(Boolean);

  if (!sections.length) {
    warn('no sections built — leaving DOM untouched');
    return;
  }

  // Build a clean <main> holding only the normalized sections, then replace the
  // body content. Global chrome (header/nav/footer/consent) is discarded here
  // by replacement; intuit-cleanup still runs afterward as a safety net.
  var main = document.createElement('main');
  sections.forEach(function (s) { main.appendChild(s); });

  // Replace the live body contents with the clean main. element IS the body
  // (import-homepage.js passes document.body as `element`).
  var body = (element && element.tagName && element.tagName.toLowerCase() === 'body')
    ? element
    : document.body;

  if (body) {
    body.innerHTML = '';
    body.appendChild(main);
  } else {
    warn('document.body not available; appending sections to passed element');
    sections.forEach(function (s) { element.appendChild(s); });
  }
}
