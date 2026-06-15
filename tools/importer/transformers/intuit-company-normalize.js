/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Intuit COMPANY page live-DOM normalization.
 *
 * The company-page block parsers (tools/importer/parsers/{hero-company,
 * card-articles,card-stats,carousel-stories,columns-product,card-linktile}.js)
 * were authored against the idealized migration-work/cleaned.html, which uses
 * clean landmark anchors:
 *   - section[data-section="1"] .hero  > .hero-content (.eyebrow,h1,p)
 *   - section[data-section="2"]        (default content: eyebrow + statement)
 *   - section[data-section="3"] .article-cards > article (a > img,span.category,h3,p)
 *   - section[data-section="4"] .stats > .stat (h3,p,img)
 *   - section[data-section="5"] .stories-carousel > .slide (img,ul.story-logos,p,a)
 *   - section[data-section="6"] .columns > .col-text + .col-image
 *   - section[data-section="7"] .columns > .col-text + .col-image
 *   - section[data-section="8"] .link-tiles > a (img,h3)
 *
 * The LIVE https://www.intuit.com/company/ page is a bot-protected Next.js SPA
 * with hashed CSS-module class names and NONE of those anchors. This transformer
 * runs FIRST (beforeTransform), locates the live DOM landmarks by stable
 * structural signals (heading text, role/aria-label, anchor hrefs, eyebrow
 * text), and BUILDS clean <section data-section="N"> trees carrying the exact
 * anchors the parsers expect. Real <img> (live src), real <a href>, and real
 * heading/text nodes are cloned verbatim — no copy is fabricated/paraphrased.
 *
 * It must run BEFORE intuit-cleanup (afterTransform global-chrome removal) and
 * intuit-sections. Global chrome (header/nav/footer/consent) is discarded by the
 * body replacement at the end; intuit-cleanup still runs afterward as a safety
 * net.
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
    try { console.warn('[intuit-company-normalize] ' + msg); } catch (e) {}
  }

  function qAll(root, sel) {
    return root ? Array.prototype.slice.call(root.querySelectorAll(sel)) : [];
  }

  function allOf(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
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

  // A clean anchor preserving href + verbatim text.
  function anchorFrom(href, text) {
    var a = document.createElement('a');
    a.setAttribute('href', href || '');
    a.textContent = text;
    return a;
  }

  function mkSection(n) {
    var s = document.createElement('section');
    s.setAttribute('data-section', String(n));
    return s;
  }

  function textOf(node) {
    return node ? (node.textContent || '').trim() : '';
  }

  // Find a heading (any level) whose text matches a regex, anywhere in the doc.
  function findHeadingByText(re) {
    return allOf('h1, h2, h3, h4').find(function (h) { return re.test(textOf(h)); }) || null;
  }

  // Find the nearest ancestor "block" container of a node: walk up until the
  // parent contains more than just this branch (heuristic landmark grouping).
  function blockAround(node, levels) {
    var el = node;
    var n = levels || 4;
    while (el && el.parentElement && n > 0) {
      el = el.parentElement;
      n--;
    }
    return el || node;
  }

  // Find a [role="region"] whose aria-label matches a regex.
  function findRegion(re) {
    return allOf('[role="region"]').find(function (r) {
      return re.test(r.getAttribute('aria-label') || '');
    }) || null;
  }

  // ---- SECTION 1: HERO -----------------------------------------------------

  function buildHero() {
    var h1 = findHeadingByText(/powering prosperity around the world/i);
    if (!h1) { warn('hero h1 "Powering prosperity around the world" not found'); return null; }

    var host = blockAround(h1, 5);

    var section = mkSection(1);
    var hero = document.createElement('div');
    hero.className = 'hero';

    // Customer photo: an <img> within the hero host that is NOT a decorative
    // glyph/logo. Prefer the first content-sized image.
    var img = qAll(host, 'img').find(function (im) {
      var src = im.getAttribute('src') || '';
      return !/logoball|icon|chevron|arrow|sprite/i.test(src);
    }) || qAll(host, 'img')[0];
    var imgEl = cloneImg(img);
    if (imgEl) hero.appendChild(imgEl);
    else warn('hero: customer photo not found');

    var content = document.createElement('div');
    content.className = 'hero-content';

    // Eyebrow: the "OUR MISSION" paragraph.
    var eyebrow = qAll(host, 'p').find(function (p) {
      return /^our mission$/i.test(textOf(p));
    });
    if (eyebrow) {
      var ey = pFromText(textOf(eyebrow));
      ey.className = 'eyebrow';
      content.appendChild(ey);
    } else {
      warn('hero: "OUR MISSION" eyebrow not found');
    }

    content.appendChild(cloneLeaf(h1, 'h1'));

    // Supporting paragraph: first non-eyebrow, non-CTA paragraph after the h1.
    var supporting = qAll(host, 'p').find(function (p) {
      var t = textOf(p);
      return t.length
        && !/^our mission$/i.test(t)
        && t.toLowerCase() !== textOf(h1).toLowerCase()
        && !p.querySelector('a, button');
    });
    if (supporting) content.appendChild(cloneLeaf(supporting, 'p'));
    else warn('hero: supporting paragraph not found');

    hero.appendChild(content);
    section.appendChild(hero);
    return section;
  }

  // ---- SECTION 2: WHAT WE STAND FOR ----------------------------------------

  function buildStandFor() {
    var eyebrow = allOf('p, span, div').find(function (p) {
      return /^what we stand for$/i.test(textOf(p)) && p.children.length === 0;
    });
    if (!eyebrow) { warn('stand-for "WHAT WE STAND FOR" eyebrow not found'); return null; }

    var section = mkSection(2);

    var ey = pFromText('WHAT WE STAND FOR');
    ey.className = 'eyebrow';
    section.appendChild(ey);

    // The eyebrow and the large statement live in separate wrapper divs under a
    // common C02CopyBlock ancestor. Walk up from the eyebrow until an ancestor
    // also contains the long statement text, then extract that statement by its
    // verbatim text (avoid the eyebrow and any cloned/animation per-char spans).
    var host = eyebrow.parentElement;
    var guard = 0;
    var statementText = '';
    while (host && host.parentElement && guard < 8) {
      var t = textOf(host);
      if (t.length > 60 && /^what we stand for/i.test(t)) {
        // host now contains eyebrow + statement; statement = text after eyebrow.
        statementText = t.replace(/^what we stand for\s*/i, '').trim();
        break;
      }
      host = host.parentElement;
      guard++;
    }
    if (statementText) {
      var lead = pFromText(statementText);
      lead.className = 'lead';
      section.appendChild(lead);
    } else {
      warn('stand-for: statement paragraph not found');
    }

    return section;
  }

  // ---- SECTION 3: INTUIT BLOG (article cards) ------------------------------

  function buildBlog() {
    var region = findRegion(/latest blogs and news from intuit/i);
    if (!region) {
      var h2 = findHeadingByText(/latest blogs and news from intuit/i);
      region = h2 ? blockAround(h2, 5) : null;
    }
    if (!region) { warn('blog region not found'); return null; }

    var section = mkSection(3);

    // Eyebrow "INTUIT BLOG" + h2 as default content above the block.
    var eyebrow = qAll(region, 'p, span').find(function (p) {
      return /^intuit blog$/i.test(textOf(p));
    });
    if (eyebrow) {
      var ey = pFromText('INTUIT BLOG');
      ey.className = 'eyebrow';
      section.appendChild(ey);
    } else {
      warn('blog: "INTUIT BLOG" eyebrow not found');
    }

    var h2 = region.querySelector('h2') || findHeadingByText(/latest blogs and news from intuit/i);
    if (h2) section.appendChild(cloneLeaf(h2, 'h2'));

    // The card-articles parser reads :scope > div[data-card] and, per card,
    // iterates direct children (img + category + h3 + meta-p). So build
    // .article-cards > div[data-card], each holding an <a> wrapper that itself
    // contains img + span.category + h3 + meta <p> (the parser keeps the <a>
    // as the content cell and pulls the img out).
    var cards = document.createElement('div');
    cards.className = 'article-cards';

    var groups = qAll(region, '[role="group"]');
    if (!groups.length) {
      groups = qAll(region, 'article');
    }
    if (!groups.length) warn('blog: no article cards found');

    groups.forEach(function (g) {
      var link = g.querySelector('a[href]');
      var href = link ? link.getAttribute('href') : '';
      var img = g.querySelector('img');
      var h3 = g.querySelector('h3, h4');

      // Meta line ("Published … | … min read") — the paragraph mentioning min read.
      var metaNode = qAll(g, 'p').find(function (p) {
        return /min read/i.test(textOf(p)) || /published/i.test(textOf(p));
      });
      // Category eyebrow: a leaf text node that is not the heading or meta line.
      var categoryNode = qAll(g, 'span, p, div').find(function (n) {
        var t = textOf(n);
        return t.length && n.children.length === 0
          && !/min read|published/i.test(t)
          && (!h3 || t.toLowerCase() !== textOf(h3).toLowerCase());
      });

      var card = document.createElement('div');
      card.setAttribute('data-card', '');

      var imgEl = cloneImg(img);
      if (imgEl) card.appendChild(imgEl);

      if (categoryNode) {
        var cat = pFromText(textOf(categoryNode));
        cat.className = 'category';
        card.appendChild(cat);
      }

      if (h3) {
        // Heading wrapped in the destination link.
        var hp = document.createElement('h3');
        hp.appendChild(anchorFrom(href, textOf(h3)));
        card.appendChild(hp);
      }

      if (metaNode) {
        var mp = document.createElement('p');
        mp.innerHTML = metaNode.innerHTML;
        card.appendChild(mp);
      }

      cards.appendChild(card);
    });

    section.appendChild(cards);

    // "Explore more" link below the cards.
    var explore = qAll(region, 'a[href]').find(function (a) {
      return /explore more/i.test(textOf(a));
    });
    if (explore) {
      var ep = document.createElement('p');
      ep.appendChild(anchorFrom(explore.getAttribute('href'), textOf(explore)));
      section.appendChild(ep);
    }

    return section;
  }

  // ---- SECTION 4: FAST FACTS (stats) ---------------------------------------

  function buildFastFacts() {
    var h2 = findHeadingByText(/impact by the numbers/i);
    var eyebrow = allOf('p, span').find(function (p) { return /^fast facts$/i.test(textOf(p)); });
    if (!h2 && !eyebrow) { warn('fast-facts not found'); return null; }

    var host = h2 ? blockAround(h2, 5) : blockAround(eyebrow, 5);

    var section = mkSection(4);

    if (eyebrow) {
      var ey = pFromText('FAST FACTS');
      ey.className = 'eyebrow';
      section.appendChild(ey);
    } else {
      warn('fast-facts: "FAST FACTS" eyebrow not found');
    }

    if (h2) section.appendChild(cloneLeaf(h2, 'h2'));

    // Intro paragraph (the "Here's what being a customer-focused company…" line).
    var intro = qAll(host, 'p').find(function (p) {
      var t = textOf(p);
      return t.length > 25 && !/^fast facts$/i.test(t)
        && (!h2 || t.toLowerCase() !== textOf(h2).toLowerCase());
    });
    if (intro) section.appendChild(cloneLeaf(intro, 'p'));

    var stats = document.createElement('div');
    stats.className = 'stats';

    // Each stat groups a large number heading (h3) + label + small image.
    // Derive from the stat-number headings within the host.
    var numberHeadings = qAll(host, 'h3, h4').filter(function (h) {
      return /[0-9]/.test(textOf(h));
    });
    if (!numberHeadings.length) warn('fast-facts: no stat number headings found');

    numberHeadings.forEach(function (numH) {
      // Live DOM per stat: <generic CARD>< generic TEXT>(h3 + p)</generic><img></generic>
      // numH's parent is the TEXT wrapper; the CARD is its parent and also holds
      // the sibling <img>. Walk up until we reach an ancestor containing an <img>.
      var card = numH.parentElement;
      var guard = 0;
      while (card && card.parentElement && !card.querySelector('img') && guard < 4) {
        card = card.parentElement;
        guard++;
      }
      if (!card) card = numH.parentElement || numH;

      var stat = document.createElement('div');
      stat.className = 'stat';

      stat.appendChild(cloneLeaf(numH, 'h3'));

      // Label: a paragraph near the number that is neither the number nor intro.
      var label = qAll(card, 'p').find(function (p) {
        var t = textOf(p);
        return t.length
          && t.toLowerCase() !== textOf(numH).toLowerCase()
          && (!intro || t.toLowerCase() !== textOf(intro).toLowerCase());
      });
      if (label) stat.appendChild(cloneLeaf(label, 'p'));
      else warn('fast-facts: label not found for "' + textOf(numH) + '"');

      var img = card.querySelector('img');
      var imgEl = cloneImg(img);
      if (imgEl) stat.appendChild(imgEl);
      else warn('fast-facts: image not found for "' + textOf(numH) + '"');

      stats.appendChild(stat);
    });

    section.appendChild(stats);
    return section;
  }

  // ---- SECTION 5: CUSTOMER STORIES (carousel) ------------------------------

  function buildStories() {
    // The live region's aria-label is the (HTML-escaped) heading markup, so
    // locate by heading text and use its nearest [role="region"] ancestor, or
    // the region that contains role="group"[aria-label^="slide"].
    var h2 = findHeadingByText(/how intuit powers prosperity for customers/i);
    var region = null;
    if (h2) {
      region = h2.closest ? h2.closest('[role="region"]') : null;
    }
    if (!region) {
      // Region whose groups are the "slide N of M" slides.
      region = allOf('[role="region"]').find(function (r) {
        return r.querySelector('[role="group"][aria-label^="slide"]');
      });
    }
    if (!region) region = h2 ? blockAround(h2, 5) : null;
    if (!region && !h2) { warn('customer-stories not found'); return null; }

    var section = mkSection(5);

    if (h2) section.appendChild(cloneLeaf(h2, 'h2'));

    // The carousel-stories parser reads :scope > div[data-slide], and per slide
    // :scope > img (photo + logos) and :scope > p. So slides need direct-child
    // imgs and direct-child <p> (quote + story link as its own <p>).
    var carousel = document.createElement('div');
    carousel.className = 'stories-carousel';

    var groups = qAll(region, '[role="group"][aria-label^="slide"]');
    if (!groups.length) groups = qAll(region, '[role="group"]');
    if (!groups.length) warn('customer-stories: no slides found');

    groups.forEach(function (g, gi) {
      var slide = document.createElement('div');
      slide.setAttribute('data-slide', String(gi + 1));
      slide.className = 'slide';
      slide.setAttribute('aria-label', g.getAttribute('aria-label') || ('slide ' + (gi + 1)));

      var imgs = qAll(g, 'img');
      // First image = the customer photo; remaining images = brand logos.
      // All emitted as direct-child imgs for the parser (photo first).
      imgs.forEach(function (im) {
        var el = cloneImg(im);
        if (el) slide.appendChild(el);
      });

      // Quote paragraph (preserves inner <strong> name verbatim).
      var quote = qAll(g, 'p').find(function (p) { return textOf(p).length > 10; });
      if (quote) slide.appendChild(cloneLeaf(quote, 'p'));

      // Story link, emitted as its own <p> (parser collects :scope > p).
      var link = g.querySelector('a[href]');
      if (link) {
        var lp = document.createElement('p');
        lp.appendChild(anchorFrom(link.getAttribute('href'), textOf(link)));
        slide.appendChild(lp);
      }

      carousel.appendChild(slide);
    });

    section.appendChild(carousel);
    return section;
  }

  // ---- SECTION 6 & 7: COLUMNS (text + image splits) ------------------------

  function buildColumns(n, headingRe) {
    var h2 = findHeadingByText(headingRe);
    if (!h2) { warn('columns section ' + n + ' heading not found'); return null; }

    // Host = the column block: walk up from the h2 until the ancestor also
    // contains the content image (img is a sibling of the text wrapper).
    var host = h2.parentElement;
    var guard = 0;
    while (host && host.parentElement && !host.querySelector('img') && guard < 5) {
      host = host.parentElement;
      guard++;
    }
    if (!host) host = blockAround(h2, 5);

    var section = mkSection(n);

    // The columns-product parser reads DIRECT children of the block element
    // (:scope > h2, :scope > p, :scope > img). So .columns holds the content
    // directly: h2 + body <p> + cta <p>, plus the image as a direct child.
    var columns = document.createElement('div');
    columns.className = 'columns';

    columns.appendChild(cloneLeaf(h2, 'h2'));

    // Body paragraph: first sizable non-CTA paragraph.
    var body = qAll(host, 'p').find(function (p) {
      var t = textOf(p);
      return t.length > 40 && !p.querySelector('a');
    });
    if (body) columns.appendChild(cloneLeaf(body, 'p'));
    else warn('columns ' + n + ': body paragraph not found');

    // CTA links (section 7 has two: "Learn more" + "Read the 2025 …").
    var links = qAll(host, 'a[href]').filter(function (a) {
      var t = textOf(a);
      return t.length && !a.querySelector('img')
        && t.toLowerCase() !== textOf(h2).toLowerCase();
    });
    if (links.length) {
      var p = document.createElement('p');
      links.forEach(function (a, i) {
        if (i > 0) p.appendChild(document.createTextNode(' '));
        p.appendChild(anchorFrom(a.getAttribute('href'), textOf(a)));
      });
      columns.appendChild(p);
    }

    // Image (direct child so the parser's :scope > img picks it up).
    var img = qAll(host, 'img').find(function (im) {
      var src = im.getAttribute('src') || '';
      return !/icon|chevron|arrow|sprite|logoball/i.test(src);
    }) || host.querySelector('img');
    var imgEl = cloneImg(img);
    if (imgEl) columns.appendChild(imgEl);
    else warn('columns ' + n + ': image not found');

    section.appendChild(columns);
    return section;
  }

  // ---- SECTION 8: LINK TILES -----------------------------------------------

  function buildLinkTiles() {
    var eyebrow = allOf('p, span, h2, h3').find(function (p) {
      return /^powering prosperity together$/i.test(textOf(p));
    });

    var hrefMarks = ['/careers/', '/company/', '/technology/'];
    var tiles = allOf('a[href]').filter(function (a) {
      var href = a.getAttribute('href') || '';
      return a.querySelector('img') && a.querySelector('h3, h2, h4')
        && hrefMarks.some(function (m) { return href.indexOf(m) !== -1; });
    });

    if (!eyebrow && !tiles.length) { warn('link-tiles not found'); return null; }

    var section = mkSection(8);

    if (eyebrow) {
      var ey = pFromText('POWERING PROSPERITY TOGETHER');
      ey.className = 'eyebrow';
      section.appendChild(ey);
    } else {
      warn('link-tiles: "POWERING PROSPERITY TOGETHER" eyebrow not found');
    }

    // The card-linktile parser reads :scope > [data-card], and per tile an
    // a[href] + img + h3. So build .link-tiles > div[data-card] > a(img + h3).
    var wrap = document.createElement('div');
    wrap.className = 'link-tiles';

    if (!tiles.length) warn('link-tiles: no tiles found');

    // De-duplicate by href (desktop/mobile dupes), keep document order.
    var seen = {};
    tiles.forEach(function (tile) {
      var href = tile.getAttribute('href') || '';
      if (seen[href]) return;
      seen[href] = true;

      var card = document.createElement('div');
      card.setAttribute('data-card', '');

      var a = document.createElement('a');
      a.setAttribute('href', href);

      var img = tile.querySelector('img');
      var imgEl = cloneImg(img);
      if (imgEl) a.appendChild(imgEl);

      var h3src = tile.querySelector('h3, h2, h4');
      var h3 = document.createElement('h3');
      h3.textContent = textOf(h3src) || (tile.getAttribute('aria-label') || '').trim();
      a.appendChild(h3);

      card.appendChild(a);
      wrap.appendChild(card);
    });

    section.appendChild(wrap);
    return section;
  }

  // ---- assemble ------------------------------------------------------------

  var sections = [
    buildHero(),
    buildStandFor(),
    buildBlog(),
    buildFastFacts(),
    buildStories(),
    buildColumns(6, /products to power prosperity/i),
    buildColumns(7, /powering prosperity beyond products/i),
    buildLinkTiles(),
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
