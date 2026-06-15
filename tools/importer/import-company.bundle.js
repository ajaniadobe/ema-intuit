/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-company.js
  var import_company_exports = {};
  __export(import_company_exports, {
    default: () => import_company_default
  });

  // tools/importer/parsers/hero-company.js
  function parse(element, { document }) {
    const image = element.querySelector(':scope > img, :scope > picture img, img[class*="hero"], picture img');
    const content = element.querySelector(".hero-content") || element;
    const eyebrow = content.querySelector('.eyebrow, [class*="eyebrow"]');
    const heading = content.querySelector('h1, h2, .hero-title, [class*="title"]');
    const supporting = Array.from(content.querySelectorAll("p")).find((p) => !p.classList.contains("eyebrow") && !p.className.toLowerCase().includes("eyebrow") && !p.querySelector("a"));
    const cells = [];
    if (image) {
      cells.push([image]);
    }
    const contentCell = [];
    if (eyebrow) contentCell.push(eyebrow);
    if (heading) contentCell.push(heading);
    if (supporting) contentCell.push(supporting);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-company", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/card-articles.js
  function parse2(element, { document }) {
    const cards = Array.from(element.querySelectorAll(":scope > div[data-card]"));
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(":scope > img, img");
      const contentCell = [];
      Array.from(card.children).forEach((child) => {
        const tag = child.tagName.toLowerCase();
        if (tag === "img") return;
        contentCell.push(child);
      });
      if (image) {
        cells.push([image, contentCell]);
      } else {
        cells.push([contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "card-articles", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/card-stats.js
  function parse3(element, { document }) {
    const cells = [];
    const stats = element.querySelectorAll(":scope > .stat");
    stats.forEach((stat) => {
      const number = stat.querySelector('h3, h2, [class*="number"], [class*="figure"]');
      const label = stat.querySelector('p, [class*="label"], [class*="description"]');
      const image = stat.querySelector("img");
      const contentCell = [];
      if (number) contentCell.push(number);
      if (label) contentCell.push(label);
      cells.push([contentCell, image].map((c) => c == null ? "" : c));
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "card-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-stories.js
  function parse4(element, { document }) {
    const cells = [];
    const slides = Array.from(element.querySelectorAll(":scope > div[data-slide]"));
    slides.forEach((slide) => {
      const images = Array.from(slide.querySelectorAll(":scope > img"));
      const photo = images.length ? images[0] : null;
      const logos = images.slice(1);
      const paragraphs = Array.from(slide.querySelectorAll(":scope > p"));
      const contentCell = [];
      contentCell.push(...logos);
      contentCell.push(...paragraphs);
      cells.push([photo ? [photo] : "", contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-stories", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-product.js
  function parse5(element, { document }) {
    const customerImage = element.querySelector(":scope > img, :scope > picture") || Array.from(element.querySelectorAll("img")).find((img) => !img.closest("p"));
    const eyebrow = Array.from(element.querySelectorAll(":scope > p")).find((p) => p.querySelector("img"));
    const heading = element.querySelector(":scope > h1, :scope > h2, :scope > h3, h2");
    const bodyParagraph = Array.from(element.querySelectorAll(":scope > p")).find(
      (p) => !p.querySelector("img") && !p.querySelector("a")
    );
    const ctaParagraph = Array.from(element.querySelectorAll(":scope > p")).find((p) => p.querySelector("a"));
    const ctaLink = ctaParagraph ? ctaParagraph.querySelector("a") : element.querySelector("a");
    const contentCell = [];
    if (eyebrow) contentCell.push(eyebrow);
    if (heading) contentCell.push(heading);
    if (bodyParagraph) contentCell.push(bodyParagraph);
    if (ctaLink) contentCell.push(ctaParagraph || ctaLink);
    const imageCell = customerImage ? [customerImage] : [];
    const cells = [
      [imageCell, contentCell]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/card-linktile.js
  function parse6(element, { document }) {
    const cells = [];
    const tiles = Array.from(element.querySelectorAll(":scope > [data-card]"));
    tiles.forEach((tile) => {
      const link = tile.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : null;
      const img = tile.querySelector("img");
      const heading = tile.querySelector('h3, h2, h4, [class*="title"]');
      const contentCell = [];
      if (heading) {
        if (href) {
          const anchor = document.createElement("a");
          anchor.setAttribute("href", href);
          anchor.textContent = heading.textContent.trim();
          contentCell.push(anchor);
        } else {
          contentCell.push(heading);
        }
      } else if (href && link) {
        const anchor = document.createElement("a");
        anchor.setAttribute("href", href);
        anchor.textContent = link.textContent.trim();
        contentCell.push(anchor);
      }
      cells.push([img, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "card-linktile", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/intuit-company-normalize.js
  function transform(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    var document = payload && payload.document || element.ownerDocument;
    if (!document) return;
    function warn(msg) {
      try {
        console.warn("[intuit-company-normalize] " + msg);
      } catch (e) {
      }
    }
    function qAll(root, sel) {
      return root ? Array.prototype.slice.call(root.querySelectorAll(sel)) : [];
    }
    function allOf(sel) {
      return Array.prototype.slice.call(document.querySelectorAll(sel));
    }
    function cloneLeaf(node, tag) {
      if (!node) return null;
      var el = document.createElement(tag);
      el.innerHTML = node.innerHTML;
      return el;
    }
    function pFromText(text) {
      var p = document.createElement("p");
      p.textContent = text;
      return p;
    }
    function cloneImg(img) {
      if (!img) return null;
      var n = document.createElement("img");
      var src = img.getAttribute("src") || img.getAttribute("data-src") || (img.getAttribute("srcset") ? img.getAttribute("srcset").split(/\s+/)[0] : "");
      if (src) n.setAttribute("src", src);
      if (img.getAttribute("alt") != null) n.setAttribute("alt", img.getAttribute("alt"));
      return n;
    }
    function anchorFrom(href, text) {
      var a = document.createElement("a");
      a.setAttribute("href", href || "");
      a.textContent = text;
      return a;
    }
    function mkSection(n) {
      var s = document.createElement("section");
      s.setAttribute("data-section", String(n));
      return s;
    }
    function textOf(node) {
      return node ? (node.textContent || "").trim() : "";
    }
    function findHeadingByText(re) {
      return allOf("h1, h2, h3, h4").find(function(h) {
        return re.test(textOf(h));
      }) || null;
    }
    function blockAround(node, levels) {
      var el = node;
      var n = levels || 4;
      while (el && el.parentElement && n > 0) {
        el = el.parentElement;
        n--;
      }
      return el || node;
    }
    function findRegion(re) {
      return allOf('[role="region"]').find(function(r) {
        return re.test(r.getAttribute("aria-label") || "");
      }) || null;
    }
    function buildHero() {
      var h1 = findHeadingByText(/powering prosperity around the world/i);
      if (!h1) {
        warn('hero h1 "Powering prosperity around the world" not found');
        return null;
      }
      var host = blockAround(h1, 5);
      var section = mkSection(1);
      var hero = document.createElement("div");
      hero.className = "hero";
      var img = qAll(host, "img").find(function(im) {
        var src = im.getAttribute("src") || "";
        return !/logoball|icon|chevron|arrow|sprite/i.test(src);
      }) || qAll(host, "img")[0];
      var imgEl = cloneImg(img);
      if (imgEl) hero.appendChild(imgEl);
      else warn("hero: customer photo not found");
      var content = document.createElement("div");
      content.className = "hero-content";
      var eyebrow = qAll(host, "p").find(function(p) {
        return /^our mission$/i.test(textOf(p));
      });
      if (eyebrow) {
        var ey = pFromText(textOf(eyebrow));
        ey.className = "eyebrow";
        content.appendChild(ey);
      } else {
        warn('hero: "OUR MISSION" eyebrow not found');
      }
      content.appendChild(cloneLeaf(h1, "h1"));
      var supporting = qAll(host, "p").find(function(p) {
        var t = textOf(p);
        return t.length && !/^our mission$/i.test(t) && t.toLowerCase() !== textOf(h1).toLowerCase() && !p.querySelector("a, button");
      });
      if (supporting) content.appendChild(cloneLeaf(supporting, "p"));
      else warn("hero: supporting paragraph not found");
      hero.appendChild(content);
      section.appendChild(hero);
      return section;
    }
    function buildStandFor() {
      var eyebrow = allOf("p, span, div").find(function(p) {
        return /^what we stand for$/i.test(textOf(p)) && p.children.length === 0;
      });
      if (!eyebrow) {
        warn('stand-for "WHAT WE STAND FOR" eyebrow not found');
        return null;
      }
      var section = mkSection(2);
      var ey = pFromText("WHAT WE STAND FOR");
      ey.className = "eyebrow";
      section.appendChild(ey);
      var host = eyebrow.parentElement;
      var guard = 0;
      var statementText = "";
      while (host && host.parentElement && guard < 8) {
        var t = textOf(host);
        if (t.length > 60 && /^what we stand for/i.test(t)) {
          statementText = t.replace(/^what we stand for\s*/i, "").trim();
          break;
        }
        host = host.parentElement;
        guard++;
      }
      if (statementText) {
        var lead = pFromText(statementText);
        lead.className = "lead";
        section.appendChild(lead);
      } else {
        warn("stand-for: statement paragraph not found");
      }
      return section;
    }
    function buildBlog() {
      var region = findRegion(/latest blogs and news from intuit/i);
      if (!region) {
        var h2 = findHeadingByText(/latest blogs and news from intuit/i);
        region = h2 ? blockAround(h2, 5) : null;
      }
      if (!region) {
        warn("blog region not found");
        return null;
      }
      var section = mkSection(3);
      var eyebrow = qAll(region, "p, span").find(function(p) {
        return /^intuit blog$/i.test(textOf(p));
      });
      if (eyebrow) {
        var ey = pFromText("INTUIT BLOG");
        ey.className = "eyebrow";
        section.appendChild(ey);
      } else {
        warn('blog: "INTUIT BLOG" eyebrow not found');
      }
      var h2 = region.querySelector("h2") || findHeadingByText(/latest blogs and news from intuit/i);
      if (h2) section.appendChild(cloneLeaf(h2, "h2"));
      var cards = document.createElement("div");
      cards.className = "article-cards";
      var groups = qAll(region, '[role="group"]');
      if (!groups.length) {
        groups = qAll(region, "article");
      }
      if (!groups.length) warn("blog: no article cards found");
      groups.forEach(function(g) {
        var link = g.querySelector("a[href]");
        var href = link ? link.getAttribute("href") : "";
        var img = g.querySelector("img");
        var h3 = g.querySelector("h3, h4");
        var metaNode = qAll(g, "p").find(function(p) {
          return /min read/i.test(textOf(p)) || /published/i.test(textOf(p));
        });
        var categoryNode = qAll(g, "span, p, div").find(function(n) {
          var t = textOf(n);
          return t.length && n.children.length === 0 && !/min read|published/i.test(t) && (!h3 || t.toLowerCase() !== textOf(h3).toLowerCase());
        });
        var card = document.createElement("div");
        card.setAttribute("data-card", "");
        var imgEl = cloneImg(img);
        if (imgEl) card.appendChild(imgEl);
        if (categoryNode) {
          var cat = pFromText(textOf(categoryNode));
          cat.className = "category";
          card.appendChild(cat);
        }
        if (h3) {
          var hp = document.createElement("h3");
          hp.appendChild(anchorFrom(href, textOf(h3)));
          card.appendChild(hp);
        }
        if (metaNode) {
          var mp = document.createElement("p");
          mp.innerHTML = metaNode.innerHTML;
          card.appendChild(mp);
        }
        cards.appendChild(card);
      });
      section.appendChild(cards);
      var explore = qAll(region, "a[href]").find(function(a) {
        return /explore more/i.test(textOf(a));
      });
      if (explore) {
        var ep = document.createElement("p");
        ep.appendChild(anchorFrom(explore.getAttribute("href"), textOf(explore)));
        section.appendChild(ep);
      }
      return section;
    }
    function buildFastFacts() {
      var h2 = findHeadingByText(/impact by the numbers/i);
      var eyebrow = allOf("p, span").find(function(p) {
        return /^fast facts$/i.test(textOf(p));
      });
      if (!h2 && !eyebrow) {
        warn("fast-facts not found");
        return null;
      }
      var host = h2 ? blockAround(h2, 5) : blockAround(eyebrow, 5);
      var section = mkSection(4);
      if (eyebrow) {
        var ey = pFromText("FAST FACTS");
        ey.className = "eyebrow";
        section.appendChild(ey);
      } else {
        warn('fast-facts: "FAST FACTS" eyebrow not found');
      }
      if (h2) section.appendChild(cloneLeaf(h2, "h2"));
      var intro = qAll(host, "p").find(function(p) {
        var t = textOf(p);
        return t.length > 25 && !/^fast facts$/i.test(t) && (!h2 || t.toLowerCase() !== textOf(h2).toLowerCase());
      });
      if (intro) section.appendChild(cloneLeaf(intro, "p"));
      var stats = document.createElement("div");
      stats.className = "stats";
      var numberHeadings = qAll(host, "h3, h4").filter(function(h) {
        return /[0-9]/.test(textOf(h));
      });
      if (!numberHeadings.length) warn("fast-facts: no stat number headings found");
      numberHeadings.forEach(function(numH) {
        var card = numH.parentElement;
        var guard = 0;
        while (card && card.parentElement && !card.querySelector("img") && guard < 4) {
          card = card.parentElement;
          guard++;
        }
        if (!card) card = numH.parentElement || numH;
        var stat = document.createElement("div");
        stat.className = "stat";
        stat.appendChild(cloneLeaf(numH, "h3"));
        var label = qAll(card, "p").find(function(p) {
          var t = textOf(p);
          return t.length && t.toLowerCase() !== textOf(numH).toLowerCase() && (!intro || t.toLowerCase() !== textOf(intro).toLowerCase());
        });
        if (label) stat.appendChild(cloneLeaf(label, "p"));
        else warn('fast-facts: label not found for "' + textOf(numH) + '"');
        var img = card.querySelector("img");
        var imgEl = cloneImg(img);
        if (imgEl) stat.appendChild(imgEl);
        else warn('fast-facts: image not found for "' + textOf(numH) + '"');
        stats.appendChild(stat);
      });
      section.appendChild(stats);
      return section;
    }
    function buildStories() {
      var h2 = findHeadingByText(/how intuit powers prosperity for customers/i);
      var region = null;
      if (h2) {
        region = h2.closest ? h2.closest('[role="region"]') : null;
      }
      if (!region) {
        region = allOf('[role="region"]').find(function(r) {
          return r.querySelector('[role="group"][aria-label^="slide"]');
        });
      }
      if (!region) region = h2 ? blockAround(h2, 5) : null;
      if (!region && !h2) {
        warn("customer-stories not found");
        return null;
      }
      var section = mkSection(5);
      if (h2) section.appendChild(cloneLeaf(h2, "h2"));
      var carousel = document.createElement("div");
      carousel.className = "stories-carousel";
      var groups = qAll(region, '[role="group"][aria-label^="slide"]');
      if (!groups.length) groups = qAll(region, '[role="group"]');
      if (!groups.length) warn("customer-stories: no slides found");
      groups.forEach(function(g, gi) {
        var slide = document.createElement("div");
        slide.setAttribute("data-slide", String(gi + 1));
        slide.className = "slide";
        slide.setAttribute("aria-label", g.getAttribute("aria-label") || "slide " + (gi + 1));
        var imgs = qAll(g, "img");
        imgs.forEach(function(im) {
          var el = cloneImg(im);
          if (el) slide.appendChild(el);
        });
        var quote = qAll(g, "p").find(function(p) {
          return textOf(p).length > 10;
        });
        if (quote) slide.appendChild(cloneLeaf(quote, "p"));
        var link = g.querySelector("a[href]");
        if (link) {
          var lp = document.createElement("p");
          lp.appendChild(anchorFrom(link.getAttribute("href"), textOf(link)));
          slide.appendChild(lp);
        }
        carousel.appendChild(slide);
      });
      section.appendChild(carousel);
      return section;
    }
    function buildColumns(n, headingRe) {
      var h2 = findHeadingByText(headingRe);
      if (!h2) {
        warn("columns section " + n + " heading not found");
        return null;
      }
      var host = h2.parentElement;
      var guard = 0;
      while (host && host.parentElement && !host.querySelector("img") && guard < 5) {
        host = host.parentElement;
        guard++;
      }
      if (!host) host = blockAround(h2, 5);
      var section = mkSection(n);
      var columns = document.createElement("div");
      columns.className = "columns";
      columns.appendChild(cloneLeaf(h2, "h2"));
      var body2 = qAll(host, "p").find(function(p2) {
        var t = textOf(p2);
        return t.length > 40 && !p2.querySelector("a");
      });
      if (body2) columns.appendChild(cloneLeaf(body2, "p"));
      else warn("columns " + n + ": body paragraph not found");
      var links = qAll(host, "a[href]").filter(function(a) {
        var t = textOf(a);
        return t.length && !a.querySelector("img") && t.toLowerCase() !== textOf(h2).toLowerCase();
      });
      if (links.length) {
        var p = document.createElement("p");
        links.forEach(function(a, i) {
          if (i > 0) p.appendChild(document.createTextNode(" "));
          p.appendChild(anchorFrom(a.getAttribute("href"), textOf(a)));
        });
        columns.appendChild(p);
      }
      var img = qAll(host, "img").find(function(im) {
        var src = im.getAttribute("src") || "";
        return !/icon|chevron|arrow|sprite|logoball/i.test(src);
      }) || host.querySelector("img");
      var imgEl = cloneImg(img);
      if (imgEl) columns.appendChild(imgEl);
      else warn("columns " + n + ": image not found");
      section.appendChild(columns);
      return section;
    }
    function buildLinkTiles() {
      var eyebrow = allOf("p, span, h2, h3").find(function(p) {
        return /^powering prosperity together$/i.test(textOf(p));
      });
      var hrefMarks = ["/careers/", "/company/", "/technology/"];
      var tiles = allOf("a[href]").filter(function(a) {
        var href = a.getAttribute("href") || "";
        return a.querySelector("img") && a.querySelector("h3, h2, h4") && hrefMarks.some(function(m) {
          return href.indexOf(m) !== -1;
        });
      });
      if (!eyebrow && !tiles.length) {
        warn("link-tiles not found");
        return null;
      }
      var section = mkSection(8);
      if (eyebrow) {
        var ey = pFromText("POWERING PROSPERITY TOGETHER");
        ey.className = "eyebrow";
        section.appendChild(ey);
      } else {
        warn('link-tiles: "POWERING PROSPERITY TOGETHER" eyebrow not found');
      }
      var wrap = document.createElement("div");
      wrap.className = "link-tiles";
      if (!tiles.length) warn("link-tiles: no tiles found");
      var seen = {};
      tiles.forEach(function(tile) {
        var href = tile.getAttribute("href") || "";
        if (seen[href]) return;
        seen[href] = true;
        var card = document.createElement("div");
        card.setAttribute("data-card", "");
        var a = document.createElement("a");
        a.setAttribute("href", href);
        var img = tile.querySelector("img");
        var imgEl = cloneImg(img);
        if (imgEl) a.appendChild(imgEl);
        var h3src = tile.querySelector("h3, h2, h4");
        var h3 = document.createElement("h3");
        h3.textContent = textOf(h3src) || (tile.getAttribute("aria-label") || "").trim();
        a.appendChild(h3);
        card.appendChild(a);
        wrap.appendChild(card);
      });
      section.appendChild(wrap);
      return section;
    }
    var sections = [
      buildHero(),
      buildStandFor(),
      buildBlog(),
      buildFastFacts(),
      buildStories(),
      buildColumns(6, /products to power prosperity/i),
      buildColumns(7, /powering prosperity beyond products/i),
      buildLinkTiles()
    ].filter(Boolean);
    if (!sections.length) {
      warn("no sections built \u2014 leaving DOM untouched");
      return;
    }
    var main = document.createElement("main");
    sections.forEach(function(s) {
      main.appendChild(s);
    });
    var body = element && element.tagName && element.tagName.toLowerCase() === "body" ? element : document.body;
    if (body) {
      body.innerHTML = "";
      body.appendChild(main);
    } else {
      warn("document.body not available; appending sections to passed element");
      sections.forEach(function(s) {
        element.appendChild(s);
      });
    }
  }

  // tools/importer/transformers/intuit-cleanup.js
  function transform2(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk",
        ".onetrust-pc-dark-filter",
        ".ot-sdk-container",
        '[id*="onetrust"]',
        '[class*="onetrust"]',
        '[id*="truste"]',
        '[class*="truste"]',
        '[class*="cookie"]',
        '[id*="cookie"]',
        '[role="alertdialog"]'
      ]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        '[role="banner"]',
        '[role="navigation"]',
        '[role="contentinfo"]',
        '[aria-label="Primary"]',
        '[aria-label="Main navigation"]',
        '[class*="header"]',
        '[class*="footer"]',
        '[class*="navigation"]',
        '[class*="megamenu"]',
        '[class*="mega-menu"]',
        '[class*="country-switcher"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "iframe",
        "link",
        "source",
        "template",
        'svg[aria-hidden="true"]'
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
        el.removeAttribute("data-tracking");
        el.removeAttribute("data-wa-link");
      });
    }
  }

  // tools/importer/transformers/intuit-sections.js
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    var template = payload && payload.template || {};
    var sectionList = [];
    if (template.sections && Array.isArray(template.sections) && template.sections.length) {
      template.sections.forEach(function(s) {
        if (s && s.selector) {
          sectionList.push({ selector: s.selector, style: s.style || null });
        }
      });
    } else if (template.blocks && Array.isArray(template.blocks)) {
      template.blocks.forEach(function(b) {
        if (b && b.section && b.instances && b.instances.length) {
          sectionList.push({ selector: b.instances[0], style: b.section });
        }
      });
    }
    var allSections = Array.prototype.slice.call(
      element.querySelectorAll("section[data-section]")
    );
    var ordered = allSections.map(function(el) {
      var match = null;
      sectionList.forEach(function(s) {
        var target = element.querySelector(s.selector);
        if (target === el || el.matches(s.selector) || el.contains(target)) {
          match = s;
        }
      });
      return { el, style: match ? match.style : null };
    });
    for (var i = ordered.length - 1; i >= 0; i--) {
      var entry = ordered[i];
      if (entry.style) {
        var metaBlock = WebImporter.Blocks.createBlock(payload.document, {
          name: "Section Metadata",
          cells: { style: entry.style }
        });
        entry.el.appendChild(metaBlock);
      }
      if (i > 0) {
        var hr = payload.document.createElement("hr");
        entry.el.parentNode.insertBefore(hr, entry.el);
      }
    }
  }

  // tools/importer/import-company.js
  var parsers = {
    "hero-company": parse,
    "card-articles": parse2,
    "card-stats": parse3,
    "carousel-stories": parse4,
    "columns-product": parse5,
    "card-linktile": parse6
  };
  var PAGE_TEMPLATE = {
    name: "company",
    description: "Intuit Company landing page (corporate about): light hero, blog card grid, fast-facts stat cards, customer-stories carousel, two columns splits, and a link-tile row.",
    urls: ["https://www.intuit.com/company/"],
    blocks: [
      { name: "hero-company", instances: ['section[data-section="1"] .hero'] },
      { name: "card-articles", instances: ['section[data-section="3"] .article-cards'] },
      { name: "card-stats", instances: ['section[data-section="4"] .stats'] },
      { name: "carousel-stories", instances: ['section[data-section="5"] .stories-carousel'] },
      {
        name: "columns-product",
        instances: [
          'section[data-section="6"] .columns',
          'section[data-section="7"] .columns'
        ]
      },
      { name: "card-linktile", instances: ['section[data-section="8"] .link-tiles'] },
      { name: "section-stand-for", instances: ['section[data-section="2"]'], section: "light" },
      { name: "section-blog", instances: ['section[data-section="3"]'], section: "light" },
      { name: "section-fast-facts", instances: ['section[data-section="4"]'], section: "light" },
      { name: "section-stories", instances: ['section[data-section="5"]'], section: "light" },
      { name: "section-products", instances: ['section[data-section="6"]'], section: "light" },
      { name: "section-beyond", instances: ['section[data-section="7"]'], section: "light" },
      { name: "section-together", instances: ['section[data-section="8"]'], section: "light-green" }
    ]
  };
  var transformers = [
    transform,
    transform2,
    transform3
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.filter((blockDef) => !blockDef.name.startsWith("section-")).forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_company_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_company_exports);
})();
