class ContactForm extends HTMLElement {
  connectedCallback() {
    // Datastar handles SSE submit; this hook is for any extra progressive enhancement
    const form = this.querySelector('form');
    if (!form) return;

    // Reset feedback on new input
    form.addEventListener('input', () => {
      const feedback = this.querySelector('#contact-feedback');
      if (feedback) feedback.remove();
    }, { once: true });
  }
}

customElements.define('contact-form', ContactForm);
