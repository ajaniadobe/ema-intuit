export default function init(el) {
  const inner = el.querySelector(':scope > div');
  inner.classList.add('card-linktile-inner');
  const pic = el.querySelector('picture');
  if (pic) {
    const picPara = pic.closest('p');
    if (picPara) {
      const picDiv = document.createElement('div');
      picDiv.className = 'card-linktile-picture-container';
      picDiv.append(pic);
      inner.insertAdjacentElement('afterbegin', picDiv);
      picPara.remove();
    }
  }
  // Decorate content
  const con = inner.querySelector(':scope > div:not([class])');
  if (con) con.classList.add('card-linktile-content-container');

  // Make the whole tile clickable using the first link found in the content.
  const link = inner.querySelector('a[href]');
  if (link) {
    const anchor = document.createElement('a');
    anchor.className = 'card-linktile-link';
    anchor.href = link.getAttribute('href');
    anchor.setAttribute('aria-label', link.textContent.trim());
    el.classList.add('card-linktile-clickable');
    inner.before(anchor);
    anchor.append(inner);
  }
}
