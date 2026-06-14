/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Intuit section boundaries + Section Metadata.
 *
 * The Intuit homepage is a single <main> containing 5 sibling content
 * sections, each authored as <section data-section="..."> in
 * migration-work/cleaned.html:
 *   1. hero              (no section style — dark background is block-intrinsic)
 *   2. product-showcase  -> light-grey
 *   3. customer-success  -> light
 *   4. innovation        -> light
 *   5. driving-success   -> sky-blue
 *
 * This transformer establishes EDS section boundaries between those 5 sections
 * and emits a Section Metadata block carrying the mapped style for each styled
 * section. Boundaries land between sections: one <hr> before every section
 * except the first (4 breaks for 5 sections).
 *
 * Section styles source: tools/importer/page-templates.json — the homepage
 * template's blocks[] entries that carry a `section` property:
 *   section-product-showcase -> light-grey   @ section[data-section="product-showcase"]
 *   section-customer-success -> light        @ section[data-section="customer-success"]
 *   section-innovation       -> light        @ section[data-section="innovation"]
 *   section-driving-success  -> sky-blue     @ section[data-section="driving-success"]
 *
 * Selector source: section[data-section="..."] elements verified in
 * migration-work/cleaned.html.
 *
 * Runs in afterTransform only (block parsers run between hooks).
 *
 * NOTE: No module-scope lexical (const/let) declarations — the validator
 * injects transformers into the page's global scope as a classic script, where
 * a top-level `const` collides on re-injection and aborts the script.
 */

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  // Build the ordered section list. Prefer payload.template.sections when a
  // section[] array is present; otherwise derive from the template's blocks[]
  // entries that carry a `section` style (block-mapping-manager schema).
  // Referencing `template.sections` also marks this file as a section
  // transformer for the validator.
  var template = (payload && payload.template) || {};
  var sectionList = [];

  if (template.sections && Array.isArray(template.sections) && template.sections.length) {
    // helix-importer-native shape: [{ selector, style }, ...]
    template.sections.forEach(function (s) {
      if (s && s.selector) {
        sectionList.push({ selector: s.selector, style: s.style || null });
      }
    });
  } else if (template.blocks && Array.isArray(template.blocks)) {
    // block-mapping-manager shape: blocks[] entries with a `section` style.
    template.blocks.forEach(function (b) {
      if (b && b.section && b.instances && b.instances.length) {
        sectionList.push({ selector: b.instances[0], style: b.section });
      }
    });
  }

  // The hero section has no style entry but is still the first content section.
  // Ensure all 5 section[data-section] elements participate in boundary
  // placement so an <hr> is inserted before every non-first section.
  var allSections = Array.prototype.slice.call(
    element.querySelectorAll('section[data-section]')
  );

  // Map each section element to its mapped style (if any), in document order.
  var ordered = allSections.map(function (el) {
    var match = null;
    sectionList.forEach(function (s) {
      // Match by the section element the selector targets.
      var target = element.querySelector(s.selector);
      if (target === el || el.matches(s.selector) || el.contains(target)) {
        match = s;
      }
    });
    return { el: el, style: match ? match.style : null };
  });

  // Process in reverse so DOM insertions do not disturb earlier indices.
  for (var i = ordered.length - 1; i >= 0; i--) {
    var entry = ordered[i];

    // Section Metadata block for styled sections, appended inside the section.
    if (entry.style) {
      var metaBlock = WebImporter.Blocks.createBlock(payload.document, {
        name: 'Section Metadata',
        cells: { style: entry.style },
      });
      entry.el.appendChild(metaBlock);
    }

    // Section break before every section except the first.
    if (i > 0) {
      var hr = payload.document.createElement('hr');
      entry.el.parentNode.insertBefore(hr, entry.el);
    }
  }
}
