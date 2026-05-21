class SiteNav extends HTMLElement {
  connectedCallback() {
    const toggle = this.querySelector('.nav__toggle');
    const links  = this.querySelector('.nav__links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', false);
      }
    });
  }
}

customElements.define('site-nav', SiteNav);
