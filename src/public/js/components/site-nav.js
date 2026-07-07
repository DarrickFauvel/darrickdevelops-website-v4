class SiteNav extends HTMLElement {
  connectedCallback() {
    const toggle   = this.querySelector('.nav__toggle');
    const links    = this.querySelector('.nav__links');
    const qrBtn    = this.querySelector('.nav__qr');
    const modal    = this.querySelector('#qr-modal');
    const qrImg    = modal?.querySelector('.qr-modal__img');
    const qrUrl    = modal?.querySelector('.qr-modal__url');
    const closeBtn = modal?.querySelector('.qr-modal__close');

    if (toggle && links) {
      const closeMenu = () => {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', false);
      };

      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open);
      });

      links.addEventListener('click', (e) => {
        if (e.target.closest('a')) closeMenu();
      });

      document.addEventListener('click', (e) => {
        if (!this.contains(e.target)) closeMenu();
      });
    }

    if (qrBtn && modal && qrImg) {
      let closeTimer = null;

      const openModal = () => {
        clearTimeout(closeTimer);
        closeTimer = null;
        modal.classList.remove('is-closing');
        const url = window.location.origin;
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(url)}`;
        if (qrUrl) qrUrl.textContent = url;
        modal.removeAttribute('hidden');
        modal.focus();
      };

      const closeModal = () => {
        modal.classList.add('is-closing');
        closeTimer = setTimeout(() => {
          modal.setAttribute('hidden', '');
          modal.classList.remove('is-closing');
          closeTimer = null;
        }, 180);
      };

      qrBtn.addEventListener('click', openModal);
      closeBtn?.addEventListener('click', closeModal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
      });
    }
  }
}

customElements.define('site-nav', SiteNav);
