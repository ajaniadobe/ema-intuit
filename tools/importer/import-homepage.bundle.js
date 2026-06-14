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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-platform.js
  function parse(element, { document }) {
    const heading = element.querySelector('h1, h2, .hero-title, [class*="title"]');
    const subheading = Array.from(element.querySelectorAll(":scope > p")).find((p) => !p.querySelector("a"));
    const ctaLinks = Array.from(element.querySelectorAll("a[href]"));
    const bgImage = element.querySelector('img[class*="background"], img[class*="hero-bg"], picture img');
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subheading) contentCell.push(subheading);
    contentCell.push(...ctaLinks);
    cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-platform", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/advanced-tabs-product.js
  function parse2(element, { document }) {
    const tabLabels = {
      turbotax: "Your taxes done right",
      creditkarma: "Make financial progress",
      quickbooks: "Run your business",
      mailchimp: "Grow your business"
    };
    const panels = Array.from(element.querySelectorAll(":scope > div[data-panel]"));
    const cells = [];
    panels.forEach((panel) => {
      const key = (panel.getAttribute("data-panel") || "").trim().toLowerCase();
      let label = tabLabels[key];
      if (!label) {
        const eyebrow = panel.querySelector("p img") ? panel.querySelector("p img").closest("p") : null;
        const eyebrowText = eyebrow ? eyebrow.textContent.trim() : "";
        label = eyebrowText || key;
      }
      cells.push([label, panel]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "advanced-tabs-product",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-product.js
  function parse3(element, { document }) {
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

  // tools/importer/parsers/advanced-tabs-stories.js
  function parse4(element, { document }) {
    const pills = Array.from(element.querySelectorAll(":scope > div[data-pill]"));
    const cells = [];
    pills.forEach((pill) => {
      const labelEl = pill.querySelector(':scope > h3, h3, h2, [class*="title"]');
      const label = labelEl ? labelEl.textContent.trim() : pill.getAttribute("data-pill") || "";
      if (labelEl) labelEl.remove();
      cells.push([label, pill]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "advanced-tabs-stories",
      cells
    });
    const heading = element.querySelector(":scope > h1, :scope > h2");
    if (heading) {
      element.replaceWith(heading, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/carousel-stories.js
  function parse5(element, { document }) {
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

  // tools/importer/parsers/card-articles.js
  function parse6(element, { document }) {
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

  // tools/importer/parsers/card-linktile.js
  function parse7(element, { document }) {
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

  // tools/importer/transformers/intuit-normalize.js
  function transform(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    var document = payload && payload.document || element.ownerDocument;
    if (!document) return;
    function warn(msg) {
      try {
        console.warn("[intuit-normalize] " + msg);
      } catch (e) {
      }
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
      if (img.getAttribute("src")) n.setAttribute("src", img.getAttribute("src"));
      if (img.getAttribute("alt") != null) n.setAttribute("alt", img.getAttribute("alt"));
      return n;
    }
    function anchorFrom(href, text) {
      var a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = text;
      return a;
    }
    function isDuration(text) {
      return /^\d{1,2}:\d{2}$/.test((text || "").trim());
    }
    function qAll(root, sel) {
      return root ? Array.prototype.slice.call(root.querySelectorAll(sel)) : [];
    }
    function buildHero() {
      var hero = document.querySelector("#icom-hp-hero");
      if (!hero) {
        warn("hero #icom-hp-hero not found");
        return null;
      }
      var section = document.createElement("section");
      section.setAttribute("data-section", "hero");
      var h1 = hero.querySelector("h1");
      if (h1) section.appendChild(cloneLeaf(h1, "h1"));
      var subhead = qAll(hero, "p").find(function(p) {
        return !p.querySelector("a") && p.textContent.trim().length;
      });
      if (subhead) section.appendChild(cloneLeaf(subhead, "p"));
      var ctaBtn = qAll(hero, "button, a").find(function(b) {
        return /see it in action/i.test(b.textContent.trim());
      });
      var ctaText = ctaBtn ? ctaBtn.textContent.trim() : "See it in action";
      var ctaHref = ctaBtn && ctaBtn.tagName.toLowerCase() === "a" && ctaBtn.getAttribute("href") ? ctaBtn.getAttribute("href") : "#see-it-in-action";
      var ctaP = document.createElement("p");
      ctaP.appendChild(anchorFrom(ctaHref, ctaText));
      section.appendChild(ctaP);
      return section;
    }
    function buildProductShowcase() {
      var container = document.querySelector('[class*="C03ProductCarousel-container"]');
      if (!container) {
        warn("product-showcase container not found");
        return null;
      }
      var section = document.createElement("section");
      section.setAttribute("data-section", "product-showcase");
      var assets = qAll(container, '[class*="C03ProductCarouselItem-assets-wrapper"]');
      var contents = qAll(container, '[class*="C03ProductCarouselItem-content-wrapper"]');
      var logos = qAll(container, "img").filter(function(im) {
        return /logoball/.test(im.getAttribute("src") || "");
      });
      var keyByEyebrow = {
        "turbotax": "turbotax",
        "credit karma": "creditkarma",
        "quickbooks": "quickbooks",
        "mailchimp": "mailchimp"
      };
      if (!contents.length) {
        warn("product-showcase: no content panels found");
      }
      contents.forEach(function(cw, i) {
        var ps = qAll(cw, "p");
        var eyebrowSrc = ps[0];
        var bodySrc = ps[1];
        var h2 = cw.querySelector("h2");
        var cta = cw.querySelector('[class*="cta-wrapper"] a, [class*="cta-wrapper"] button, a, button');
        var eyebrowText = eyebrowSrc ? eyebrowSrc.textContent.trim() : "";
        var key = keyByEyebrow[eyebrowText.toLowerCase()] || "panel-" + (i + 1);
        var panel = document.createElement("div");
        panel.setAttribute("data-panel", key);
        var cols = document.createElement("div");
        cols.setAttribute("data-cols", "");
        var photo = assets[i] ? assets[i].querySelector("img") : null;
        var photoEl = cloneImg(photo);
        if (photoEl) cols.appendChild(photoEl);
        else warn('product-showcase: panel "' + key + '" missing customer photo');
        var eyebrowP = document.createElement("p");
        var logoEl = cloneImg(logos[i]);
        if (logoEl) {
          if (!logoEl.getAttribute("alt")) logoEl.setAttribute("alt", eyebrowText);
          eyebrowP.appendChild(logoEl);
          eyebrowP.appendChild(document.createTextNode(" "));
        }
        if (eyebrowSrc) eyebrowP.appendChild(document.createTextNode(eyebrowText));
        cols.appendChild(eyebrowP);
        if (h2) cols.appendChild(cloneLeaf(h2, "h2"));
        if (bodySrc) cols.appendChild(cloneLeaf(bodySrc, "p"));
        if (cta) {
          var realA = cta.tagName.toLowerCase() === "a" ? cta : cta.querySelector("a");
          if (realA && realA.getAttribute("href")) {
            var ctaP = document.createElement("p");
            ctaP.appendChild(anchorFrom(realA.getAttribute("href"), realA.textContent.trim()));
            cols.appendChild(ctaP);
          }
        }
        panel.appendChild(cols);
        section.appendChild(panel);
      });
      return section;
    }
    function buildCustomerSuccess() {
      var h2 = Array.prototype.slice.call(document.querySelectorAll("h2")).find(function(h) {
        return /how intuit drives success/i.test(h.textContent);
      });
      var audiences = ["Small Businesses", "Individuals", "Mid-Market Businesses"];
      var regions = audiences.map(function(al) {
        return { label: al, el: document.querySelector('[role="region"][aria-label="' + al + '"]') };
      });
      if (!h2 && !regions.some(function(r) {
        return r.el;
      })) {
        warn("customer-success not found");
        return null;
      }
      var section = document.createElement("section");
      section.setAttribute("data-section", "customer-success");
      if (h2) section.appendChild(cloneLeaf(h2, "h2"));
      regions.forEach(function(r) {
        if (!r.el) {
          warn('customer-success: audience region "' + r.label + '" not found');
          return;
        }
        var pill = document.createElement("div");
        pill.setAttribute("data-pill", r.label.toLowerCase().replace(/\s+/g, "-"));
        var h3 = document.createElement("h3");
        h3.textContent = r.label;
        pill.appendChild(h3);
        var carousel = document.createElement("div");
        carousel.setAttribute("data-carousel", "");
        var groups = qAll(r.el, '[role="group"]');
        if (!groups.length) warn('customer-success: no slides in "' + r.label + '"');
        groups.forEach(function(g, gi) {
          var slide = document.createElement("div");
          slide.setAttribute("data-slide", String(gi + 1));
          var imgs = qAll(g, "img");
          if (imgs.length) {
            var photo = cloneImg(imgs[0]);
            if (photo) slide.appendChild(photo);
          }
          imgs.slice(1).forEach(function(logo) {
            var l = cloneImg(logo);
            if (l) slide.appendChild(l);
          });
          var quotes = qAll(g, "p").filter(function(p) {
            var t = p.textContent.trim();
            return t.length && !isDuration(t);
          });
          quotes.forEach(function(q) {
            slide.appendChild(cloneLeaf(q, "p"));
          });
          var link = g.querySelector("a[href]");
          if (link) {
            var lp = document.createElement("p");
            lp.appendChild(anchorFrom(link.getAttribute("href") || "", link.textContent.trim()));
            slide.appendChild(lp);
          }
          carousel.appendChild(slide);
        });
        pill.appendChild(carousel);
        section.appendChild(pill);
      });
      return section;
    }
    function buildInnovation() {
      var region = Array.prototype.slice.call(document.querySelectorAll('[role="region"]')).find(function(r) {
        return /innovation, action/i.test(r.getAttribute("aria-label") || "") || r.querySelector("h2") && /innovation, action/i.test(r.querySelector("h2").textContent || "");
      });
      if (!region) {
        region = document.querySelector("#articles");
      }
      if (!region) {
        warn("innovation region not found");
        return null;
      }
      var section = document.createElement("section");
      section.setAttribute("data-section", "innovation");
      var h2 = region.querySelector("h2");
      if (h2) section.appendChild(cloneLeaf(h2, "h2"));
      var cardsWrap = document.createElement("div");
      cardsWrap.setAttribute("data-cards", "");
      var h3s = qAll(region, "h3");
      if (!h3s.length) warn("innovation: no cards found");
      h3s.forEach(function(h3, i) {
        var card = h3;
        while (card && card.parentElement && card.parentElement.querySelectorAll("h3").length <= 1) {
          card = card.parentElement;
        }
        if (!card) card = h3;
        var div = document.createElement("div");
        div.setAttribute("data-card", String(i + 1));
        var img = card.querySelector("img");
        if (img) {
          var imgEl = cloneImg(img);
          if (imgEl) div.appendChild(imgEl);
        } else {
          div.setAttribute("data-no-image", "true");
        }
        var paras = qAll(card, "p").filter(function(p) {
          return p.textContent.trim().length && !p.querySelector("a");
        });
        var link = card.querySelector("a[href]");
        var isCta = !img && !paras.length && link;
        if (isCta) div.setAttribute("data-cta-card", "true");
        if (paras[0]) div.appendChild(pFromText(paras[0].textContent.trim()));
        div.appendChild(cloneLeaf(h3, "h3"));
        paras.slice(1).forEach(function(p) {
          div.appendChild(pFromText(p.textContent.trim()));
        });
        if (link) {
          var lp = document.createElement("p");
          lp.appendChild(anchorFrom(link.getAttribute("href") || "", link.textContent.trim()));
          div.appendChild(lp);
        }
        cardsWrap.appendChild(div);
      });
      section.appendChild(cardsWrap);
      return section;
    }
    function buildDrivingSuccess() {
      var h2 = Array.prototype.slice.call(document.querySelectorAll("h2")).find(function(h) {
        return /driving success together/i.test(h.textContent);
      });
      var hrefMarks = ["/careers/", "/company/", "/technology/"];
      var tiles = Array.prototype.slice.call(document.querySelectorAll("a[href]")).filter(function(a) {
        var href = a.getAttribute("href") || "";
        return a.querySelector("img") && hrefMarks.some(function(m) {
          return href.indexOf(m) !== -1;
        });
      });
      if (!h2 && !tiles.length) {
        warn("driving-success not found");
        return null;
      }
      var section = document.createElement("section");
      section.setAttribute("data-section", "driving-success");
      if (h2) section.appendChild(cloneLeaf(h2, "h2"));
      var cardsWrap = document.createElement("div");
      cardsWrap.setAttribute("data-cards", "");
      if (!tiles.length) warn("driving-success: no link tiles found");
      tiles.forEach(function(tile) {
        var div = document.createElement("div");
        div.setAttribute("data-card", "");
        var a = document.createElement("a");
        a.setAttribute("href", tile.getAttribute("href") || "");
        var img = tile.querySelector("img");
        var imgEl = cloneImg(img);
        if (imgEl) a.appendChild(imgEl);
        var h3src = tile.querySelector("h3, h2, h4");
        var title = h3src ? h3src.textContent.trim() : (tile.getAttribute("aria-label") || "").trim();
        var h3 = document.createElement("h3");
        h3.textContent = title;
        a.appendChild(h3);
        div.appendChild(a);
        cardsWrap.appendChild(div);
      });
      section.appendChild(cardsWrap);
      return section;
    }
    var sections = [
      buildHero(),
      buildProductShowcase(),
      buildCustomerSuccess(),
      buildInnovation(),
      buildDrivingSuccess()
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

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-platform": parse,
    "advanced-tabs-product": parse2,
    "columns-product": parse3,
    "advanced-tabs-stories": parse4,
    "carousel-stories": parse5,
    "card-articles": parse6,
    "card-linktile": parse7
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Intuit en-US homepage: hero, product showcase tabs, customer success carousel, innovation card grid, and link-card row.",
    urls: ["https://www.intuit.com/"],
    blocks: [
      { name: "hero-platform", instances: ['section[data-section="hero"]'] },
      { name: "advanced-tabs-product", instances: ['section[data-section="product-showcase"]'] },
      { name: "columns-product", instances: ['section[data-section="product-showcase"] div[data-cols]'] },
      { name: "advanced-tabs-stories", instances: ['section[data-section="customer-success"]'] },
      { name: "carousel-stories", instances: ['section[data-section="customer-success"] div[data-carousel]'] },
      { name: "card-articles", instances: ['section[data-section="innovation"] div[data-cards]'] },
      { name: "card-linktile", instances: ['section[data-section="driving-success"] div[data-cards]'] },
      { name: "section-product-showcase", instances: ['section[data-section="product-showcase"]'], section: "light-grey" },
      { name: "section-customer-success", instances: ['section[data-section="customer-success"]'], section: "light" },
      { name: "section-innovation", instances: ['section[data-section="innovation"]'], section: "light" },
      { name: "section-driving-success", instances: ['section[data-section="driving-success"]'], section: "sky-blue" }
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
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      const innerFirst = ["columns-product", "carousel-stories"];
      pageBlocks.sort((a, b) => {
        const ai = innerFirst.includes(a.name) ? 0 : 1;
        const bi = innerFirst.includes(b.name) ? 0 : 1;
        return ai - bi;
      });
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
  return __toCommonJS(import_homepage_exports);
})();
