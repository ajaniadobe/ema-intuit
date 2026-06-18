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

  // tools/importer/import-accessibility.js
  var import_accessibility_exports = {};
  __export(import_accessibility_exports, {
    default: () => import_accessibility_default
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

  // tools/importer/parsers/columns-product.js
  function parse2(element, { document }) {
    const customerImage = element.querySelector(":scope > img, :scope > picture") || Array.from(element.querySelectorAll("img")).find((img) => !img.closest("p"));
    const eyebrow = Array.from(element.querySelectorAll(":scope > p")).find((p) => p.querySelector("img"));
    const heading = element.querySelector(":scope > h1, :scope > h2, :scope > h3, h2");
    const bodyParagraphs = Array.from(element.querySelectorAll(":scope > p")).filter(
      (p) => !p.querySelector("img") && !p.querySelector("a")
    );
    const ctaParagraph = Array.from(element.querySelectorAll(":scope > p")).find((p) => p.querySelector("a"));
    const ctaLink = ctaParagraph ? ctaParagraph.querySelector("a") : element.querySelector("a");
    const contentCell = [];
    if (eyebrow) contentCell.push(eyebrow);
    if (heading) contentCell.push(heading);
    bodyParagraphs.forEach((p) => contentCell.push(p));
    if (ctaLink) contentCell.push(ctaParagraph || ctaLink);
    const imageCell = customerImage ? [customerImage] : [];
    const cells = [
      [imageCell, contentCell]
    ];
    const imageLeft = element.classList && element.classList.contains("image-left");
    const name = imageLeft ? "columns-product (z-pattern)" : "columns-product";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/intuit-accessibility-normalize.js
  function transform(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    var document = payload && payload.document || element.ownerDocument;
    if (!document) return;
    function warn(msg) {
      try {
        console.warn("[intuit-accessibility-normalize] " + msg);
      } catch (e) {
      }
    }
    function qAll(root, sel) {
      return root ? Array.prototype.slice.call(root.querySelectorAll(sel)) : [];
    }
    function allOf(sel) {
      return Array.prototype.slice.call(document.querySelectorAll(sel));
    }
    function textOf(node) {
      return node ? (node.textContent || "").trim() : "";
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
    function findHeadingByText(re) {
      return allOf("h1, h2, h3, h4").find(function(h) {
        return re.test(textOf(h));
      }) || null;
    }
    function hostWithImage(node, levels) {
      var el = node ? node.parentElement : null;
      var n = levels || 5;
      while (el && el.parentElement && !el.querySelector("img") && n > 0) {
        el = el.parentElement;
        n--;
      }
      return el || (node ? node.parentElement : null) || node;
    }
    function isStructuralImg(im) {
      var src = im.getAttribute("src") || "";
      return /logoball|icon|chevron|arrow|sprite|glyph/i.test(src);
    }
    function buildHero() {
      var h1 = findHeadingByText(/powering prosperity for everyone/i);
      if (!h1) {
        warn('hero h1 "Powering prosperity for everyone" not found');
        return null;
      }
      var host = hostWithImage(h1, 6);
      var section = document.createElement("section");
      section.className = "hero-section";
      section.setAttribute("data-section", "1");
      var img = qAll(host, "img").find(function(im) {
        return !isStructuralImg(im);
      }) || qAll(host, "img")[0];
      var imgEl = cloneImg(img);
      if (imgEl) section.appendChild(imgEl);
      else warn("hero: portrait photo not found");
      var content = document.createElement("div");
      content.className = "hero-content";
      var eyebrow = qAll(host, "p, span, div").find(function(p) {
        return /^accessibility$/i.test(textOf(p)) && p.children.length === 0;
      });
      if (eyebrow) {
        var ey = pFromText(textOf(eyebrow));
        ey.className = "eyebrow";
        content.appendChild(ey);
      } else {
        warn('hero: "ACCESSIBILITY" eyebrow not found');
      }
      content.appendChild(cloneLeaf(h1, "h1"));
      var supporting = qAll(host, "p").find(function(p) {
        var t = textOf(p);
        return t.length > 30 && !/^accessibility$/i.test(t) && t.toLowerCase() !== textOf(h1).toLowerCase() && !p.querySelector("a, button");
      });
      if (supporting) content.appendChild(cloneLeaf(supporting, "p"));
      else warn("hero: supporting paragraph not found");
      section.appendChild(content);
      return section;
    }
    function buildContent(n, headingRe, imageLeft) {
      var h2 = findHeadingByText(headingRe);
      if (!h2) {
        warn("content section " + n + " heading not found");
        return null;
      }
      var host = hostWithImage(h2, 6);
      var section = document.createElement("section");
      section.className = imageLeft ? "content-section image-left" : "content-section";
      section.setAttribute("data-section", String(n));
      var img = qAll(host, "img").find(function(im) {
        return !isStructuralImg(im);
      }) || host.querySelector("img");
      var imgEl = cloneImg(img);
      if (imgEl) section.appendChild(imgEl);
      else warn("content " + n + ": image not found");
      section.appendChild(cloneLeaf(h2, "h2"));
      var bodyParas = qAll(host, "p").filter(function(p) {
        var t = textOf(p);
        return t.length > 30 && t.toLowerCase() !== textOf(h2).toLowerCase() && !p.querySelector("a, button");
      });
      if (!bodyParas.length) warn("content " + n + ": body paragraph not found");
      bodyParas.forEach(function(p) {
        section.appendChild(cloneLeaf(p, "p"));
      });
      var cta = qAll(host, "a[href]").find(function(a2) {
        var t = textOf(a2);
        return t.length && !a2.querySelector("img") && t.toLowerCase() !== textOf(h2).toLowerCase();
      });
      if (cta) {
        var lp = document.createElement("p");
        var a = document.createElement("a");
        a.setAttribute("href", cta.getAttribute("href") || "");
        a.textContent = textOf(cta);
        lp.appendChild(a);
        section.appendChild(lp);
      } else {
        warn("content " + n + ": cta link not found");
      }
      return section;
    }
    function buildContact() {
      var eyebrow = allOf("p, span, div").find(function(p) {
        return /^contact us$/i.test(textOf(p)) && p.children.length === 0;
      });
      var h2 = findHeadingByText(/we take website accessibility seriously/i);
      if (!eyebrow && !h2) {
        warn("contact band not found");
        return null;
      }
      var host = h2 ? hostWithImage(h2, 6) : eyebrow ? eyebrow.parentElement : null;
      if (!host) host = document.body;
      var section = document.createElement("section");
      section.className = "contact-section";
      section.setAttribute("data-section", "8");
      var heading = document.createElement("div");
      heading.className = "contact-heading";
      if (eyebrow) {
        var ey = pFromText(textOf(eyebrow));
        ey.className = "eyebrow";
        heading.appendChild(ey);
      } else {
        warn('contact: "CONTACT US" eyebrow not found');
      }
      if (h2) heading.appendChild(cloneLeaf(h2, "h2"));
      section.appendChild(heading);
      var contactP = allOf("p").find(function(p) {
        return p.querySelector('a[href^="mailto:"]') && /accessibility/i.test(textOf(p));
      });
      if (contactP) {
        section.appendChild(cloneLeaf(contactP, "p"));
      } else {
        warn("contact: paragraph with phone + mailto not found");
      }
      return section;
    }
    var sections = [
      buildHero(),
      buildContent(2, /inclusive design/i, false),
      buildContent(3, /financial education and literacy/i, true),
      buildContent(4, /customer research/i, false),
      buildContent(5, /we care and give back/i, true),
      buildContent(6, /powering prosperity with aira/i, false),
      buildContent(7, /accessibility champions/i, true),
      buildContact()
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

  // tools/importer/import-accessibility.js
  var parsers = {
    "hero-company": parse,
    "columns-product": parse2
  };
  var PAGE_TEMPLATE = {
    name: "accessibility",
    description: "Intuit accessibility statement page (representative of the accessibility content template): light hero with portrait, six alternating image/text content splits, and a contact band with phone + email.",
    urls: ["https://www.intuit.com/accessibility/"],
    blocks: [
      { name: "hero-company", instances: ["section.hero-section"] },
      { name: "columns-product", instances: ["section.content-section"] },
      { name: "section-contact", instances: ["section.contact-section"], section: "light-cyan" }
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
  var import_accessibility_default = {
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
  return __toCommonJS(import_accessibility_exports);
})();
