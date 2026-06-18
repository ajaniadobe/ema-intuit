/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Intuit ACCESSIBILITY page live-DOM normalization.
 *
 * The accessibility-page block parsers (tools/importer/parsers/hero-company.js,
 * tools/importer/parsers/columns-product.js) were authored against the idealized
 * migration-work/cleaned.html, which uses clean landmark anchors:
 *   - section.hero-section    > .hero-content (.eyebrow p, h1, p) + img
 *   - section.content-section x6 (img + h2 + body p's + cta link); alternating
 *     image side (2,4,6 image-right; 3,5,7 image-left)
 *   - section.contact-section (.contact-heading: eyebrow p + h2; p with phone + mailto)
 *
 * The LIVE https://www.intuit.com/accessibility/ page is a bot-protected Next.js
 * SPA with hashed CSS-module class names and NONE of those anchors. This
 * transformer runs FIRST (beforeTransform), locates the live DOM landmarks by
 * stable structural signals (heading text, eyebrow text, anchor hrefs), and
 * BUILDS clean <section> trees carrying the exact anchors the parsers +
 * page-templates selectors expect. Real <img> (live src), real <a href>, and
 * real heading/text nodes are cloned verbatim — no copy is fabricated.
 *
 * Each section also receives a data-section="N" attribute so the reusable
 * tools/importer/transformers/intuit-sections.js can place EDS section breaks
 * and emit the Section Metadata (light-cyan contact band) in afterTransform.
 *
 * Image-left content sections (3,5,7) get an extra `image-left` class so the
 * columns-product parser emits the `z-pattern` variant (flips image to the left
 * to match the source's alternating layout).
 *
 * Must run BEFORE intuit-cleanup (afterTransform global-chrome removal) and
 * intuit-sections. Global chrome is discarded by the body replacement at the end.
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
    try { console.warn('[intuit-accessibility-normalize] ' + msg); } catch (e) {}
  }

  function qAll(root, sel) {
    return root ? Array.prototype.slice.call(root.querySelectorAll(sel)) : [];
  }

  function allOf(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  function textOf(node) {
    return node ? (node.textContent || '').trim() : '';
  }

  // Clone the verbatim innerHTML of a source leaf into a fresh clean element.
  function cloneLeaf(node, tag) {
    if (!node) return null;
    var el = document.createElement(tag);
    el.innerHTML = node.innerHTML;
    return el;
  }

  // A <p> carrying plain verbatim text.
  function pFromText(text) {
    var p = document.createElement('p');
    p.textContent = text;
    return p;
  }

  // A clean <img> preserving src/alt verbatim.
  function cloneImg(img) {
    if (!img) return null;
    var n = document.createElement('img');
    var src = img.getAttribute('src') || img.getAttribute('data-src')
      || (img.getAttribute('srcset') ? img.getAttribute('srcset').split(/\s+/)[0] : '');
    if (src) n.setAttribute('src', src);
    if (img.getAttribute('alt') != null) n.setAttribute('alt', img.getAttribute('alt'));
    return n;
  }

  // Find a heading (any level) whose text matches a regex, anywhere in the doc.
  function findHeadingByText(re) {
    return allOf('h1, h2, h3, h4').find(function (h) { return re.test(textOf(h)); }) || null;
  }

  // Walk up from a node until the ancestor also contains an <img> (the content
  // image is a sibling of the text wrapper in the live DOM).
  function hostWithImage(node, levels) {
    var el = node ? node.parentElement : null;
    var n = levels || 5;
    while (el && el.parentElement && !el.querySelector('img') && n > 0) {
      el = el.parentElement;
      n--;
    }
    return el || (node ? node.parentElement : null) || node;
  }

  function isStructuralImg(im) {
    var src = im.getAttribute('src') || '';
    return /logoball|icon|chevron|arrow|sprite|glyph/i.test(src);
  }

  // ---- SECTION 1: HERO -----------------------------------------------------

  function buildHero() {
    var h1 = findHeadingByText(/powering prosperity for everyone/i);
    if (!h1) { warn('hero h1 "Powering prosperity for everyone" not found'); return null; }

    var host = hostWithImage(h1, 6);

    var section = document.createElement('section');
    section.className = 'hero-section';
    section.setAttribute('data-section', '1');

    // Portrait photo: a content-sized <img> within the hero host.
    var img = qAll(host, 'img').find(function (im) { return !isStructuralImg(im); })
      || qAll(host, 'img')[0];
    var imgEl = cloneImg(img);
    if (imgEl) section.appendChild(imgEl);
    else warn('hero: portrait photo not found');

    var content = document.createElement('div');
    content.className = 'hero-content';

    // Eyebrow: the "ACCESSIBILITY" label.
    var eyebrow = qAll(host, 'p, span, div').find(function (p) {
      return /^accessibility$/i.test(textOf(p)) && p.children.length === 0;
    });
    if (eyebrow) {
      var ey = pFromText(textOf(eyebrow));
      ey.className = 'eyebrow';
      content.appendChild(ey);
    } else {
      warn('hero: "ACCESSIBILITY" eyebrow not found');
    }

    content.appendChild(cloneLeaf(h1, 'h1'));

    // Supporting paragraph: first sizable non-eyebrow, non-CTA paragraph.
    var supporting = qAll(host, 'p').find(function (p) {
      var t = textOf(p);
      return t.length > 30
        && !/^accessibility$/i.test(t)
        && t.toLowerCase() !== textOf(h1).toLowerCase()
        && !p.querySelector('a, button');
    });
    if (supporting) content.appendChild(cloneLeaf(supporting, 'p'));
    else warn('hero: supporting paragraph not found');

    section.appendChild(content);
    return section;
  }

  // ---- SECTIONS 2-7: CONTENT SPLITS (columns-product) ----------------------

  function buildContent(n, headingRe, imageLeft) {
    var h2 = findHeadingByText(headingRe);
    if (!h2) { warn('content section ' + n + ' heading not found'); return null; }

    var host = hostWithImage(h2, 6);

    var section = document.createElement('section');
    section.className = imageLeft ? 'content-section image-left' : 'content-section';
    section.setAttribute('data-section', String(n));

    // The columns-product parser reads DIRECT children of the matched element
    // (:scope > img, :scope > p, and h2). So emit img + h2 + body p's + cta p as
    // direct children of section.content-section.
    var img = qAll(host, 'img').find(function (im) { return !isStructuralImg(im); })
      || host.querySelector('img');
    var imgEl = cloneImg(img);
    if (imgEl) section.appendChild(imgEl);
    else warn('content ' + n + ': image not found');

    section.appendChild(cloneLeaf(h2, 'h2'));

    // Body paragraphs: sizable paragraphs that are not the heading and not CTAs.
    var bodyParas = qAll(host, 'p').filter(function (p) {
      var t = textOf(p);
      return t.length > 30
        && t.toLowerCase() !== textOf(h2).toLowerCase()
        && !p.querySelector('a, button');
    });
    if (!bodyParas.length) warn('content ' + n + ': body paragraph not found');
    bodyParas.forEach(function (p) { section.appendChild(cloneLeaf(p, 'p')); });

    // CTA link, emitted as its own <p>.
    var cta = qAll(host, 'a[href]').find(function (a) {
      var t = textOf(a);
      return t.length && !a.querySelector('img')
        && t.toLowerCase() !== textOf(h2).toLowerCase();
    });
    if (cta) {
      var lp = document.createElement('p');
      var a = document.createElement('a');
      a.setAttribute('href', cta.getAttribute('href') || '');
      a.textContent = textOf(cta);
      lp.appendChild(a);
      section.appendChild(lp);
    } else {
      warn('content ' + n + ': cta link not found');
    }

    return section;
  }

  // ---- SECTION 8: CONTACT BAND (default content) ---------------------------

  function buildContact() {
    var eyebrow = allOf('p, span, div').find(function (p) {
      return /^contact us$/i.test(textOf(p)) && p.children.length === 0;
    });
    var h2 = findHeadingByText(/we take website accessibility seriously/i);
    if (!eyebrow && !h2) { warn('contact band not found'); return null; }

    var host = h2 ? hostWithImage(h2, 6) : (eyebrow ? eyebrow.parentElement : null);
    // hostWithImage may have climbed too far (contact band has no image); fall
    // back to the closest common ancestor of eyebrow + h2 by using the h2's host.
    if (!host) host = document.body;

    var section = document.createElement('section');
    section.className = 'contact-section';
    section.setAttribute('data-section', '8');

    var heading = document.createElement('div');
    heading.className = 'contact-heading';

    if (eyebrow) {
      var ey = pFromText(textOf(eyebrow));
      ey.className = 'eyebrow';
      heading.appendChild(ey);
    } else {
      warn('contact: "CONTACT US" eyebrow not found');
    }

    if (h2) heading.appendChild(cloneLeaf(h2, 'h2'));
    section.appendChild(heading);

    // Contact paragraph: the one containing the mailto link (verbatim, with the
    // phone number and email anchor preserved).
    var contactP = allOf('p').find(function (p) {
      return p.querySelector('a[href^="mailto:"]') && /accessibility/i.test(textOf(p));
    });
    if (contactP) {
      section.appendChild(cloneLeaf(contactP, 'p'));
    } else {
      warn('contact: paragraph with phone + mailto not found');
    }

    return section;
  }

  // ---- assemble ------------------------------------------------------------

  var sections = [
    buildHero(),
    buildContent(2, /inclusive design/i, false),
    buildContent(3, /financial education and literacy/i, true),
    buildContent(4, /customer research/i, false),
    buildContent(5, /we care and give back/i, true),
    buildContent(6, /powering prosperity with aira/i, false),
    buildContent(7, /accessibility champions/i, true),
    buildContact(),
  ].filter(Boolean);

  if (!sections.length) {
    warn('no sections built — leaving DOM untouched');
    return;
  }

  var main = document.createElement('main');
  sections.forEach(function (s) { main.appendChild(s); });

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
